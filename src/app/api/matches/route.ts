import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const season = searchParams.get('season');

    // Get total matches count and unique seasons
    const [totalMatches, seasons] = await Promise.all([
      prisma.wplMatch.count({
        where: season ? { season } : undefined,
      }),
      prisma.wplMatch.findMany({
        distinct: ['season'],
        select: { season: true },
        orderBy: { season: 'desc' },
      }),
    ]);

    // Fetch paginated matches
    const matches = await prisma.wplMatch.findMany({
      where: season ? { season } : undefined,
      orderBy: {
        startDate: 'asc',
      },
      include: {
        deliveries: {
          select: {
            runsOffBat: true,
            extras: true,
            wicketType: true,
            innings: true,
            battingTeam: true,
            bowlingTeam: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate match summaries
    const matchesWithSummary = matches.map((match) => {
      const innings1 = match.deliveries.filter((d) => d.innings === 1);
      const innings2 = match.deliveries.filter((d) => d.innings === 2);

      const team1 = innings1[0]?.battingTeam;
      const team2 = innings1[0]?.bowlingTeam;

      const innings1Score = innings1.reduce((total, d) => total + d.runsOffBat + d.extras, 0);
      const innings2Score = innings2.reduce((total, d) => total + d.runsOffBat + d.extras, 0);

      const innings1Wickets = innings1.filter((d) => d.wicketType).length;
      const innings2Wickets = innings2.filter((d) => d.wicketType).length;

      let result = '';
      if (innings1Score > innings2Score) {
        result = `${team1} won by ${innings1Score - innings2Score} runs`;
      } else if (innings2Score > innings1Score) {
        result = `${team2} won by ${10 - innings2Wickets} wickets`;
      } else {
        result = 'Match Tied';
      }

      return {
        id: match.id,
        season: match.season,
        startDate: match.startDate,
        venue: match.venue,
        team1,
        team2,
        innings1Score: `${innings1Score}/${innings1Wickets}`,
        innings2Score: `${innings2Score}/${innings2Wickets}`,
        result,
      };
    });

    return NextResponse.json({
      matches: matchesWithSummary,
      pagination: {
        total: totalMatches,
        pages: Math.ceil(totalMatches / limit),
        currentPage: page,
        limit,
      },
      seasons: seasons.map((s) => s.season),
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
