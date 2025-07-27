'use client';

import { useState } from 'react';
import { useWicketTakers } from '@/hooks/useStatsAPI';
import { MoonLoader } from 'react-spinners';
import Pagination from './Pagination';

interface WicketTakerData {
  player: string;
  wickets: number;
  ballsBowled: number;
  economy: number;
  matches: number;
}

export default function WicketTakers() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useWicketTakers(currentPage);

  const totalPages = data?.pagination ? data.pagination.pages : 1;

  return (
    <div className="w-full mx-auto p-4">
      <div className="bg-white border-4 border-black rounded-none overflow-hidden">
        <div className="bg-[#FF5E5B] p-4 border-b-4 border-black">
          <h2 className="text-2xl font-black text-black text-center uppercase tracking-wide">
            Leading Wicket Takers
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
                    Wickets
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Balls Bowled
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Economy
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide">
                    Matches
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.data && data.data.length > 0 ? (
                  data.data.map((player: WicketTakerData, index: number) => (
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
                        {player.wickets}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {player.ballsBowled}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {player.economy.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black">{player.matches}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-lg font-bold text-black text-center">
                      No wicket takers data available
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
