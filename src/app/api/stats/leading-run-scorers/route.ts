import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const players = await prisma.wplDelivery.findMany({
      select: {
        striker: true,
      },
      distinct: ['striker'],
    });

    const runScorersData = await Promise.all(
      players.map(async ({ striker }) => {
        const deliveries = await prisma.wplDelivery.findMany({
          where: {
            striker: striker,
          },
        });

        const runs = deliveries.reduce((acc, d) => acc + d.runsOffBat, 0);
        const ballsFaced = deliveries.filter(d => d.wides === 0).length;
        const matches = new Set(deliveries.map(d => d.matchId)).size;

        return {
          player: striker,
          runs,
          ballsFaced,
          strikeRate: ballsFaced > 0 ? (runs / ballsFaced) * 100 : 0,
          matches,
        };
      })
    );

    const sortedRunScorers = runScorersData
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 20);

    return NextResponse.json(sortedRunScorers);
  } catch (error) {
    console.error('Error fetching leading run scorers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
