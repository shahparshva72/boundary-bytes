import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Valid league values
const VALID_LEAGUES = ['WPL', 'IPL'] as const;
type League = (typeof VALID_LEAGUES)[number];

function validateLeague(league: string | null): League {
  if (!league) return 'WPL'; // Default to WPL for backward compatibility
  if (VALID_LEAGUES.includes(league as League)) {
    return league as League;
  }
  throw new Error(`Invalid league: ${league}. Valid leagues are: ${VALID_LEAGUES.join(', ')}`);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = validateLeague(searchParams.get('league'));

    const batters = await prisma.wplDelivery.findMany({
      where: {
        match: {
          league,
        },
      },
      select: {
        striker: true,
      },
      distinct: ['striker'],
      orderBy: {
        striker: 'asc',
      },
    });

    const batterNames = batters.map((b) => b.striker);

    return NextResponse.json({
      data: batterNames,
      league,
      metadata: {
        availableLeagues: VALID_LEAGUES,
        totalRecords: batterNames.length,
      },
    });
  } catch (error) {
    console.error('Error fetching batters:', error);

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

    // Handle specific database connection errors
    if (error instanceof Error && error.message.includes('connection pool')) {
      return NextResponse.json(
        { error: 'Database connection timeout. Please try again.' },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
