import { prisma } from '@/lib/prisma';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = validateLeague(searchParams.get('league'));

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

    const bowlerNames = bowlers.map((b) => b.bowler);

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
