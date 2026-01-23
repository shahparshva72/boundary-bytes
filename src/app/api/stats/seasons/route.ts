import { prisma } from '@/lib/prisma';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const league = validateLeague(searchParams.get('league'));

    const seasons = await prisma.$queryRaw<{ season: string }[]>`
      SELECT DISTINCT season 
      FROM wpl_match_info 
      WHERE league = ${league} 
      ORDER BY season DESC
    `;

    return NextResponse.json({
      seasons: seasons.map((s) => s.season),
      league,
      metadata: {
        availableLeagues: VALID_LEAGUES,
        totalSeasons: seasons.length,
      },
    });
  } catch (error) {
    console.error('Error fetching seasons:', error);

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
