import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    const league = 'WPL'; // Default
    console.log('Analyzing for league:', league);

    // 1. Current Implementation: WplDelivery
    const startDelivery = performance.now();
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
    const endDelivery = performance.now();
    console.log(`WplDelivery Query Time: ${(endDelivery - startDelivery).toFixed(2)}ms`);
    console.log('Count via Delivery:', batters.length);

    // 2. Alternative: WplPlayer
    const startPlayer = performance.now();
    const players = await prisma.wplPlayer.findMany({
      where: {
        matchInfo: {
          league,
        },
      },
      select: {
        playerName: true,
      },
      distinct: ['playerName'],
      orderBy: {
        playerName: 'asc',
      },
    });
    const endPlayer = performance.now();
    console.log(`WplPlayer Query Time: ${(endPlayer - startPlayer).toFixed(2)}ms`);
    console.log('Count via Player:', players.length);

    // 3. Compare
    const batterNames = new Set(batters.map(b => b.striker));
    const playerNames = new Set(players.map(p => p.playerName));

    const notInPlayer = [...batterNames].filter(x => !playerNames.has(x));
    const notInBatter = [...playerNames].filter(x => !batterNames.has(x));

    if (notInPlayer.length > 0) {
      console.log('WARNING: Found batters in Delivery table not present in Player table:', notInPlayer);
    } else {
      console.log('SUCCESS: All batters are present in Player table.');
    }

    console.log(`Found ${notInBatter.length} players who are not in the batters list (likely bowlers/non-batters).`);
    if (notInBatter.length > 0) {
        console.log('Sample non-batters:', notInBatter.slice(0, 5));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
