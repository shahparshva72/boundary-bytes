import { allDismissalTypesSql } from '@/lib/constants/wicket-types';
import { prisma } from '@/lib/prisma';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = validateLeague(searchParams.get('league'));
    // Use raw SQL query to optimize performance and reduce connection usage
    const teamAveragesData = await prisma.$queryRaw<
      Array<{
        team: string;
        total_innings: bigint;
        total_runs: bigint;
        total_balls: bigint;
        total_dismissals: bigint;
        batting_average: number;
        strike_rate: number;
        highest_score: bigint;
        lowest_score: bigint;
      }>
    >`
      WITH raw_deliveries AS (
        SELECT
          d.batting_team,
          d.match_id,
          d.innings,
          d.runs_off_bat,
          d.extras,
          d.wides,
          d.player_dismissed,
          d.wicket_type
        FROM wpl_delivery d
        JOIN wpl_match m ON d.match_id = m.match_id
        WHERE d.innings <= 2  -- Exclude super overs (innings > 2)
          AND m.league = ${league}
      ),
      raw_team_innings AS (
        SELECT
          batting_team,
          match_id,
          innings,
          SUM(runs_off_bat + extras) as innings_total_runs
        FROM raw_deliveries
        GROUP BY batting_team, match_id, innings
      ),
      raw_team_stats AS (
        SELECT
          batting_team,
          SUM(runs_off_bat) as total_runs,
          COUNT(*) FILTER (WHERE wides = 0) as total_balls,
          COUNT(*) FILTER (
            WHERE player_dismissed IS NOT NULL
            AND wicket_type IN (${allDismissalTypesSql})
          ) as total_dismissals
        FROM raw_deliveries
        GROUP BY batting_team
      ),
      standardized_team_innings AS (
        SELECT
          CASE
            WHEN batting_team = 'Royal Challengers Bengaluru' THEN 'Royal Challengers Bangalore'
            WHEN batting_team = 'Delhi Daredevils' THEN 'Delhi Capitals'
            WHEN batting_team = 'Kings XI Punjab' THEN 'Punjab Kings'
            WHEN batting_team = 'Rising Pune Supergiants' THEN 'Rising Pune Supergiant'
            ELSE batting_team
          END as team,
          innings_total_runs
        FROM raw_team_innings
      ),
      aggregated_team_stats AS (
        SELECT
          CASE
            WHEN batting_team = 'Royal Challengers Bengaluru' THEN 'Royal Challengers Bangalore'
            WHEN batting_team = 'Delhi Daredevils' THEN 'Delhi Capitals'
            WHEN batting_team = 'Kings XI Punjab' THEN 'Punjab Kings'
            WHEN batting_team = 'Rising Pune Supergiants' THEN 'Rising Pune Supergiant'
            ELSE batting_team
          END as team,
          SUM(total_runs) as total_runs,
          SUM(total_balls) as total_balls,
          SUM(total_dismissals) as total_dismissals
        FROM raw_team_stats
        GROUP BY
          CASE
            WHEN batting_team = 'Royal Challengers Bengaluru' THEN 'Royal Challengers Bangalore'
            WHEN batting_team = 'Delhi Daredevils' THEN 'Delhi Capitals'
            WHEN batting_team = 'Kings XI Punjab' THEN 'Punjab Kings'
            WHEN batting_team = 'Rising Pune Supergiants' THEN 'Rising Pune Supergiant'
            ELSE batting_team
          END
      )
      SELECT
        ti.team,
        COUNT(*) as total_innings,
        ts.total_runs,
        ts.total_balls,
        ts.total_dismissals,
        CASE
          WHEN ts.total_dismissals > 0
          THEN ts.total_runs::decimal / ts.total_dismissals
          ELSE ts.total_runs::decimal / NULLIF(COUNT(*), 0)
        END as batting_average,
        CASE
          WHEN ts.total_balls > 0
          THEN (ts.total_runs::decimal / ts.total_balls) * 100
          ELSE 0
        END as strike_rate,
        MAX(ti.innings_total_runs) as highest_score,
        MIN(ti.innings_total_runs) as lowest_score
      FROM standardized_team_innings ti
      JOIN aggregated_team_stats ts ON ti.team = ts.team
      GROUP BY ti.team, ts.total_runs, ts.total_balls, ts.total_dismissals
      ORDER BY batting_average DESC
    `;

    const processedData = teamAveragesData.map((data) => {
      const totalInnings = Number(data.total_innings);
      const totalRuns = Number(data.total_runs);
      const totalBalls = Number(data.total_balls);
      const totalDismissals = Number(data.total_dismissals);
      const battingAverage = Number(data.batting_average);
      const strikeRate = Number(data.strike_rate);
      const highestScore = Number(data.highest_score);
      const lowestScore = Number(data.lowest_score);

      return {
        team: data.team,
        totalInnings,
        totalRuns,
        totalBalls,
        totalDismissals,
        battingAverage: Math.round(battingAverage * 100) / 100, // Round to 2 decimal places
        strikeRate: Math.round(strikeRate * 100) / 100, // Round to 2 decimal places
        highestScore,
        lowestScore,
      };
    });

    return NextResponse.json({
      data: processedData,
      league,
      metadata: {
        availableLeagues: VALID_LEAGUES,
        totalTeams: processedData.length,
      },
    });
  } catch (error) {
    console.error('Error fetching team averages:', error);

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
