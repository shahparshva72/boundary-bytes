import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    // Use raw SQL query to optimize performance and reduce connection usage
    const wicketTakerData = await prisma.$queryRaw<
      Array<{
        bowler: string;
        wickets: bigint;
        runs_conceded: bigint;
        balls_bowled: bigint;
        matches: bigint;
      }>
    >`
      SELECT 
        bowler,
        COUNT(*) FILTER (
          WHERE player_dismissed IS NOT NULL 
          AND wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket')
        ) as wickets,
        SUM(runs_off_bat + extras) as runs_conceded,
        COUNT(*) FILTER (WHERE wides = 0 AND noballs = 0) as balls_bowled,
        COUNT(DISTINCT match_id) as matches
      FROM wpl_delivery 
      GROUP BY bowler 
      HAVING COUNT(*) FILTER (
        WHERE player_dismissed IS NOT NULL 
        AND wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket')
      ) > 0
      ORDER BY wickets DESC 
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const totalWicketTakers = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(T.bowler) as count
      FROM (
        SELECT bowler
        FROM wpl_delivery
        GROUP BY bowler
        HAVING COUNT(*) FILTER (
          WHERE player_dismissed IS NOT NULL 
          AND wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket')
        ) > 0
      ) AS T
    `;

    const processedData = wicketTakerData.map(data => {
      const wickets = Number(data.wickets);
      const runsConceded = Number(data.runs_conceded);
      const ballsBowled = Number(data.balls_bowled);
      const matches = Number(data.matches);
      const overs = ballsBowled / 6;

      return {
        player: data.bowler,
        wickets,
        ballsBowled,
        economy: overs > 0 ? runsConceded / overs : 0,
        matches,
      };
    });

    return NextResponse.json({
      data: processedData,
      total: Number(totalWicketTakers[0].count),
    });
  } catch (error) {
    console.error('Error fetching leading wicket takers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}