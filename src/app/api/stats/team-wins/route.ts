import { CACHE_TTL, getCached } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = validateLeague(searchParams.get('league'));

    const data = await getCached(`team-wins:${league}`, CACHE_TTL.SHORT, async () => {
      // Use wpl_match_info + wpl_team instead of scanning the entire wpl_delivery table.
      // wpl_match_info already has a `winner` column, so we don't need to recompute
      // winners from ball-by-ball data. This transforms a ~500ms full-table scan into
      // a ~20ms query on small metadata tables.
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
        WITH team_matches AS (
          SELECT
            CASE
              WHEN t.team_name = 'Royal Challengers Bengaluru' THEN 'Royal Challengers Bangalore'
              WHEN t.team_name = 'Delhi Daredevils' THEN 'Delhi Capitals'
              WHEN t.team_name = 'Kings XI Punjab' THEN 'Punjab Kings'
              WHEN t.team_name = 'Rising Pune Supergiants' THEN 'Rising Pune Supergiant'
              ELSE t.team_name
            END AS team,
            mi.match_id,
            CASE
              WHEN mi.winner = 'Royal Challengers Bengaluru' THEN 'Royal Challengers Bangalore'
              WHEN mi.winner = 'Delhi Daredevils' THEN 'Delhi Capitals'
              WHEN mi.winner = 'Kings XI Punjab' THEN 'Punjab Kings'
              WHEN mi.winner = 'Rising Pune Supergiants' THEN 'Rising Pune Supergiant'
              ELSE mi.winner
            END AS winner,
            mi.toss_winner,
            mi.toss_decision
          FROM wpl_team t
          JOIN wpl_match_info mi ON t.match_id = mi.match_id
          WHERE mi.league = ${league}
        )
        SELECT
          team,
          COUNT(*) AS matches_played,
          COUNT(*) FILTER (WHERE winner IS NOT NULL AND team = winner) AS wins,
          COUNT(*) FILTER (WHERE winner IS NOT NULL AND team <> winner) AS losses,
          COUNT(*) FILTER (
            WHERE team = winner
            AND (
              (team = toss_winner AND toss_decision = 'bat')
              OR (team <> toss_winner AND toss_decision = 'field')
            )
          ) AS wins_batting_first,
          COUNT(*) FILTER (
            WHERE team = winner
            AND (
              (team = toss_winner AND toss_decision = 'field')
              OR (team <> toss_winner AND toss_decision = 'bat')
            )
          ) AS wins_batting_second
        FROM team_matches
        GROUP BY team
        ORDER BY wins DESC, matches_played DESC
      `;

      return results.map((row) => ({
        team: row.team,
        matchesPlayed: Number(row.matches_played),
        wins: Number(row.wins),
        losses: Number(row.losses),
        winsBattingFirst: Number(row.wins_batting_first),
        winsBattingSecond: Number(row.wins_batting_second),
      }));
    });

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
