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
  const { searchParams } = new URL(request.url);
  const oversParam = searchParams.get('overs');
  const batter = searchParams.get('batter');
  const bowler = searchParams.get('bowler');
  const playerType = searchParams.get('playerType') || 'batter';
  const league = validateLeague(searchParams.get('league'));

  if (!oversParam) {
    return NextResponse.json({ error: 'Over numbers are required' }, { status: 400 });
  }

  if (!batter && !bowler) {
    return NextResponse.json(
      { error: 'Either batter or bowler must be specified' },
      { status: 400 },
    );
  }

  const overs = oversParam.split(',').map(Number);

  if (overs.some(isNaN)) {
    return NextResponse.json({ error: 'Invalid over numbers provided' }, { status: 400 });
  }

  try {
    const deliveries = await prisma.wplDelivery.findMany({
      where: {
        match: {
          league,
        },
        ...(playerType === 'batter'
          ? { striker: batter || undefined }
          : { bowler: bowler || undefined }),
      },
    });

    const filteredDeliveries = deliveries.filter((delivery) => {
      const overNumber = Math.floor(parseFloat(delivery.ball)) + 1;
      return overs.includes(overNumber);
    });

    if (playerType === 'batter') {
      let runsScored = 0;
      let ballsFaced = 0;
      let fours = 0;
      let sixes = 0;
      let dismissals = 0;

      for (const delivery of filteredDeliveries) {
        runsScored += delivery.runsOffBat;

        if (delivery.wides === 0 && delivery.noballs === 0) {
          ballsFaced++;
        }

        if (delivery.runsOffBat === 4) {
          fours++;
        }

        if (delivery.runsOffBat === 6) {
          sixes++;
        }

        if (delivery.playerDismissed) {
          dismissals++;
        }
      }

      const strikeRate = ballsFaced > 0 ? (runsScored / ballsFaced) * 100 : 0;
      const average = dismissals > 0 ? runsScored / dismissals : runsScored;

      return NextResponse.json({
        data: {
          runsScored,
          ballsFaced,
          strikeRate: parseFloat(strikeRate.toFixed(2)),
          average: parseFloat(average.toFixed(2)),
          fours,
          sixes,
          dismissals,
        },
        league,
        player: batter,
        playerType: 'batter',
        overs,
        metadata: {
          availableLeagues: VALID_LEAGUES,
          deliveriesAnalyzed: filteredDeliveries.length,
        },
      });
    } else {
      let runsConceded = 0;
      let ballsBowled = 0;
      let wickets = 0;
      let dots = 0;
      let wides = 0;
      let noballs = 0;

      for (const delivery of filteredDeliveries) {
        runsConceded += delivery.runsOffBat + delivery.extras;
        ballsBowled++;

        if (delivery.playerDismissed) {
          wickets++;
        }

        if (delivery.runsOffBat === 0 && delivery.extras === 0) {
          dots++;
        }

        if (delivery.wides > 0) {
          wides++;
        }

        if (delivery.noballs > 0) {
          noballs++;
        }
      }

      const overs = Math.floor(ballsBowled / 6) + (ballsBowled % 6) / 10;
      const economyRate = overs > 0 ? runsConceded / overs : 0;
      const average = wickets > 0 ? runsConceded / wickets : 0;
      const strikeRate = wickets > 0 ? ballsBowled / wickets : 0;

      return NextResponse.json({
        data: {
          runsConceded,
          ballsBowled,
          overs: parseFloat(overs.toFixed(1)),
          wickets,
          economyRate: parseFloat(economyRate.toFixed(2)),
          average: parseFloat(average.toFixed(2)),
          strikeRate: parseFloat(strikeRate.toFixed(2)),
          dots,
          wides,
          noballs,
        },
        league,
        player: bowler,
        playerType: 'bowler',
        overs,
        metadata: {
          availableLeagues: VALID_LEAGUES,
          deliveriesAnalyzed: filteredDeliveries.length,
        },
      });
    }
  } catch (error) {
    console.error('Error fetching advanced stats:', error);

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
