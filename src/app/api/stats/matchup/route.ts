import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

  if (!batter || !bowler) {
    return NextResponse.json({ error: 'Batter and bowler are required' }, { status: 400 });
  }

  try {
    const result = await prisma.$queryRaw<MatchupStats[]>`
      SELECT
        COALESCE(SUM(runs_off_bat), 0)::int as "runsScored",
        COUNT(*)::int as "ballsFaced",
        COUNT(CASE WHEN player_dismissed = ${batter} THEN 1 END)::int as "dismissals",
        CASE
          WHEN COUNT(*) > 0 THEN ROUND((COALESCE(SUM(runs_off_bat), 0)::numeric / COUNT(*)) * 100, 2)
          ELSE 0
        END as "strikeRate",
        CASE
          WHEN COUNT(CASE WHEN player_dismissed = ${batter} THEN 1 END) > 0
          THEN ROUND(COALESCE(SUM(runs_off_bat), 0)::numeric / COUNT(CASE WHEN player_dismissed = ${batter} THEN 1 END), 2)
          ELSE COALESCE(SUM(runs_off_bat), 0)::numeric
        END as "average"
      FROM wpl_delivery
      WHERE striker = ${batter} AND bowler = ${bowler}
    `;

    // The SQL query with aggregates and no GROUP BY is guaranteed to return exactly one row.
    const stats = result[0];

    return NextResponse.json({
      runsScored: stats.runsScored,
      ballsFaced: stats.ballsFaced,
      dismissals: stats.dismissals,
      strikeRate: stats.strikeRate.toFixed(2),
      average: stats.average.toFixed(2),
    });
  } catch (error) {
    console.error('Error fetching matchup stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
