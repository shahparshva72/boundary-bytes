import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const oversParam = searchParams.get('overs');
  const batter = searchParams.get('batter');

  if (!oversParam) {
    return NextResponse.json({ error: 'Over numbers are required' }, { status: 400 });
  }

  const overs = oversParam.split(',').map(Number);

  if (overs.some(isNaN)) {
    return NextResponse.json({ error: 'Invalid over numbers provided' }, { status: 400 });
  }

  try {
    const deliveries = await prisma.wplDelivery.findMany({
      where: {
        striker: batter || undefined,
      },
    });

    const filteredDeliveries = deliveries.filter((delivery) => {
      const overNumber = Math.floor(parseFloat(delivery.ball)) + 1;
      return overs.includes(overNumber);
    });

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
      runsScored,
      ballsFaced,
      strikeRate: parseFloat(strikeRate.toFixed(2)),
      average: parseFloat(average.toFixed(2)),
      fours,
      sixes,
      dismissals,
    });
  } catch (error) {
    console.error('Error fetching advanced stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
