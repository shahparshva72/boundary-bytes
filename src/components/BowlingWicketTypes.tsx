'use client';

import { useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { MoonLoader } from 'react-spinners';
import Pagination from './Pagination';

interface BowlingWicketTypesData {
  player: string;
  totalWickets: number;
  wicketTypes: {
    caught: number;
    bowled: number;
    lbw: number;
    stumped: number;
    caughtAndBowled: number;
    hitWicket: number;
  };
  matches: number;
}

const fetchBowlingWicketTypes = async (page: number) => {
  const { data } = await axios.get('/api/stats/bowling-wicket-types', {
    params: { page, limit: 10 },
  });
  return data;
};

export default function BowlingWicketTypes() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['bowlingWicketTypes', currentPage],
    queryFn: () => fetchBowlingWicketTypes(currentPage),
  });

  const totalPages = data ? Math.ceil(data.total / 10) : 1;

  return (
    <div className="w-full mx-auto p-4">
      <div className="bg-white border-4 border-black rounded-none overflow-hidden">
        <div className="bg-[#FF5E5B] p-4 border-b-4 border-black">
          <h2 className="text-2xl font-black text-black text-center uppercase tracking-wide">
            Bowling Wicket Types
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
                    Bowler
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Caught
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Bowled
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    LBW
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Stumped
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    C&B
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide border-r-4 border-black">
                    Hit Wicket
                  </th>
                  <th className="px-6 py-4 text-left text-xl font-black text-black uppercase tracking-wide">
                    Matches
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.data && data.data.length > 0 ? (
                  data.data.map((bowler: BowlingWicketTypesData, index: number) => (
                    <tr
                      key={bowler.player}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#FFED66]'}
                        border-b-2 border-black hover:bg-[#FFED66] transition-colors duration-150`}
                    >
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {(currentPage - 1) * 10 + index + 1}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {bowler.player}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {bowler.totalWickets}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {bowler.wicketTypes.caught}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {bowler.wicketTypes.bowled}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {bowler.wicketTypes.lbw}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {bowler.wicketTypes.stumped}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {bowler.wicketTypes.caughtAndBowled}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black border-r-2 border-black">
                        {bowler.wicketTypes.hitWicket}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-black">{bowler.matches}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-lg font-bold text-black text-center">
                      No bowling wicket types data available
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
