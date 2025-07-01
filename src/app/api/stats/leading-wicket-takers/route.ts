import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const bowlers = await prisma.wplDelivery.findMany({
      select: {
        bowler: true,
      },
      distinct: ['bowler'],
    });

    const wicketTakerData = await Promise.all(
      bowlers.map(async ({ bowler }) => {
        const deliveries = await prisma.wplDelivery.findMany({
          where: {
            bowler: bowler,
          },
        });

        const validWicketTypes = [
          'caught',
          'bowled',
          'lbw',
          'stumped',
          'caught and bowled',
          'hit wicket',
        ];

        const wickets = deliveries.filter(
          (d) => d.playerDismissed && validWicketTypes.includes(d.wicketType || '')
        ).length;

        const runsConceded = deliveries.reduce(
          (acc, d) => acc + d.runsOffBat + d.extras,
          0
        );
        
        const ballsBowled = deliveries.filter(d => d.wides === 0 && d.noballs === 0).length;
        const matches = new Set(deliveries.map(d => d.matchId)).size;
        const overs = ballsBowled / 6;

        return {
          player: bowler,
          wickets,
          ballsBowled,
          economy: overs > 0 ? runsConceded / overs : 0,
          matches,
        };
      })
    );

    const sortedWicketTakers = wicketTakerData
      .filter(b => b.wickets > 0)
      .sort((a, b) => b.wickets - a.wickets)
      .slice(0, 20);

    return NextResponse.json(sortedWicketTakers);
  } catch (error) {
    console.error('Error fetching leading wicket takers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
