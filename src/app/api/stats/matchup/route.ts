import { NextResponse } from 'next/server';
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

type MatchupStats = {
  runsScored: number;
  ballsFaced: number;
  dismissals: number;
  strikeRate: number;
  average: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const batter = searchParams.get('batter');
  const bowler = searchParams.get('bowler');
  const league = validateLeague(searchParams.get('league'));

  if (!batter || !bowler) {
    return NextResponse.json({ error: 'Batter and bowler are required' }, { status: 400 });
  }

  try {
    const result = await prisma.$queryRaw<MatchupStats[]>`
      SELECT
        COALESCE(SUM(d.runs_off_bat), 0)::int as "runsScored",
        COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0)::int as "ballsFaced",
        COUNT(CASE WHEN d.player_dismissed = ${batter} THEN 1 END)::int as "dismissals",
        CASE
          WHEN COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0) > 0 THEN ROUND((COALESCE(SUM(d.runs_off_bat), 0)::numeric / COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0)) * 100, 2)
          ELSE 0
        END as "strikeRate",
        CASE
          WHEN COUNT(CASE WHEN d.player_dismissed = ${batter} THEN 1 END) > 0
          THEN ROUND(COALESCE(SUM(d.runs_off_bat), 0)::numeric / COUNT(CASE WHEN d.player_dismissed = ${batter} THEN 1 END), 2)
          ELSE COALESCE(SUM(d.runs_off_bat), 0)::numeric
        END as "average"
      FROM wpl_delivery d
      JOIN wpl_match m ON d.match_id = m.match_id
      WHERE d.striker = ${batter} AND d.bowler = ${bowler} AND m.league = ${league} AND d.innings <= 2
    `;

    // The SQL query with aggregates and no GROUP BY is guaranteed to return exactly one row.
    const stats = result[0];

    return NextResponse.json({
      data: {
        runsScored: stats.runsScored,
        ballsFaced: stats.ballsFaced,
        dismissals: stats.dismissals,
        strikeRate: parseFloat(stats.strikeRate.toFixed(2)),
        average: parseFloat(stats.average.toFixed(2)),
      },
      league,
      batter,
      bowler,
      metadata: {
        availableLeagues: VALID_LEAGUES,
        matchupExists: stats.ballsFaced > 0,
      },
    });
  } catch (error) {
    console.error('Error fetching matchup stats:', error);

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
