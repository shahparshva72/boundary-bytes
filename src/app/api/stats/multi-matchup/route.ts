import { prisma } from '@/lib/prisma';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { NextResponse } from 'next/server';

type MultiMatchupResult = {
  opponent: string;
  runsScored: number;
  ballsFaced: number;
  dismissals: number;
  strikeRate: number;
  economyRate: number;
  average: number;
  fours: number;
  sixes: number;
  dotBalls: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const player = searchParams.get('player');
  const opponentsParam = searchParams.get('opponents');
  const mode = searchParams.get('mode') as 'batterVsBowlers' | 'bowlerVsBatters';
  const league = validateLeague(searchParams.get('league'));

  if (!player) {
    return NextResponse.json({ error: 'Player is required' }, { status: 400 });
  }

  if (!opponentsParam) {
    return NextResponse.json({ error: 'At least one opponent is required' }, { status: 400 });
  }

  if (!mode || !['batterVsBowlers', 'bowlerVsBatters'].includes(mode)) {
    return NextResponse.json(
      { error: 'Mode must be either "batterVsBowlers" or "bowlerVsBatters"' },
      { status: 400 },
    );
  }

  const opponents = opponentsParam.split(',').map((o) => o.trim());

  if (opponents.length > 5) {
    return NextResponse.json({ error: 'Maximum 5 opponents allowed' }, { status: 400 });
  }

  try {
    let results: MultiMatchupResult[];

    if (mode === 'batterVsBowlers') {
      results = await prisma.$queryRaw<MultiMatchupResult[]>`
        SELECT
          d.bowler as "opponent",
          COALESCE(SUM(d.runs_off_bat), 0)::int as "runsScored",
          COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0)::int as "ballsFaced",
          COUNT(CASE WHEN d.player_dismissed = ${player} THEN 1 END)::int as "dismissals",
          CASE
            WHEN COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0) > 0 
            THEN ROUND((COALESCE(SUM(d.runs_off_bat), 0)::numeric / COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0)) * 100, 2)
            ELSE 0
          END as "strikeRate",
          0 as "economyRate",
          CASE
            WHEN COUNT(CASE WHEN d.player_dismissed = ${player} THEN 1 END) > 0
            THEN ROUND(COALESCE(SUM(d.runs_off_bat), 0)::numeric / COUNT(CASE WHEN d.player_dismissed = ${player} THEN 1 END), 2)
            ELSE COALESCE(SUM(d.runs_off_bat), 0)::numeric
          END as "average",
          COUNT(CASE WHEN d.runs_off_bat = 4 THEN 1 END)::int as "fours",
          COUNT(CASE WHEN d.runs_off_bat = 6 THEN 1 END)::int as "sixes",
          0 as "dotBalls"
        FROM wpl_delivery d
        JOIN wpl_match m ON d.match_id = m.match_id
        WHERE d.striker = ${player} 
          AND d.bowler = ANY(${opponents}::text[])
          AND m.league = ${league} 
          AND d.innings <= 2
        GROUP BY d.bowler
        ORDER BY "runsScored" DESC
      `;
    } else {
      results = await prisma.$queryRaw<MultiMatchupResult[]>`
        SELECT
          d.striker as "opponent",
          COALESCE(SUM(d.runs_off_bat), 0)::int as "runsScored",
          COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0)::int as "ballsFaced",
          COUNT(CASE WHEN d.player_dismissed IS NOT NULL THEN 1 END)::int as "dismissals",
          0 as "strikeRate",
          CASE
            WHEN COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0) > 0 
            THEN ROUND((COALESCE(SUM(d.runs_off_bat), 0)::numeric / (COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0)::numeric / 6)), 2)
            ELSE 0
          END as "economyRate",
          CASE
            WHEN COUNT(CASE WHEN d.player_dismissed IS NOT NULL THEN 1 END) > 0
            THEN ROUND(COALESCE(SUM(d.runs_off_bat), 0)::numeric / COUNT(CASE WHEN d.player_dismissed IS NOT NULL THEN 1 END), 2)
            ELSE COALESCE(SUM(d.runs_off_bat), 0)::numeric
          END as "average",
          COUNT(CASE WHEN d.runs_off_bat = 4 THEN 1 END)::int as "fours",
          COUNT(CASE WHEN d.runs_off_bat = 6 THEN 1 END)::int as "sixes",
          COUNT(CASE WHEN d.runs_off_bat = 0 AND d.extras = 0 THEN 1 END)::int as "dotBalls"
        FROM wpl_delivery d
        JOIN wpl_match m ON d.match_id = m.match_id
        WHERE d.bowler = ${player} 
          AND d.striker = ANY(${opponents}::text[])
          AND m.league = ${league} 
          AND d.innings <= 2
        GROUP BY d.striker
        ORDER BY "dismissals" DESC, "economyRate" ASC
      `;
    }

    const formattedResults = results.map((r) => ({
      opponent: r.opponent,
      runsScored: r.runsScored,
      ballsFaced: r.ballsFaced,
      dismissals: r.dismissals,
      strikeRate: parseFloat(r.strikeRate.toFixed(2)),
      economyRate: parseFloat(r.economyRate.toFixed(2)),
      average: parseFloat(r.average.toFixed(2)),
      fours: r.fours,
      sixes: r.sixes,
      dotBalls: r.dotBalls,
    }));

    // Calculate combined stats across all opponents
    const combinedRuns = formattedResults.reduce((sum, r) => sum + r.runsScored, 0);
    const combinedBalls = formattedResults.reduce((sum, r) => sum + r.ballsFaced, 0);
    const combinedDismissals = formattedResults.reduce((sum, r) => sum + r.dismissals, 0);
    const combinedFours = formattedResults.reduce((sum, r) => sum + r.fours, 0);
    const combinedSixes = formattedResults.reduce((sum, r) => sum + r.sixes, 0);
    const combinedDotBalls = formattedResults.reduce((sum, r) => sum + r.dotBalls, 0);
    const combinedStrikeRate = combinedBalls > 0 ? (combinedRuns / combinedBalls) * 100 : 0;
    const combinedEconomyRate = combinedBalls > 0 ? combinedRuns / (combinedBalls / 6) : 0;
    const combinedAverage =
      combinedDismissals > 0 ? combinedRuns / combinedDismissals : combinedRuns;

    const combined = {
      runsScored: combinedRuns,
      ballsFaced: combinedBalls,
      dismissals: combinedDismissals,
      strikeRate: parseFloat(combinedStrikeRate.toFixed(2)),
      economyRate: parseFloat(combinedEconomyRate.toFixed(2)),
      average: parseFloat(combinedAverage.toFixed(2)),
      fours: combinedFours,
      sixes: combinedSixes,
      dotBalls: combinedDotBalls,
    };

    return NextResponse.json({
      data: formattedResults,
      combined,
      league,
      player,
      mode,
      opponents,
      metadata: {
        availableLeagues: VALID_LEAGUES,
        resultCount: formattedResults.length,
      },
    });
  } catch (error) {
    console.error('Error fetching multi-matchup stats:', error);

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
