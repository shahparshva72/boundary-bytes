import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Valid league values
const VALID_LEAGUES = ['WPL', 'IPL'] as const;
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
        d.bowler,
        COUNT(*) FILTER (
          WHERE d.player_dismissed IS NOT NULL
          AND d.wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket')
        ) as wickets,
        SUM(d.runs_off_bat + d.extras) as runs_conceded,
        COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0) as balls_bowled,
        COUNT(DISTINCT d.match_id) as matches
      FROM wpl_delivery d
      JOIN wpl_match m ON d.match_id = m.match_id
      WHERE m.league = ${league}
      GROUP BY d.bowler
      HAVING COUNT(*) FILTER (
        WHERE d.player_dismissed IS NOT NULL
        AND d.wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket')
      ) > 0
      ORDER BY wickets DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const totalWicketTakers = await prisma.$queryRaw<[{ count: bigint }]>`
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

    const processedData = wicketTakerData.map((data) => {
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
      league,
      pagination: {
        total: Number(totalWicketTakers[0].count),
        pages: Math.ceil(Number(totalWicketTakers[0].count) / limit),
        currentPage: page,
        limit,
      },
      metadata: {
        availableLeagues: VALID_LEAGUES,
        totalRecords: Number(totalWicketTakers[0].count),
      },
    });
  } catch (error) {
    console.error('Error fetching leading wicket takers:', error);

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
