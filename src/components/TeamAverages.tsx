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
    <div className="w-full mx-auto p-4">
      <div className="bg-white border-4 border-black rounded-none overflow-hidden">
        <div className="bg-[#4ECDC4] p-4 border-b-4 border-black">
          <h2 className="text-2xl font-black text-black text-center uppercase tracking-wide">
            Team Batting Averages
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <MoonLoader color="#4F46E5" size={50} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FFC700] border-b-4 border-black">
                <tr>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Team
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Innings
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Total Runs
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Dismissals
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Average
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Strike Rate
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Highest
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide">
                    Lowest
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
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {team.team}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {team.totalInnings}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {team.totalRuns}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {team.totalDismissals}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {team.battingAverage.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {team.strikeRate.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {team.highestScore}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black">{team.lowestScore}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-lg font-bold text-black text-center">
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
