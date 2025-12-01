'use client';

import { useTeamAverages } from '@/hooks/useStatsAPI';
import { MoonLoader } from 'react-spinners';

interface TeamAveragesData {
  team: string;
  totalInnings: number;
  totalRuns: number;
  totalBalls: number;
  totalDismissals: number;
  battingAverage: number;
  strikeRate: number;
  highestScore: number;
  lowestScore: number;
}

export default function TeamAverages() {
  const { data, isLoading } = useTeamAverages();

  return (
    <div className="w-full mx-auto p-0 sm:p-4">
      <div className="bg-white border-2 sm:border-4 border-black rounded-none overflow-hidden">
        <div className="bg-[#4ECDC4] p-2 sm:p-4 border-b-2 sm:border-b-4 border-black">
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-black text-center uppercase tracking-wide">
            Team Batting Averages
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <MoonLoader color="#4F46E5" size={50} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-[#FFC700] border-b-2 sm:border-b-4 border-black">
                <tr>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                    #
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                    Team
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                    Inn
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                    Runs
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                    Dis
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                    Avg
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                    SR
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                    Hi
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide whitespace-nowrap">
                    Lo
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.data && data.data.length > 0 ? (
                  data.data.map((team: TeamAveragesData, index: number) => (
                    <tr
                      key={team.team}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#FFED66]'}
                        border-b-2 border-black hover:bg-[#FFED66] transition-colors duration-150`}
                    >
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                        {index + 1}
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                        {team.team}
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                        {team.totalInnings}
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                        {team.totalRuns}
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                        {team.totalDismissals}
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                        {team.battingAverage.toFixed(2)}
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                        {team.strikeRate.toFixed(2)}
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                        {team.highestScore}
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black whitespace-nowrap">
                        {team.lowestScore}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 sm:px-6 py-6 sm:py-8 text-sm sm:text-lg font-bold text-black text-center"
                    >
                      No team averages data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
