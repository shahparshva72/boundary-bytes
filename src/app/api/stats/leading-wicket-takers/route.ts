import { CACHE_TTL, getCached } from '@/lib/cache';
import { bowlerCreditedWicketTypesSql } from '@/lib/constants/wicket-types';
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

    const cacheKey = `wicket-takers:${league}:${page}:${limit}`;

    const { processedData, totalCount } = await getCached(cacheKey, CACHE_TTL.SHORT, async () => {
      const wicketTakerData = await prisma.$queryRaw<
        Array<{
          bowler: string;
          wickets: bigint;
          runs_conceded: bigint;
          balls_bowled: bigint;
          matches: bigint;
          total_count: bigint;
        }>
      >`
        WITH bowler_stats AS (
          SELECT
            d.bowler,
            COUNT(*) FILTER (
              WHERE d.player_dismissed IS NOT NULL
              AND d.wicket_type IN (${bowlerCreditedWicketTypesSql})
            ) as wickets,
            SUM(d.runs_off_bat + d.wides + d.noballs) as runs_conceded,
            COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0) as balls_bowled,
            COUNT(DISTINCT d.match_id) as matches
          FROM wpl_delivery d
          JOIN wpl_match m ON d.match_id = m.match_id
          WHERE m.league = ${league} AND d.innings <= 2
          GROUP BY d.bowler
          HAVING COUNT(*) FILTER (
            WHERE d.player_dismissed IS NOT NULL
            AND d.wicket_type IN (${bowlerCreditedWicketTypesSql})
          ) > 0
        )
        SELECT
          bowler, wickets, runs_conceded, balls_bowled, matches,
          COUNT(*) OVER() AS total_count
        FROM bowler_stats
        ORDER BY wickets DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      const total = wicketTakerData.length > 0 ? Number(wicketTakerData[0].total_count) : 0;

      const processed = wicketTakerData.map((data) => {
        const wickets = Number(data.wickets);
        const runsConceded = Number(data.runs_conceded);
        const ballsBowled = Number(data.balls_bowled);
        const matches = Number(data.matches);
        const overs = ballsBowled / 6;

        return {
          player: data.bowler,
          wickets,
          runsConceded,
          average: wickets > 0 ? runsConceded / wickets : 0,
          ballsBowled,
          economy: overs > 0 ? runsConceded / overs : 0,
          matches,
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
    console.error('Error fetching leading wicket takers:', error);

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
