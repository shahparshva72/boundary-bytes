import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    const { matchId } = await params;
    const matchIdNum = parseInt(matchId, 10);

    if (isNaN(matchIdNum)) {
      return NextResponse.json({ error: 'Invalid match ID' }, { status: 400 });
    }

    // First, get match info
    const matchInfo = await prisma.$queryRaw<
      Array<{
        match_id: number;
        season: string;
        start_date: Date;
        venue: string;
        teams: string;
      }>
    >`
      WITH match_teams AS (
        SELECT 
          match_id,
          season,
          start_date,
          venue,
          STRING_AGG(DISTINCT 
            CASE 
              WHEN batting_team IN ('Royal Challengers Bangalore', 'Royal Challengers Bengaluru') 
              THEN 'Royal Challengers Bangalore'
              ELSE batting_team 
            END, ' vs ' ORDER BY 
            CASE 
              WHEN batting_team IN ('Royal Challengers Bangalore', 'Royal Challengers Bengaluru') 
              THEN 'Royal Challengers Bangalore'
              ELSE batting_team 
            END
          ) as teams
        FROM wpl_delivery d
        JOIN wpl_match m ON d.match_id = m.match_id
        WHERE d.match_id = ${matchIdNum}
        GROUP BY match_id, season, start_date, venue
      )
      SELECT 
        match_id,
        season,
        start_date,
        venue,
        teams
      FROM match_teams
    `;

    if (matchInfo.length === 0) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Get fall of wickets data
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
      WITH wicket_details AS (
        SELECT 
          match_id,
          innings,
          ball,
          player_dismissed,
          wicket_type,
          bowler,
          CASE 
            WHEN batting_team IN ('Royal Challengers Bangalore', 'Royal Challengers Bengaluru') 
            THEN 'Royal Challengers Bangalore'
            ELSE batting_team 
          END as batting_team,
          ROW_NUMBER() OVER (PARTITION BY match_id, innings ORDER BY ball) as wicket_number
        FROM wpl_delivery 
        WHERE player_dismissed IS NOT NULL 
          AND match_id = ${matchIdNum}
          AND wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket', 'run out', 'retired hurt', 'obstructing the field', 'hit the ball twice', 'handled the ball', 'timed out')
      ),
      runs_at_wicket AS (
        SELECT 
          wd.*,
          SUM(d.runs_off_bat + d.extras) as runs_at_fall
        FROM wicket_details wd
        JOIN wpl_delivery d ON d.match_id = wd.match_id 
          AND d.innings = wd.innings 
          AND d.ball <= wd.ball
        GROUP BY wd.match_id, wd.innings, wd.ball, wd.player_dismissed, wd.wicket_type, wd.bowler, wd.batting_team, wd.wicket_number
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
      FROM runs_at_wicket 
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
        teams: matchInfo[0].teams.split(' vs '),
        venue: matchInfo[0].venue,
        date: matchInfo[0].start_date.toISOString().split('T')[0],
        season: matchInfo[0].season,
      },
      innings: Object.values(inningsData),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching fall of wickets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
