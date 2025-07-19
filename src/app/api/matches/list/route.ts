import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    // Use raw SQL query to get match list with team names
    const matchListData = await prisma.$queryRaw<
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
        GROUP BY match_id, season, start_date, venue
      )
      SELECT 
        match_id,
        season,
        start_date,
        venue,
        teams
      FROM match_teams
      ORDER BY start_date DESC
    `;

    const processedData = matchListData.map((data) => ({
      id: data.match_id,
      teams: data.teams,
      venue: data.venue,
      date: data.start_date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      season: data.season,
    }));

    return NextResponse.json({
      data: processedData,
    });
  } catch (error) {
    console.error('Error fetching match list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
