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
        fifties: bigint;
        hundreds: bigint;
      }>
    >`
      WITH innings_data AS (
        SELECT
          d.striker,
          d.match_id,
          d.innings,
          SUM(d.runs_off_bat) as innings_runs
        FROM wpl_delivery d
        JOIN wpl_match m ON d.match_id = m.match_id
        WHERE m.league = ${league} AND d.innings <= 2
        GROUP BY d.striker, d.match_id, d.innings
      ),
      innings_agg AS (
        SELECT
          striker,
          COUNT(*) FILTER (WHERE innings_runs >= 50 AND innings_runs < 100) as fifties,
          COUNT(*) FILTER (WHERE innings_runs >= 100) as hundreds
        FROM innings_data
        GROUP BY striker
      )
      SELECT
        d.striker,
        SUM(d.runs_off_bat) as runs,
        COUNT(*) FILTER (WHERE d.wides = 0) as balls_faced,
        COUNT(DISTINCT d.match_id) as matches,
        COUNT(*) FILTER (WHERE d.runs_off_bat = 4) as fours,
        COUNT(*) FILTER (WHERE d.runs_off_bat = 6) as sixes,
        COUNT(*) FILTER (WHERE d.runs_off_bat = 0) as dot_balls,
        COALESCE(ia.fifties, 0) as fifties,
        COALESCE(ia.hundreds, 0) as hundreds
      FROM wpl_delivery d
      JOIN wpl_match m ON d.match_id = m.match_id
      LEFT JOIN innings_agg ia ON d.striker = ia.striker
      WHERE m.league = ${league} AND d.innings <= 2
      GROUP BY d.striker, ia.fifties, ia.hundreds
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
