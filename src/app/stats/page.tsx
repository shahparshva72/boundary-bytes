import Matchup from '@/components/Matchup';
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

export default async function StatsPage() {
  const { batters, bowlers } = await getPlayers();

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 pb-20 gap-8 sm:p-8 bg-[#FFFEE0]">
      <main className="flex flex-col gap-[40px] items-center w-full max-w-5xl mx-auto my-8">
        <div className="flex flex-col items-center gap-6 mb-4 w-full">
          <div className="bg-[#FF5E5B] p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black w-full max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-black text-black text-center tracking-tight">
              BATTER vs BOWLER
            </h1>
          </div>
          <p className="text-xl font-bold text-black bg-[#4ECDC4] px-6 py-3 rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Select a batter and a bowler to see their head-to-head stats.
          </p>
        </div>
        <Matchup batters={batters} bowlers={bowlers} />
      </main>
    </div>
  );
}
