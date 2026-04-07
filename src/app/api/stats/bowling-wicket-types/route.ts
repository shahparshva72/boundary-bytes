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

    const cacheKey = `bowling-wicket-types:${league}:${page}:${limit}`;

    const { processedData, totalCount } = await getCached(cacheKey, CACHE_TTL.SHORT, async () => {
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
          total_count: bigint;
        }>
      >`
        WITH bowler_wicket_stats AS (
          SELECT
            d.bowler,
            COUNT(*) FILTER (WHERE d.wicket_type = 'caught') as caught,
            COUNT(*) FILTER (WHERE d.wicket_type = 'bowled') as bowled,
            COUNT(*) FILTER (WHERE d.wicket_type = 'lbw') as lbw,
            COUNT(*) FILTER (WHERE d.wicket_type = 'stumped') as stumped,
            COUNT(*) FILTER (WHERE d.wicket_type = 'caught and bowled') as caught_and_bowled,
            COUNT(*) FILTER (WHERE d.wicket_type = 'hit wicket') as hit_wicket,
            COUNT(*) FILTER (
              WHERE d.player_dismissed IS NOT NULL
              AND d.wicket_type IN (${bowlerCreditedWicketTypesSql})
            ) as total_wickets,
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
          bowler, caught, bowled, lbw, stumped, caught_and_bowled, hit_wicket,
          total_wickets, matches,
          COUNT(*) OVER() AS total_count
        FROM bowler_wicket_stats
        ORDER BY total_wickets DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      const total =
        bowlingWicketTypesData.length > 0 ? Number(bowlingWicketTypesData[0].total_count) : 0;

      const processed = bowlingWicketTypesData.map((data) => ({
        player: data.bowler,
        totalWickets: Number(data.total_wickets),
        wicketTypes: {
          caught: Number(data.caught),
          bowled: Number(data.bowled),
          lbw: Number(data.lbw),
          stumped: Number(data.stumped),
          caughtAndBowled: Number(data.caught_and_bowled),
          hitWicket: Number(data.hit_wicket),
        },
        matches: Number(data.matches),
      }));

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
    console.error('Error fetching bowling wicket types:', error);

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
