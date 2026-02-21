import { bowlerCreditedWicketTypesSql } from '@/lib/constants/wicket-types';
import { prisma } from '@/lib/prisma';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { NextResponse } from 'next/server';

interface BatterAggregateRow {
  runs_scored: bigint;
  balls_faced: bigint;
  fours: bigint;
  sixes: bigint;
  dismissals: bigint;
  total_deliveries: bigint;
}

interface BowlerAggregateRow {
  runs_conceded: bigint;
  balls_bowled: bigint;
  wickets: bigint;
  dots: bigint;
  wides_count: bigint;
  noballs_count: bigint;
  total_deliveries: bigint;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const oversParam = searchParams.get('overs');
  const batter = searchParams.get('batter');
  const bowler = searchParams.get('bowler');
  const playerType = searchParams.get('playerType') || 'batter';
  const league = validateLeague(searchParams.get('league'));

  if (!oversParam) {
    return NextResponse.json({ error: 'Over numbers are required' }, { status: 400 });
  }

  if (!batter && !bowler) {
    return NextResponse.json(
      { error: 'Either batter or bowler must be specified' },
      { status: 400 },
    );
  }

  const overs = oversParam.split(',').map(Number);

  if (overs.some(isNaN)) {
    return NextResponse.json({ error: 'Invalid over numbers provided' }, { status: 400 });
  }

  try {
    if (playerType === 'batter') {
      const playerFilter = batter || '';

      const result = await prisma.$queryRaw<BatterAggregateRow[]>`
        SELECT
          COALESCE(SUM(d.runs_off_bat), 0) AS runs_scored,
          COALESCE(SUM(CASE WHEN d.wides = 0 OR d.wides IS NULL THEN 1 ELSE 0 END), 0) AS balls_faced,
          COALESCE(SUM(CASE WHEN d.runs_off_bat = 4 THEN 1 ELSE 0 END), 0) AS fours,
          COALESCE(SUM(CASE WHEN d.runs_off_bat = 6 THEN 1 ELSE 0 END), 0) AS sixes,
          COALESCE(SUM(CASE WHEN d.player_dismissed = ${playerFilter} THEN 1 ELSE 0 END), 0) AS dismissals,
          COUNT(*) AS total_deliveries
        FROM wpl_delivery d
        JOIN wpl_match m ON d.match_id = m.match_id
        WHERE d.striker = ${playerFilter}
          AND m.league = ${league}
          AND d.innings <= 2
          AND FLOOR(CAST(d.ball AS DECIMAL(10,2)))::int + 1 = ANY(${overs}::int[])
      `;

      const row = result[0];
      const runsScored = Number(row?.runs_scored ?? 0);
      const ballsFaced = Number(row?.balls_faced ?? 0);
      const fours = Number(row?.fours ?? 0);
      const sixes = Number(row?.sixes ?? 0);
      const dismissals = Number(row?.dismissals ?? 0);
      const deliveriesAnalyzed = Number(row?.total_deliveries ?? 0);

      const strikeRate = ballsFaced > 0 ? (runsScored / ballsFaced) * 100 : 0;
      const average = dismissals > 0 ? runsScored / dismissals : runsScored;

      return NextResponse.json({
        data: {
          runsScored,
          ballsFaced,
          strikeRate: parseFloat(strikeRate.toFixed(2)),
          average: parseFloat(average.toFixed(2)),
          fours,
          sixes,
          dismissals,
        },
        league,
        player: batter,
        playerType: 'batter',
        overs,
        metadata: {
          availableLeagues: VALID_LEAGUES,
          deliveriesAnalyzed,
        },
      });
    } else {
      const playerFilter = bowler || '';

      const result = await prisma.$queryRaw<BowlerAggregateRow[]>`
        SELECT
          COALESCE(SUM(d.runs_off_bat + COALESCE(d.wides, 0) + COALESCE(d.noballs, 0)), 0) AS runs_conceded,
          COALESCE(SUM(CASE WHEN d.wides = 0 OR d.wides IS NULL THEN 1 ELSE 0 END), 0) AS balls_bowled,
          COALESCE(SUM(CASE WHEN d.player_dismissed IS NOT NULL AND d.wicket_type IN (${bowlerCreditedWicketTypesSql}) THEN 1 ELSE 0 END), 0) AS wickets,
          COALESCE(SUM(CASE WHEN (d.wides = 0 OR d.wides IS NULL) AND d.runs_off_bat = 0 AND (d.extras = 0 OR d.extras IS NULL) THEN 1 ELSE 0 END), 0) AS dots,
          COALESCE(SUM(CASE WHEN d.wides > 0 THEN 1 ELSE 0 END), 0) AS wides_count,
          COALESCE(SUM(CASE WHEN d.noballs > 0 THEN 1 ELSE 0 END), 0) AS noballs_count,
          COUNT(*) AS total_deliveries
        FROM wpl_delivery d
        JOIN wpl_match m ON d.match_id = m.match_id
        WHERE d.bowler = ${playerFilter}
          AND m.league = ${league}
          AND d.innings <= 2
          AND FLOOR(CAST(d.ball AS DECIMAL(10,2)))::int + 1 = ANY(${overs}::int[])
      `;

      const row = result[0];
      const runsConceded = Number(row?.runs_conceded ?? 0);
      const ballsBowled = Number(row?.balls_bowled ?? 0);
      const wickets = Number(row?.wickets ?? 0);
      const dots = Number(row?.dots ?? 0);
      const wides = Number(row?.wides_count ?? 0);
      const noballs = Number(row?.noballs_count ?? 0);
      const deliveriesAnalyzed = Number(row?.total_deliveries ?? 0);

      const oversComputed = Math.floor(ballsBowled / 6) + (ballsBowled % 6) / 10;
      const economyRate = oversComputed > 0 ? runsConceded / oversComputed : 0;
      const average = wickets > 0 ? runsConceded / wickets : 0;
      const strikeRate = wickets > 0 ? ballsBowled / wickets : 0;

      return NextResponse.json({
        data: {
          runsConceded,
          ballsBowled,
          overs: parseFloat(oversComputed.toFixed(1)),
          wickets,
          economyRate: parseFloat(economyRate.toFixed(2)),
          average: parseFloat(average.toFixed(2)),
          strikeRate: parseFloat(strikeRate.toFixed(2)),
          dots,
          wides,
          noballs,
        },
        league,
        player: bowler,
        playerType: 'bowler',
        overs,
        metadata: {
          availableLeagues: VALID_LEAGUES,
          deliveriesAnalyzed,
        },
      });
    }
  } catch (error) {
    console.error('Error fetching advanced stats:', error);

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
