import { prisma } from '@/lib/prisma';
import { validateLeague } from '@/lib/validation/league';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = validateLeague(searchParams.get('league'));

    const [result] = await prisma.$queryRaw<Array<{ latestDate: Date | null }>>`
      SELECT MAX(start_date) AS "latestDate"
      FROM wpl_match
      WHERE league = ${league}
    `;

    return NextResponse.json({
      league,
      latestDate: result?.latestDate?.toISOString() ?? null,
    });
  } catch (error) {
    console.error('Error fetching latest match date:', error);

    if (error instanceof Error && error.message.includes('Invalid league')) {
      return NextResponse.json({ error: error.message, code: 'INVALID_LEAGUE' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
