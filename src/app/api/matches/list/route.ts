import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const league = validateLeague(searchParams.get('league'));

    // Use raw SQL query to get match list with team names, filtered by league
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
      WITH match_teams AS (
        SELECT
          m.match_id,
          m.league,
          m.season,
          m.start_date,
          m.venue,
          STRING_AGG(DISTINCT
            CASE
              WHEN d.batting_team = 'Royal Challengers Bengaluru' THEN 'Royal Challengers Bangalore'
              WHEN d.batting_team = 'Delhi Daredevils' THEN 'Delhi Capitals'
              WHEN d.batting_team = 'Kings XI Punjab' THEN 'Punjab Kings'
              WHEN d.batting_team = 'Rising Pune Supergiants' THEN 'Rising Pune Supergiant'
              ELSE d.batting_team
            END, ' vs ' ORDER BY
            CASE
              WHEN d.batting_team = 'Royal Challengers Bengaluru' THEN 'Royal Challengers Bangalore'
              WHEN d.batting_team = 'Delhi Daredevils' THEN 'Delhi Capitals'
              WHEN d.batting_team = 'Kings XI Punjab' THEN 'Punjab Kings'
              WHEN d.batting_team = 'Rising Pune Supergiants' THEN 'Rising Pune Supergiant'
              ELSE d.batting_team
            END
          ) as teams
        FROM wpl_delivery d
        JOIN wpl_match m ON d.match_id = m.match_id
        WHERE m.league = ${league}
        GROUP BY m.match_id, m.league, m.season, m.start_date, m.venue
      )
      SELECT
        match_id,
        league,
        season,
        start_date,
        venue,
        teams
      FROM match_teams
      ORDER BY start_date DESC
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
