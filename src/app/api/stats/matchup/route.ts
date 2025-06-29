import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const batter = searchParams.get('batter');
  const bowler = searchParams.get('bowler');

  if (!batter || !bowler) {
    return NextResponse.json({ error: 'Batter and bowler are required' }, { status: 400 });
  }

  try {
    const deliveries = await prisma.wplDelivery.findMany({
      where: {
        striker: batter,
        bowler: bowler,
      },
    });

    const runsScored = deliveries.reduce((acc, curr) => acc + curr.runsOffBat, 0);
    const ballsFaced = deliveries.length;
    const dismissals = deliveries.filter((d) => d.playerDismissed === batter).length;

    const strikeRate = ballsFaced > 0 ? (runsScored / ballsFaced) * 100 : 0;
    const average = dismissals > 0 ? runsScored / dismissals : runsScored;

    return NextResponse.json({
      runsScored,
      ballsFaced,
      dismissals,
      strikeRate: strikeRate.toFixed(2),
      average: average.toFixed(2),
    });
  } catch (error) {
    console.error('Error fetching matchup stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
