import React from 'react';

interface BatterStats {
  runsScored: number;
  ballsFaced: number;
  strikeRate: number;
  average: number;
  fours: number;
  sixes: number;
}

interface BowlerStats {
  runsConceded: number;
  wickets: number;
  economyRate: number;
  average: number;
  strikeRate: number;
  dots: number;
}

interface StatsDisplayProps {
  stats: BatterStats | BowlerStats | null;
  playerType: 'batter' | 'bowler';
}

const StatsDisplay = ({ stats, playerType }: StatsDisplayProps) => {
  if (!stats) return null;

  return (
    <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      {playerType === 'batter' ? (
        <>
          <div className="bg-[#FFC700] p-3 sm:p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
            <p className="text-sm sm:text-base md:text-lg font-bold text-black">Runs Scored</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-black">
              {(stats as BatterStats).runsScored}
            </p>
          </div>
          <div className="bg-[#FFC700] p-3 sm:p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
            <p className="text-sm sm:text-base md:text-lg font-bold text-black">Balls Faced</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-black">
              {(stats as BatterStats).ballsFaced}
            </p>
          </div>
          <div className="bg-[#FFC700] p-3 sm:p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
            <p className="text-sm sm:text-base md:text-lg font-bold text-black">Strike Rate</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-black">
              {(stats as BatterStats).strikeRate}
            </p>
          </div>
          <div className="bg-[#FFC700] p-3 sm:p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
            <p className="text-sm sm:text-base md:text-lg font-bold text-black">Average</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-black">
              {(stats as BatterStats).average}
            </p>
          </div>
          <div className="bg-[#FFC700] p-3 sm:p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
            <p className="text-sm sm:text-base md:text-lg font-bold text-black">Fours</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-black">
              {(stats as BatterStats).fours}
            </p>
          </div>
          <div className="bg-[#FFC700] p-3 sm:p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
            <p className="text-sm sm:text-base md:text-lg font-bold text-black">Sixes</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-black">
              {(stats as BatterStats).sixes}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="bg-[#FFC700] p-3 sm:p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
            <p className="text-sm sm:text-base md:text-lg font-bold text-black">Runs Conceded</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-black">
              {(stats as BowlerStats).runsConceded}
            </p>
          </div>
          <div className="bg-[#FFC700] p-3 sm:p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
            <p className="text-sm sm:text-base md:text-lg font-bold text-black">Wickets</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-black">
              {(stats as BowlerStats).wickets}
            </p>
          </div>
          <div className="bg-[#FFC700] p-3 sm:p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
            <p className="text-sm sm:text-base md:text-lg font-bold text-black">Economy Rate</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-black">
              {(stats as BowlerStats).economyRate}
            </p>
          </div>
          <div className="bg-[#FFC700] p-3 sm:p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
            <p className="text-sm sm:text-base md:text-lg font-bold text-black">Average</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-black">
              {(stats as BowlerStats).average}
            </p>
          </div>
          <div className="bg-[#FFC700] p-3 sm:p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
            <p className="text-sm sm:text-base md:text-lg font-bold text-black">Strike Rate</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-black">
              {(stats as BowlerStats).strikeRate}
            </p>
          </div>
          <div className="bg-[#FFC700] p-3 sm:p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
            <p className="text-sm sm:text-base md:text-lg font-bold text-black">Dot Balls</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-black">
              {(stats as BowlerStats).dots}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default StatsDisplay;
