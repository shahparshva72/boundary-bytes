import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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
      WITH standardized_deliveries AS (
        SELECT
          CASE
            WHEN batting_team IN ('Royal Challengers Bangalore', 'Royal Challengers Bengaluru')
            THEN 'Royal Challengers Bangalore'
            ELSE batting_team
          END as team,
          match_id,
          innings,
          runs_off_bat,
          extras,
          wides,
          player_dismissed,
          wicket_type
        FROM wpl_delivery
        WHERE innings <= 2  -- Exclude super overs (innings > 2)
      ),
      team_innings AS (
        SELECT
          team,
          match_id,
          innings,
          SUM(runs_off_bat + extras) as innings_total_runs
        FROM standardized_deliveries
        GROUP BY team, match_id, innings
      ),
      team_stats AS (
        SELECT
          team,
          SUM(runs_off_bat) as total_runs,
          COUNT(*) FILTER (WHERE wides = 0) as total_balls,
          COUNT(*) FILTER (
            WHERE player_dismissed IS NOT NULL
            AND wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket', 'run out')
          ) as total_dismissals
        FROM standardized_deliveries
        GROUP BY team
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
      FROM team_innings ti
      JOIN team_stats ts ON ti.team = ts.team
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
    });
  } catch (error) {
    console.error('Error fetching team averages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
