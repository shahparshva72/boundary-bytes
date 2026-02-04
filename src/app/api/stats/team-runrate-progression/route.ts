import { prisma } from '@/lib/prisma';
import { STANDARDIZED_BATTING_TEAM_SQL } from '@/lib/team-standardization';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { NextRequest, NextResponse } from 'next/server';

interface ProgressionPoint {
  over: number;
  phase: 'powerplay' | 'middle' | 'death';
  runs: number;
  balls: number;
  runRate: number;
}

interface AggregatedOverData {
  over_number: number;
  runs: bigint;
  balls: bigint;
}

interface MetadataResult {
  total_innings: bigint;
  total_matches: bigint;
  total_deliveries: bigint;
}

function phaseForOver(over: number): ProgressionPoint['phase'] {
  if (over <= 6) {
    return 'powerplay';
  }
  if (over <= 15) {
    return 'middle';
  }
  return 'death';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const team = searchParams.get('team');
    const season = searchParams.get('season');
    const league = validateLeague(searchParams.get('league'));

    if (!team || !season) {
      return NextResponse.json({ error: 'Team and season are required' }, { status: 400 });
    }

    const aggregatedData = await prisma.$queryRaw<AggregatedOverData[]>`
      WITH standardized_deliveries AS (
        SELECT
          ${STANDARDIZED_BATTING_TEAM_SQL} as team,
          d.match_id,
          d.innings,
          d.ball,
          d.runs_off_bat,
          d.extras,
          d.wides
        FROM wpl_delivery d
        JOIN wpl_match m ON d.match_id = m.match_id
        WHERE d.innings <= 2
          AND m.league = ${league}
          AND m.season = ${season}
      )
      SELECT 
        FLOOR(CAST(ball AS DECIMAL(10,2)))::int + 1 AS over_number,
        SUM(runs_off_bat + extras) AS runs,
        SUM(CASE WHEN wides = 0 OR wides IS NULL THEN 1 ELSE 0 END) AS balls
      FROM standardized_deliveries
      WHERE team = ${team}
        AND FLOOR(CAST(ball AS DECIMAL(10,2)))::int + 1 BETWEEN 1 AND 20
      GROUP BY over_number
      ORDER BY over_number
    `;

    const metadata = await prisma.$queryRaw<MetadataResult[]>`
      WITH standardized_deliveries AS (
        SELECT
          ${STANDARDIZED_BATTING_TEAM_SQL} as team,
          d.match_id,
          d.innings
        FROM wpl_delivery d
        JOIN wpl_match m ON d.match_id = m.match_id
        WHERE d.innings <= 2
          AND m.league = ${league}
          AND m.season = ${season}
      )
      SELECT 
        COUNT(DISTINCT CONCAT(match_id, '-', innings)) AS total_innings,
        COUNT(DISTINCT match_id) AS total_matches,
        COUNT(*) AS total_deliveries
      FROM standardized_deliveries
      WHERE team = ${team}
    `;

    const overDataMap = new Map<number, { runs: number; balls: number }>();
    for (const row of aggregatedData) {
      overDataMap.set(Number(row.over_number), {
        runs: Number(row.runs),
        balls: Number(row.balls),
      });
    }

    const progressionData: ProgressionPoint[] = [];
    for (let over = 1; over <= 20; over++) {
      const { runs, balls } = overDataMap.get(over) ?? {
        runs: 0,
        balls: 0,
      };
      const overs = balls / 6;
      const runRate = overs > 0 ? runs / overs : 0;

      progressionData.push({
        over,
        phase: phaseForOver(over),
        runs,
        balls,
        runRate: Number(runRate.toFixed(2)),
      });
    }

    const meta = metadata[0] ?? {
      total_innings: BigInt(0),
      total_matches: BigInt(0),
      total_deliveries: BigInt(0),
    };

    return NextResponse.json({
      data: progressionData,
      team,
      season,
      league,
      metadata: {
        totalInnings: Number(meta.total_innings),
        totalMatches: Number(meta.total_matches),
        totalDeliveries: Number(meta.total_deliveries),
        availableLeagues: VALID_LEAGUES,
      },
    });
  } catch (error) {
    console.error('Error fetching team run rate progression:', error);

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
