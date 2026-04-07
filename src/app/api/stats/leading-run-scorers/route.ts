import { CACHE_TTL, getCached } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const league = validateLeague(searchParams.get('league'));
    const offset = (page - 1) * limit;

    const cacheKey = `run-scorers:${league}:${page}:${limit}`;

    const { processedData, totalCount } = await getCached(cacheKey, CACHE_TTL.SHORT, async () => {
      // Single scan of wpl_delivery: group by (striker, match_id, innings) once,
      // then aggregate everything from that CTE. The previous version scanned
      // wpl_delivery twice — once for innings_data and once for batter_stats.
      const runScorersData = await prisma.$queryRaw<
        Array<{
          striker: string;
          runs: bigint;
          balls_faced: bigint;
          matches: bigint;
          fours: bigint;
          sixes: bigint;
          dot_balls: bigint;
          fifties: bigint;
          hundreds: bigint;
          total_count: bigint;
        }>
      >`
        WITH innings_data AS (
          SELECT
            d.striker,
            d.match_id,
            SUM(d.runs_off_bat) AS innings_runs,
            COUNT(*) FILTER (WHERE d.wides = 0) AS balls_faced,
            COUNT(*) FILTER (WHERE d.runs_off_bat = 4) AS fours,
            COUNT(*) FILTER (WHERE d.runs_off_bat = 6) AS sixes,
            COUNT(*) FILTER (WHERE d.runs_off_bat = 0) AS dot_balls
          FROM wpl_delivery d
          JOIN wpl_match m ON d.match_id = m.match_id
          WHERE m.league = ${league} AND d.innings <= 2
          GROUP BY d.striker, d.match_id, d.innings
        ),
        batter_agg AS (
          SELECT
            striker,
            SUM(innings_runs) AS runs,
            SUM(balls_faced) AS balls_faced,
            COUNT(DISTINCT match_id) AS matches,
            SUM(fours) AS fours,
            SUM(sixes) AS sixes,
            SUM(dot_balls) AS dot_balls,
            COUNT(*) FILTER (WHERE innings_runs >= 50 AND innings_runs < 100) AS fifties,
            COUNT(*) FILTER (WHERE innings_runs >= 100) AS hundreds
          FROM innings_data
          GROUP BY striker
          HAVING SUM(innings_runs) > 0
        )
        SELECT
          striker, runs, balls_faced, matches, fours, sixes, dot_balls, fifties, hundreds,
          COUNT(*) OVER() AS total_count
        FROM batter_agg
        ORDER BY runs DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      const total = runScorersData.length > 0 ? Number(runScorersData[0].total_count) : 0;

      const processed = runScorersData.map((data) => {
        const runs = Number(data.runs);
        const ballsFaced = Number(data.balls_faced);
        const matches = Number(data.matches);
        const fours = Number(data.fours);
        const sixes = Number(data.sixes);
        const dotBalls = Number(data.dot_balls);
        const fifties = Number(data.fifties);
        const hundreds = Number(data.hundreds);

        return {
          player: data.striker,
          runs,
          ballsFaced,
          strikeRate: ballsFaced > 0 ? (runs / ballsFaced) * 100 : 0,
          matches,
          fours,
          sixes,
          dotBallPercentage: ballsFaced > 0 ? (dotBalls / ballsFaced) * 100 : 0,
          fifties,
          hundreds,
        };
      });

      return { processedData: processed, totalCount: total };
    });

    return NextResponse.json({
      data: processedData,
      league,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      },
      metadata: {
        availableLeagues: VALID_LEAGUES,
        totalRecords: totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching leading run scorers:', error);

    if (error instanceof Error && error.message.includes('Invalid league')) {
      return NextResponse.json(
        {
          error: error.message,
          code: 'INVALID_LEAGUE',
          availableLeagues: VALID_LEAGUES,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
