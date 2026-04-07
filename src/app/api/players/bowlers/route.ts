import { CACHE_TTL, getCached } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = validateLeague(searchParams.get('league'));

    // Query wpl_player table directly instead of scanning the massive wpl_delivery table.
    // wpl_player has an index on player_name and is orders of magnitude smaller.
    const bowlerNames = await getCached(`bowlers:${league}`, CACHE_TTL.SHORT, async () => {
      const bowlers = await prisma.$queryRaw<Array<{ player_name: string }>>`
        SELECT DISTINCT p.player_name
        FROM wpl_player p
        JOIN wpl_match_info mi ON p.match_id = mi.match_id
        WHERE mi.league = ${league}
        ORDER BY p.player_name
      `;
      return bowlers.map((b) => b.player_name);
    });

    return NextResponse.json({
      data: bowlerNames,
      league,
      metadata: {
        availableLeagues: VALID_LEAGUES,
        totalRecords: bowlerNames.length,
      },
    });
  } catch (error) {
    console.error('Error fetching bowlers:', error);

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
