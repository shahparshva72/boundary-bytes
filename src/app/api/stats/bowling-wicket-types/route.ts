import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Valid league values
const VALID_LEAGUES = ['WPL', 'IPL', 'BBL', 'WBBL', 'SA20'] as const;
type League = (typeof VALID_LEAGUES)[number];

function validateLeague(league: string | null): League {
  if (!league) return 'WPL'; // Default to WPL for backward compatibility
  if (VALID_LEAGUES.includes(league as League)) {
    return league as League;
  }
  throw new Error(`Invalid league: ${league}. Valid leagues are: ${VALID_LEAGUES.join(', ')}`);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const league = validateLeague(searchParams.get('league'));
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
        d.bowler,
        COUNT(*) FILTER (WHERE d.wicket_type = 'caught') as caught,
        COUNT(*) FILTER (WHERE d.wicket_type = 'bowled') as bowled,
        COUNT(*) FILTER (WHERE d.wicket_type = 'lbw') as lbw,
        COUNT(*) FILTER (WHERE d.wicket_type = 'stumped') as stumped,
        COUNT(*) FILTER (WHERE d.wicket_type = 'caught and bowled') as caught_and_bowled,
        COUNT(*) FILTER (WHERE d.wicket_type = 'hit wicket') as hit_wicket,
        COUNT(*) FILTER (
          WHERE d.player_dismissed IS NOT NULL
          AND d.wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket')
        ) as total_wickets,
        COUNT(DISTINCT d.match_id) as matches
      FROM wpl_delivery d
      JOIN wpl_match m ON d.match_id = m.match_id
      WHERE m.league = ${league} AND d.innings <= 2
      GROUP BY d.bowler
      HAVING COUNT(*) FILTER (
        WHERE d.player_dismissed IS NOT NULL
        AND d.wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket')
      ) > 0
      ORDER BY total_wickets DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const totalBowlers = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(T.bowler) as count
      FROM (
        SELECT d.bowler
        FROM wpl_delivery d
        JOIN wpl_match m ON d.match_id = m.match_id
        WHERE m.league = ${league}
        GROUP BY d.bowler
        HAVING COUNT(*) FILTER (
          WHERE d.player_dismissed IS NOT NULL
          AND d.wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket')
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
      league,
      pagination: {
        total: Number(totalBowlers[0].count),
        pages: Math.ceil(Number(totalBowlers[0].count) / limit),
        currentPage: page,
        limit,
      },
      metadata: {
        availableLeagues: VALID_LEAGUES,
        totalRecords: Number(totalBowlers[0].count),
      },
    });
  } catch (error) {
    console.error('Error fetching bowling wicket types:', error);

    // Handle league validation errors
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
