import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const runScorersData = await prisma.wplDelivery.groupBy({
      by: ['striker'],
      _sum: {
        runsOffBat: true,
      },
      _count: {
        striker: true,
      },
      where: {
        wides: {
          equals: 0,
        },
      },
    });

    const playersWithMatches = await prisma.wplDelivery.groupBy({
      by: ['striker', 'matchId'],
    });

    const matchCounts = playersWithMatches.reduce(
      (acc: Record<string, number>, { striker }) => {
        acc[striker] = (acc[striker] || 0) + 1;
        return acc;
      },
      {}
    );

    const processedData = runScorersData.map(data => {
      const runs = data._sum.runsOffBat ?? 0;
      const ballsFaced = data._count.striker;
      const matches = matchCounts[data.striker] || 0;

      return {
        player: data.striker,
        runs,
        ballsFaced,
        strikeRate: ballsFaced > 0 ? (runs / ballsFaced) * 100 : 0,
        matches,
      };
    });

    const sortedRunScorers = processedData
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 20);

    return NextResponse.json(sortedRunScorers);
  } catch (error) {
    console.error('Error fetching leading run scorers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
