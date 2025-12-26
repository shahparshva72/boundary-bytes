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
    const runScorersData = await prisma.$queryRaw<
      Array<{
        striker: string;
        runs: bigint;
        balls_faced: bigint;
        matches: bigint;
        fours: bigint;
        sixes: bigint;
        dot_balls: bigint;
      }>
    >`
      SELECT
        d.striker,
        SUM(d.runs_off_bat) as runs,
        COUNT(*) FILTER (WHERE d.wides = 0) as balls_faced,
        COUNT(DISTINCT d.match_id) as matches,
        COUNT(*) FILTER (WHERE d.runs_off_bat = 4) as fours,
        COUNT(*) FILTER (WHERE d.runs_off_bat = 6) as sixes,
        COUNT(*) FILTER (WHERE d.runs_off_bat = 0) as dot_balls
      FROM wpl_delivery d
      JOIN wpl_match m ON d.match_id = m.match_id
      WHERE m.league = ${league} AND d.innings <= 2
      GROUP BY d.striker
      HAVING SUM(d.runs_off_bat) > 0
      ORDER BY SUM(d.runs_off_bat) DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const totalRunScorers = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(T.striker) as count
      FROM (
        SELECT d.striker
        FROM wpl_delivery d
        JOIN wpl_match m ON d.match_id = m.match_id
        WHERE m.league = ${league}
        GROUP BY d.striker
        HAVING SUM(d.runs_off_bat) > 0
      ) AS T
    `;

    const processedData = runScorersData.map((data) => {
      const runs = Number(data.runs);
      const ballsFaced = Number(data.balls_faced);
      const matches = Number(data.matches);
      const fours = Number(data.fours);
      const sixes = Number(data.sixes);
      const dotBalls = Number(data.dot_balls);

      return {
        player: data.striker,
        runs,
        ballsFaced,
        strikeRate: ballsFaced > 0 ? (runs / ballsFaced) * 100 : 0,
        matches,
        fours,
        sixes,
        dotBallPercentage: ballsFaced > 0 ? (dotBalls / ballsFaced) * 100 : 0,
      };
    });

    return NextResponse.json({
      data: processedData,
      league,
      pagination: {
        total: Number(totalRunScorers[0].count),
        pages: Math.ceil(Number(totalRunScorers[0].count) / limit),
        currentPage: page,
        limit,
      },
      metadata: {
        availableLeagues: VALID_LEAGUES,
        totalRecords: Number(totalRunScorers[0].count),
      },
    });
  } catch (error) {
    console.error('Error fetching leading run scorers:', error);

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
