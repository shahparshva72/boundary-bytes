import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { NextRequest, NextResponse } from 'next/server';

interface ProgressionPoint {
  over: number;
  phase: 'powerplay' | 'middle' | 'death';
  runs: number;
  balls: number;
  dismissals: number;
  strikeRate: number;
  average: number | null;
}

interface AggregatedOverData {
  over_number: number;
  runs: bigint;
  balls: bigint;
  dismissals: bigint;
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
    const player = searchParams.get('player');
    const league = validateLeague(searchParams.get('league'));
    const inningsFilter = searchParams.get('innings');

    if (!player) {
      return NextResponse.json({ error: 'Player is required' }, { status: 400 });
    }

    const inningsCondition =
      inningsFilter === '1' || inningsFilter === '2'
        ? Prisma.sql`AND d.innings = ${parseInt(inningsFilter)}`
        : Prisma.sql`AND d.innings <= 2`;

    const aggregatedData = await prisma.$queryRaw<AggregatedOverData[]>`
      SELECT 
        FLOOR(CAST(d.ball AS DECIMAL(10,2)))::int + 1 AS over_number,
        SUM(d.runs_off_bat) AS runs,
        SUM(CASE WHEN d.wides = 0 OR d.wides IS NULL THEN 1 ELSE 0 END) AS balls,
        SUM(CASE WHEN d.player_dismissed = ${player} THEN 1 ELSE 0 END) AS dismissals
      FROM wpl_delivery d
      JOIN wpl_match m ON d.match_id = m.match_id
      WHERE d.striker = ${player}
        AND m.league = ${league}
        ${inningsCondition}
        AND FLOOR(CAST(d.ball AS DECIMAL(10,2)))::int + 1 BETWEEN 1 AND 20
      GROUP BY FLOOR(CAST(d.ball AS DECIMAL(10,2)))::int + 1
      ORDER BY over_number
    `;

    const metadata = await prisma.$queryRaw<MetadataResult[]>`
      SELECT 
        COUNT(DISTINCT CONCAT(d.match_id, '-', d.innings)) AS total_innings,
        COUNT(DISTINCT d.match_id) AS total_matches,
        COUNT(*) AS total_deliveries
      FROM wpl_delivery d
      JOIN wpl_match m ON d.match_id = m.match_id
      WHERE d.striker = ${player}
        AND m.league = ${league}
        ${inningsCondition}
    `;

    const overDataMap = new Map<number, { runs: number; balls: number; dismissals: number }>();
    for (const row of aggregatedData) {
      overDataMap.set(Number(row.over_number), {
        runs: Number(row.runs),
        balls: Number(row.balls),
        dismissals: Number(row.dismissals),
      });
    }

    const progressionData: ProgressionPoint[] = [];
    for (let over = 1; over <= 20; over++) {
      const { runs, balls, dismissals } = overDataMap.get(over) ?? {
        runs: 0,
        balls: 0,
        dismissals: 0,
      };

      const strikeRate = balls > 0 ? (runs / balls) * 100 : 0;
      const average = dismissals > 0 ? runs / dismissals : null;

      progressionData.push({
        over,
        phase: phaseForOver(over),
        runs,
        balls,
        dismissals,
        strikeRate: Number(strikeRate.toFixed(2)),
        average: average !== null ? Number(average.toFixed(2)) : null,
      });
    }

    const meta = metadata[0] ?? {
      total_innings: BigInt(0),
      total_matches: BigInt(0),
      total_deliveries: BigInt(0),
    };

    return NextResponse.json({
      data: progressionData,
      player,
      league,
      innings: inningsFilter || null,
      metadata: {
        totalInnings: Number(meta.total_innings),
        totalMatches: Number(meta.total_matches),
        totalDeliveries: Number(meta.total_deliveries),
        availableLeagues: VALID_LEAGUES,
      },
    });
  } catch (error) {
    console.error('Error fetching player progression:', error);

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
