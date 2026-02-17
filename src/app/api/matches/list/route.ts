import { prisma } from '@/lib/prisma';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const league = validateLeague(searchParams.get('league'));

    // Use raw SQL query to get match list with team names, filtered by league
    // Optimization: Query wpl_match_info and wpl_team instead of scanning wpl_delivery
    const matchListData = await prisma.$queryRaw<
      Array<{
        match_id: number;
        league: string;
        season: string;
        start_date: Date;
        venue: string;
        teams: string;
      }>
    >`
      SELECT
        m.match_id,
        m.league,
        m.season,
        m.date as start_date,
        m.venue,
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
      FROM wpl_match_info m
      JOIN wpl_team t ON m.match_id = t.match_id
      WHERE m.league = ${league}
      GROUP BY m.match_id, m.league, m.season, m.date, m.venue
      ORDER BY m.date DESC
    `;

    const processedData = matchListData.map((data) => ({
      id: data.match_id,
      league: data.league,
      teams: data.teams,
      venue: data.venue,
      date: data.start_date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      season: data.season,
    }));

    return NextResponse.json({
      data: processedData,
      league,
      metadata: {
        availableLeagues: VALID_LEAGUES,
        totalRecords: processedData.length,
      },
    });
  } catch (error) {
    console.error('Error fetching match list:', error);

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
