import StatsTabs from '@/components/StatsTabs';
import { prisma } from '@/lib/prisma';

async function getPlayers() {
  const batters = await prisma.wplDelivery.findMany({
    select: {
      striker: true,
    },
    distinct: ['striker'],
  });

  const bowlers = await prisma.wplDelivery.findMany({
    select: {
      bowler: true,
    },
    distinct: ['bowler'],
  });

  return {
    batters: batters.map((b) => b.striker),
    bowlers: bowlers.map((b) => b.bowler),
  };
}

async function getRunScorers() {
  const players = await prisma.wplDelivery.findMany({
    select: {
      striker: true,
    },
    distinct: ['striker'],
  });

  const runScorersData = await Promise.all(
    players.map(async ({ striker }) => {
      const deliveries = await prisma.wplDelivery.findMany({
        where: {
          striker: striker,
        },
      });

      const runs = deliveries.reduce((acc, d) => acc + d.runsOffBat, 0);
      const ballsFaced = deliveries.filter((d) => d.wides === 0).length;
      const matches = new Set(deliveries.map((d) => d.matchId)).size;

      return {
        player: striker,
        runs,
        ballsFaced,
        strikeRate: ballsFaced > 0 ? (runs / ballsFaced) * 100 : 0,
        matches,
      };
    }),
  );

  return runScorersData.sort((a, b) => b.runs - a.runs).slice(0, 20);
}

async function getWicketTakers() {
  const bowlers = await prisma.wplDelivery.findMany({
    select: {
      bowler: true,
    },
    distinct: ['bowler'],
  });

  const wicketTakerData = await Promise.all(
    bowlers.map(async ({ bowler }) => {
      const deliveries = await prisma.wplDelivery.findMany({
        where: {
          bowler: bowler,
        },
      });

      const validWicketTypes = [
        'caught',
        'bowled',
        'lbw',
        'stumped',
        'caught and bowled',
        'hit wicket',
      ];

      const wickets = deliveries.filter(
        (d) => d.playerDismissed && validWicketTypes.includes(d.wicketType || ''),
      ).length;

      const runsConceded = deliveries.reduce((acc, d) => acc + d.runsOffBat + d.extras, 0);

      const ballsBowled = deliveries.filter((d) => d.wides === 0 && d.noballs === 0).length;
      const matches = new Set(deliveries.map((d) => d.matchId)).size;
      const overs = ballsBowled / 6;

      return {
        player: bowler,
        wickets,
        ballsBowled,
        economy: overs > 0 ? runsConceded / overs : 0,
        matches,
      };
    }),
  );

  return wicketTakerData
    .filter((b) => b.wickets > 0)
    .sort((a, b) => b.wickets - a.wickets)
    .slice(0, 20);
}

export default async function StatsPage() {
  const [{ batters, bowlers }, runScorers, wicketTakers] = await Promise.all([
    getPlayers(),
    getRunScorers(),
    getWicketTakers(),
  ]);

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 pb-20 gap-8 sm:p-8 bg-[#FFFEE0]">
      <main className="flex flex-col gap-[40px] items-center w-full max-w-5xl mx-auto my-8">
        <div className="flex flex-col items-center gap-6 mb-4 w-full">
          <div className="bg-[#FF5E5B] p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black w-full max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-black text-black text-center tracking-tight">
              WPL STATS
            </h1>
          </div>
        </div>
        <StatsTabs
          batters={batters}
          bowlers={bowlers}
          runScorers={runScorers}
          wicketTakers={wicketTakers}
        />
      </main>
    </div>
  );
}
