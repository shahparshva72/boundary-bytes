'use client';

import Matchup from '@/components/Matchup';

export default function MatchupTab() {
  return (
    <div className="w-full mx-auto p-0 sm:p-2">
      <div className="flex flex-col items-center gap-2 sm:gap-3 mb-2 w-full">
        <p className="text-xs sm:text-sm md:text-base font-bold text-black bg-[#4ECDC4] px-2 sm:px-3 py-1 sm:py-1.5 rounded-none border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-center">
          Select a batter and a bowler to see their head-to-head stats.
        </p>
      </div>
      <Matchup />
    </div>
  );
}
