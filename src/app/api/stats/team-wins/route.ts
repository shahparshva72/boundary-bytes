import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Valid league values
const VALID_LEAGUES = ['WPL', 'IPL', 'BBL'] as const;
type League = (typeof VALID_LEAGUES)[number];

function validateLeague(league: string | null): League {
  if (!league) return 'WPL'; // Default to WPL for backward compatibility
  if (VALID_LEAGUES.includes(league as League)) {
    return league as League;
  }
  throw new Error(`Invalid league: ${league}. Valid leagues are: ${VALID_LEAGUES.join(', ')}`);
}

// GET /api/stats/team-wins
// Returns aggregated win / loss statistics for each team.
//
// The aggregation is calculated purely inside Postgres using a raw SQL query so
// that we only open a single connection and avoid pulling large result sets
// into the application layer.
//
// A team is considered to have won a match if it scored more runs than the
// opposition. Runs are calculated as runs_off_bat + extras for every delivery.
// A win is categorised as "batting_first" if the team wins while playing the
// first innings, otherwise it is "batting_second".
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = validateLeague(searchParams.get('league'));
    /*
      Explanation of the SQL:
      1. runs_per_innings – Total runs for every (match, innings, team).
      2. match_totals      – Pivot the two innings of the same match onto the
                             same row so that we can easily compare them.
      3. winners           – Identify winner, loser and win_type for each match.
      4. final SELECT      – Aggregate win / loss counts for each team.
    */
    const results = await prisma.$queryRaw<
      Array<{
        team: string;
        matches_played: bigint;
        wins: bigint;
        losses: bigint;
        wins_batting_first: bigint;
        wins_batting_second: bigint;
      }>
    >`
WITH delivery_std AS (
        SELECT
          d.*,
          CASE
            WHEN d.batting_team = 'Royal Challengers Bengaluru' THEN 'Royal Challengers Bangalore'
            WHEN d.batting_team = 'Delhi Daredevils' THEN 'Delhi Capitals'
            WHEN d.batting_team = 'Kings XI Punjab' THEN 'Punjab Kings'
            WHEN d.batting_team = 'Rising Pune Supergiants' THEN 'Rising Pune Supergiant'
            ELSE d.batting_team
          END AS std_batting_team
        FROM wpl_delivery d
        JOIN wpl_match m ON d.match_id = m.match_id
        WHERE m.league = ${league} AND d.innings <= 2
      ),
      runs_per_innings AS (
        SELECT
          match_id,
          innings,
          std_batting_team   AS team,
          SUM(runs_off_bat + extras) AS runs
        FROM delivery_std
        GROUP BY match_id, innings, std_batting_team
      ),
      match_totals AS (
        SELECT
          r1.match_id,
          r1.team       AS team1,
          r1.runs       AS runs1,
          r2.team       AS team2,
          r2.runs       AS runs2
        FROM runs_per_innings r1
        JOIN runs_per_innings r2
          ON r1.match_id = r2.match_id
         AND r1.innings = 1
         AND r2.innings = 2
      ),
      winners AS (
        SELECT
          match_id,
          CASE WHEN runs1 > runs2 THEN team1 ELSE team2 END AS winner,
          CASE WHEN runs1 > runs2 THEN team2 ELSE team1 END AS loser,
          CASE WHEN runs1 > runs2 THEN 'batting_first' ELSE 'batting_second' END AS win_type
        FROM match_totals
      ),
      teams AS (
        SELECT match_id, team1 AS team FROM match_totals
        UNION ALL
        SELECT match_id, team2 AS team FROM match_totals
      )
      SELECT
        t.team,
        COUNT(*)                                      AS matches_played,
        COUNT(*) FILTER (WHERE t.team = w.winner)     AS wins,
        COUNT(*) FILTER (WHERE t.team <> w.winner)    AS losses,
        COUNT(*) FILTER (
          WHERE t.team = w.winner AND w.win_type = 'batting_first'
        ) AS wins_batting_first,
        COUNT(*) FILTER (
          WHERE t.team = w.winner AND w.win_type = 'batting_second'
        ) AS wins_batting_second
      FROM teams t
      LEFT JOIN winners w USING (match_id)
      GROUP BY t.team
      ORDER BY wins DESC, matches_played DESC;
    `;

    // Convert bigint columns to number before sending to the client
    const data = results.map((row) => ({
      team: row.team,
      matchesPlayed: Number(row.matches_played),
      wins: Number(row.wins),
      losses: Number(row.losses),
      winsBattingFirst: Number(row.wins_batting_first),
      winsBattingSecond: Number(row.wins_batting_second),
    }));

    return NextResponse.json({
      data,
      league,
      metadata: {
        availableLeagues: VALID_LEAGUES,
        totalTeams: data.length,
      },
    });
  } catch (error) {
    console.error('[team-wins] Failed to fetch team win stats', error);

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
