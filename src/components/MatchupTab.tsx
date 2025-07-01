'use client';

import Matchup from '@/components/Matchup';

interface MatchupTabProps {
  batters: string[];
  bowlers: string[];
}

export default function MatchupTab({ batters, bowlers }: MatchupTabProps) {
  return (
    <div className="w-full  mx-auto p-4">
      <div className="flex flex-col items-center gap-6 mb-4 w-full">
        <p className="text-xl font-bold text-black bg-[#4ECDC4] px-6 py-3 rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
          Select a batter and a bowler to see their head-to-head stats.
        </p>
      </div>
      <Matchup batters={batters} bowlers={bowlers} />
    </div>
  );
}
