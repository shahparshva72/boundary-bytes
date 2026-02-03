import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { STANDARDIZED_BATTING_TEAM_SQL } from '@/lib/team-standardization';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { NextRequest, NextResponse } from 'next/server';

interface TrendRow {
  season: string;
  total_runs: bigint;
  total_balls: bigint;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const team = searchParams.get('team');
    const league = validateLeague(searchParams.get('league'));

    const teamFilter = team
      ? Prisma.sql`
      AND ${STANDARDIZED_BATTING_TEAM_SQL} = ${team}
    `
      : Prisma.empty;

    const seasonFloor = league === 'IPL' ? Prisma.sql`AND m.season >= '2008'` : Prisma.empty;

    const trendData = await prisma.$queryRaw<TrendRow[]>`
      SELECT
        m.season,
        SUM(d.runs_off_bat + d.extras) AS total_runs,
        SUM(CASE WHEN d.wides = 0 OR d.wides IS NULL THEN 1 ELSE 0 END) AS total_balls
      FROM wpl_delivery d
      JOIN wpl_match m ON d.match_id = m.match_id
      WHERE d.innings <= 2
        AND m.league = ${league}
        ${seasonFloor}
        ${teamFilter}
      GROUP BY m.season
      ORDER BY m.season ASC
    `;

    const data = trendData.map((row) => {
      const totalRuns = Number(row.total_runs);
      const totalBalls = Number(row.total_balls);
      const overs = totalBalls / 6;
      const avgRunRate = overs > 0 ? totalRuns / overs : 0;
      return {
        season: row.season,
        avgRunRate: Number(avgRunRate.toFixed(2)),
        totalRuns,
        totalBalls,
      };
    });

    return NextResponse.json({
      data,
      team: team || null,
      league,
      metadata: {
        availableLeagues: VALID_LEAGUES,
        totalSeasons: data.length,
      },
    });
  } catch (error) {
    console.error('Error fetching run rate trend:', error);

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
