import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    // Use raw SQL query to optimize performance and reduce connection usage
    const bowlingWicketTypesData = await prisma.$queryRaw<
      Array<{
        bowler: string;
        caught: bigint;
        bowled: bigint;
        lbw: bigint;
        stumped: bigint;
        caught_and_bowled: bigint;
        hit_wicket: bigint;
        total_wickets: bigint;
        matches: bigint;
      }>
    >`
      SELECT
        bowler,
        COUNT(*) FILTER (WHERE wicket_type = 'caught') as caught,
        COUNT(*) FILTER (WHERE wicket_type = 'bowled') as bowled,
        COUNT(*) FILTER (WHERE wicket_type = 'lbw') as lbw,
        COUNT(*) FILTER (WHERE wicket_type = 'stumped') as stumped,
        COUNT(*) FILTER (WHERE wicket_type = 'caught and bowled') as caught_and_bowled,
        COUNT(*) FILTER (WHERE wicket_type = 'hit wicket') as hit_wicket,
        COUNT(*) FILTER (
          WHERE player_dismissed IS NOT NULL
          AND wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket')
        ) as total_wickets,
        COUNT(DISTINCT match_id) as matches
      FROM wpl_delivery
      GROUP BY bowler
      HAVING COUNT(*) FILTER (
        WHERE player_dismissed IS NOT NULL
        AND wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket')
      ) > 0
      ORDER BY total_wickets DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const totalBowlers = await prisma.$queryRaw<[{ count: bigint }]>`
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

    const processedData = bowlingWicketTypesData.map((data) => {
      const totalWickets = Number(data.total_wickets);
      const matches = Number(data.matches);

      return {
        player: data.bowler,
        totalWickets,
        wicketTypes: {
          caught: Number(data.caught),
          bowled: Number(data.bowled),
          lbw: Number(data.lbw),
          stumped: Number(data.stumped),
          caughtAndBowled: Number(data.caught_and_bowled),
          hitWicket: Number(data.hit_wicket),
        },
        matches,
      };
    });

    return NextResponse.json({
      data: processedData,
      total: Number(totalBowlers[0].count),
    });
  } catch (error) {
    console.error('Error fetching bowling wicket types:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
