import { prisma } from '@/lib/prisma';
import { VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { NextResponse } from 'next/server';

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
        innings: { lte: 2 },
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

        // Only exclude wides from balls faced (no-balls are counted)
        if (!delivery.wides || delivery.wides === 0) {
          ballsFaced++;
        }

        if (delivery.runsOffBat === 4) {
          fours++;
        }

        if (delivery.runsOffBat === 6) {
          sixes++;
        }

        // Only count as dismissal if this batter was dismissed
        if (delivery.playerDismissed && delivery.playerDismissed === batter) {
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

      // Only these wicket types are credited to the bowler
      const bowlerWicketTypes = [
        'bowled',
        'caught',
        'lbw',
        'stumped',
        'caught and bowled',
        'hit wicket',
      ];

      for (const delivery of filteredDeliveries) {
        // Only include runsOffBat, wides, and noballs in runs conceded
        runsConceded += delivery.runsOffBat;
        if (delivery.wides) {
          runsConceded += delivery.wides;
        }
        if (delivery.noballs) {
          runsConceded += delivery.noballs;
        }

        // Only exclude wides from balls bowled (no-balls are counted)
        if (!delivery.wides || delivery.wides === 0) {
          ballsBowled++;

          // Dot ball: only if legal delivery and no runs/extras
          if (delivery.runsOffBat === 0 && (!delivery.extras || delivery.extras === 0)) {
            dots++;
          }
        }

        // Only count as wicket if bowler-credited type
        if (
          delivery.playerDismissed &&
          delivery.wicketType &&
          bowlerWicketTypes.includes(delivery.wicketType)
        ) {
          wickets++;
        }

        if (delivery.wides && delivery.wides > 0) {
          wides++;
        }
        if (delivery.noballs && delivery.noballs > 0) {
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
