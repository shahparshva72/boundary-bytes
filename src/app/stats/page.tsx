'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import StatsTabs from '@/components/StatsTabs';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

const fetchPlayers = async () => {
  const [battersRes, bowlersRes] = await Promise.all([
    axios.get('/api/players/batters'),
    axios.get('/api/players/bowlers'),
  ]);

  return {
    batters: battersRes.data,
    bowlers: bowlersRes.data,
  };
};

export default function StatsPage() {
  const {
    data: playersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['players'],
    queryFn: fetchPlayers,
  });

  if (isLoading) {
    return (
      <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 pb-20 gap-8 sm:p-8 bg-[#FFFEE0]">
        <main className="flex flex-col gap-[40px] items-center w-full  mx-auto my-8">
          <div className="flex flex-col items-center gap-6 mb-4 w-full">
            <div className="bg-[#FF5E5B] p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black w-full max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-black text-black text-center tracking-tight">
                WPL STATS
              </h1>
            </div>
          </div>
          <div className="flex items-center justify-center p-8">
            <div className="text-xl font-bold">Loading stats...</div>
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 pb-20 gap-8 sm:p-8 bg-[#FFFEE0]">
        <main className="flex flex-col gap-[40px] items-center w-full  mx-auto my-8">
          <div className="flex flex-col items-center gap-6 mb-4 w-full">
            <div className="bg-[#FF5E5B] p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black w-full max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-black text-black text-center tracking-tight">
                WPL STATS
              </h1>
            </div>
          </div>
          <div className="flex items-center justify-center p-8">
            <div className="text-xl font-bold text-red-500">Error loading stats.</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 pb-20 gap-8 sm:p-8 bg-[#FFFEE0]">
      <main className="flex flex-col gap-[40px] items-center w-full  mx-auto my-8">
        <div className="flex flex-col items-center gap-6 mb-4 w-full">
          <div className="bg-[#FF5E5B] p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black w-full max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-black text-black text-center tracking-tight">
              WPL STATS
            </h1>
          </div>
        </div>
        <StatsTabs batters={playersData?.batters || []} bowlers={playersData?.bowlers || []} />
      </main>
    </div>
  );
}
