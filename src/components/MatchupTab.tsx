'use client';

import Matchup from '@/components/Matchup';

interface MatchupTabProps {
  batters: string[];
  bowlers: string[];
}

export default function MatchupTab({ batters, bowlers }: MatchupTabProps) {
  return (
    <div className="w-full mx-auto p-0 sm:p-4">
      <div className="flex flex-col items-center gap-4 sm:gap-6 mb-4 w-full">
        <p className="text-sm sm:text-lg md:text-xl font-bold text-black bg-[#4ECDC4] px-3 sm:px-6 py-2 sm:py-3 rounded-none border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
          Select a batter and a bowler to see their head-to-head stats.
        </p>
      </div>
      <Matchup batters={batters} bowlers={bowlers} />
    </div>
  );
}
