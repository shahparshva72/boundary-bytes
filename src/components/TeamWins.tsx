'use client';

import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { MoonLoader } from 'react-spinners';

interface TeamWinRow {
  team: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winsBattingFirst: number;
  winsBattingSecond: number;
}

const fetchTeamWins = async () => {
  const { data } = await axios.get('/api/stats/team-wins');
  return data;
};

export default function TeamWins() {
  const { data, isLoading } = useQuery({
    queryKey: ['teamWins'],
    queryFn: fetchTeamWins,
  });

  return (
    <div className="w-full mx-auto p-4">
      <div className="bg-white border-4 border-black rounded-none overflow-hidden">
        <div className="bg-[#4ECDC4] p-4 border-b-4 border-black">
          <h2 className="text-2xl font-black text-black text-center uppercase tracking-wide">
            Team Win Stats
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
                    Matches
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Wins
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Losses
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Wins 1st Inn
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Wins 2nd Inn
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide">
                    Win %
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.data && data.data.length > 0 ? (
                  data.data.map((team: TeamWinRow, index: number) => {
                    const winPct = team.matchesPlayed > 0 ? (team.wins / team.matchesPlayed) * 100 : 0;
                    return (
                      <tr
                        key={team.team}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#FFED66]'} border-b-2 border-black hover:bg-[#FFED66] transition-colors duration-150`}
                      >
                        <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                          {team.team}
                        </td>
                        <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                          {team.matchesPlayed}
                        </td>
                        <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                          {team.wins}
                        </td>
                        <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                          {team.losses}
                        </td>
                        <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                          {team.winsBattingFirst}
                        </td>
                        <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                          {team.winsBattingSecond}
                        </td>
                        <td className="px-6 py-4 text-lg font-bold text-black">
                          {winPct.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-lg font-bold text-black text-center">
                      No team win data available
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

