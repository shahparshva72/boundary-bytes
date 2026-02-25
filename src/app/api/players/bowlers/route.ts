import { prisma } from '@/lib/prisma';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';

// Create a cached function to fetch bowlers
const getBowlers = unstable_cache(
  async (league: string) => {
    const bowlers = await prisma.wplDelivery.findMany({
      where: {
        match: {
          league,
        },
      },
      select: {
        bowler: true,
      },
      distinct: ['bowler'],
      orderBy: {
        bowler: 'asc',
      },
    });

    return bowlers.map((b) => b.bowler);
  },
  ['bowlers-list'], // Cache key prefix
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['bowlers'], // Tag for manual revalidation
  }
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = validateLeague(searchParams.get('league'));

    // Use the cached function
    const bowlerNames = await getBowlers(league);

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
