'use client';

import { useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { MoonLoader } from 'react-spinners';
import Pagination from './Pagination';

interface RunScorerData {
  player: string;
  runs: number;
  ballsFaced: number;
  strikeRate: number;
  matches: number;
  fours: number;
  sixes: number;
  dotBallPercentage: number;
}

const fetchRunScorers = async (page: number) => {
  const { data } = await axios.get('/api/stats/leading-run-scorers', {
    params: { page, limit: 10 },
  });
  return data;
};

export default function RunScorers() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['runScorers', currentPage],
    queryFn: () => fetchRunScorers(currentPage),
  });

  const totalPages = data ? Math.ceil(data.total / 10) : 1;

  return (
    <div className="w-full mx-auto p-4">
      <div className="bg-white border-4 border-black rounded-none overflow-hidden">
        <div className="bg-[#FF5E5B] p-4 border-b-4 border-black">
          <h2 className="text-2xl font-black text-black text-center uppercase tracking-wide">
            Leading Run Scorers
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <MoonLoader color="#4F46E5" size={50} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#4ECDC4] border-b-4 border-black">
                <tr>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Player
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Runs
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Balls
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    4s
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    6s
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Dot Ball %
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Strike Rate
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide">
                    Matches
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.data && data.data.length > 0 ? (
                  data.data.map((player: RunScorerData, index: number) => (
                    <tr
                      key={player.player}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#FFED66]'}
                        border-b-2 border-black hover:bg-[#FFED66] transition-colors duration-150`}
                    >
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {(currentPage - 1) * 10 + index + 1}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {player.player}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {player.runs}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {player.ballsFaced}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {player.fours}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {player.sixes}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {player.dotBallPercentage.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {player.strikeRate.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black">{player.matches}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-lg font-bold text-black text-center">
                      No run scorers data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
