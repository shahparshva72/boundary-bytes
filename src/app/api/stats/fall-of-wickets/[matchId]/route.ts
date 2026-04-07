import { allDismissalTypesSql } from '@/lib/constants/wicket-types';
import { prisma } from '@/lib/prisma';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    const { searchParams } = new URL(request.url);
    const { matchId } = await params;
    const matchIdNum = parseInt(matchId, 10);
    const league = validateLeague(searchParams.get('league'));

    if (isNaN(matchIdNum)) {
      return NextResponse.json({ error: 'Invalid match ID' }, { status: 400 });
    }

    // Get match info from wpl_match_info + wpl_team (avoids scanning wpl_delivery for team names)
    const matchInfo = await prisma.$queryRaw<
      Array<{
        match_id: number;
        league: string;
        season: string;
        date: Date;
        venue: string;
        teams: string;
      }>
    >`
      SELECT
        mi.match_id,
        mi.league,
        mi.season,
        mi.date,
        mi.venue,
        STRING_AGG(DISTINCT
          CASE
            WHEN t.team_name = 'Royal Challengers Bengaluru' THEN 'Royal Challengers Bangalore'
            WHEN t.team_name = 'Delhi Daredevils' THEN 'Delhi Capitals'
            WHEN t.team_name = 'Kings XI Punjab' THEN 'Punjab Kings'
            WHEN t.team_name = 'Rising Pune Supergiants' THEN 'Rising Pune Supergiant'
            ELSE t.team_name
          END, ' vs ' ORDER BY
          CASE
            WHEN t.team_name = 'Royal Challengers Bengaluru' THEN 'Royal Challengers Bangalore'
            WHEN t.team_name = 'Delhi Daredevils' THEN 'Delhi Capitals'
            WHEN t.team_name = 'Kings XI Punjab' THEN 'Punjab Kings'
            WHEN t.team_name = 'Rising Pune Supergiants' THEN 'Rising Pune Supergiant'
            ELSE t.team_name
          END
        ) as teams
      FROM wpl_match_info mi
      JOIN wpl_team t ON mi.match_id = t.match_id
      WHERE mi.match_id = ${matchIdNum} AND mi.league = ${league}
      GROUP BY mi.match_id, mi.league, mi.season, mi.date, mi.venue
    `;

    if (matchInfo.length === 0) {
      return NextResponse.json(
        {
          error: `Match not found in ${league} league`,
          code: 'MATCH_NOT_FOUND',
          league,
          matchId: matchIdNum,
        },
        { status: 404 },
      );
    }

    // Use window function for cumulative runs instead of O(n²) self-join.
    // The old approach joined wpl_delivery to itself (d.ball <= wd.ball) to compute
    // cumulative runs at each wicket — this is quadratic in the number of deliveries.
    // Window functions compute the running sum in a single pass: O(n).
    const fallOfWicketsData = await prisma.$queryRaw<
      Array<{
        innings: number;
        batting_team: string;
        ball: string;
        player_dismissed: string;
        wicket_type: string;
        bowler: string;
        wicket_number: bigint;
        runs_at_fall: bigint;
      }>
    >`
      WITH delivery_cumulative AS (
        SELECT
          d.innings,
          d.ball,
          CASE
            WHEN d.batting_team = 'Royal Challengers Bengaluru' THEN 'Royal Challengers Bangalore'
            WHEN d.batting_team = 'Delhi Daredevils' THEN 'Delhi Capitals'
            WHEN d.batting_team = 'Kings XI Punjab' THEN 'Punjab Kings'
            WHEN d.batting_team = 'Rising Pune Supergiants' THEN 'Rising Pune Supergiant'
            ELSE d.batting_team
          END AS batting_team,
          d.player_dismissed,
          d.wicket_type,
          d.bowler,
          SUM(d.runs_off_bat + d.extras) OVER (
            PARTITION BY d.innings
            ORDER BY d.ball
            ROWS UNBOUNDED PRECEDING
          ) AS cumulative_runs
        FROM wpl_delivery d
        WHERE d.match_id = ${matchIdNum} AND d.innings <= 2
      ),
      wickets_with_number AS (
        SELECT
          innings,
          batting_team,
          ball,
          player_dismissed,
          wicket_type,
          bowler,
          cumulative_runs AS runs_at_fall,
          ROW_NUMBER() OVER (PARTITION BY innings ORDER BY ball) AS wicket_number
        FROM delivery_cumulative
        WHERE player_dismissed IS NOT NULL
          AND wicket_type IN (${allDismissalTypesSql})
      )
      SELECT
        innings,
        batting_team,
        ball,
        player_dismissed,
        wicket_type,
        bowler,
        wicket_number,
        runs_at_fall
      FROM wickets_with_number
      ORDER BY innings, wicket_number
    `;

    interface InningsData {
      inningsNumber: number;
      battingTeam: string;
      wickets: Array<{
        wicketNumber: number;
        over: string;
        runsAtFall: number;
        batsmanOut: string;
        dismissalType: string;
        bowler: string;
      }>;
    }

    // Group wickets by innings
    const inningsData: { [key: number]: InningsData } = {};

    fallOfWicketsData.forEach((wicket) => {
      const inningsNum = wicket.innings;
      if (!inningsData[inningsNum]) {
        inningsData[inningsNum] = {
          inningsNumber: inningsNum,
          battingTeam: wicket.batting_team,
          wickets: [],
        };
      }

      inningsData[inningsNum].wickets.push({
        wicketNumber: Number(wicket.wicket_number),
        over: wicket.ball,
        runsAtFall: Number(wicket.runs_at_fall),
        batsmanOut: wicket.player_dismissed,
        dismissalType: wicket.wicket_type,
        bowler: wicket.bowler,
      });
    });

    const response = {
      matchInfo: {
        id: matchInfo[0].match_id,
        league: matchInfo[0].league,
        teams: matchInfo[0].teams.split(' vs '),
        venue: matchInfo[0].venue,
        date: matchInfo[0].date.toISOString().split('T')[0],
        season: matchInfo[0].season,
      },
      innings: Object.values(inningsData),
      metadata: {
        availableLeagues: VALID_LEAGUES,
        totalWickets: fallOfWicketsData.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching fall of wickets:', error);

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
