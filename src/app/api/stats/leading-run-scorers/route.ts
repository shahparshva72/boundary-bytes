import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    // Use raw SQL query to optimize performance and reduce connection usage
    const runScorersData = await prisma.$queryRaw<
      Array<{
        striker: string;
        runs: bigint;
        balls_faced: bigint;
        matches: bigint;
      }>
    >`
      SELECT 
        striker,
        SUM(runs_off_bat) as runs,
        COUNT(*) FILTER (WHERE wides = 0) as balls_faced,
        COUNT(DISTINCT match_id) as matches
      FROM wpl_delivery 
      GROUP BY striker 
      HAVING SUM(runs_off_bat) > 0
      ORDER BY SUM(runs_off_bat) DESC 
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const totalRunScorers = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(T.striker) as count
      FROM (
        SELECT striker
        FROM wpl_delivery 
        GROUP BY striker 
        HAVING SUM(runs_off_bat) > 0
      ) AS T
    `;

    const processedData = runScorersData.map((data) => {
      const runs = Number(data.runs);
      const ballsFaced = Number(data.balls_faced);
      const matches = Number(data.matches);

      return {
        player: data.striker,
        runs,
        ballsFaced,
        strikeRate: ballsFaced > 0 ? (runs / ballsFaced) * 100 : 0,
        matches,
      };
    });

    return NextResponse.json({
      data: processedData,
      total: Number(totalRunScorers[0].count),
    });
  } catch (error) {
    console.error('Error fetching leading run scorers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
