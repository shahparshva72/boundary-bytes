import type { StatExplorerReportType } from '@/lib/stat-explorer/contracts';
import { getFilterOptions } from '@/lib/stat-explorer/options';
import { validateLeague } from '@/lib/validation/league';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = validateLeague(searchParams.get('league'));
    const reportType = (searchParams.get('reportType') || 'batting') as StatExplorerReportType;

    const options = await getFilterOptions(league, reportType);

    return NextResponse.json({
      options,
      league,
      metadata: {
        reportType,
      },
    });
  } catch (error) {
    console.error('Error fetching stat explorer options:', error);

    if (error instanceof Error && error.message.includes('Invalid league')) {
      return NextResponse.json({ error: error.message, code: 'INVALID_LEAGUE' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
