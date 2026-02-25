import { prisma } from '@/lib/prisma';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';

// Create a cached function to fetch batters
const getBatters = unstable_cache(
  async (league: string) => {
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

    return batters.map((b) => b.striker);
  },
  ['batters-list'], // Cache key prefix
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['batters'], // Tag for manual revalidation
  }
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = validateLeague(searchParams.get('league'));

    // Use the cached function
    const batterNames = await getBatters(league);

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
