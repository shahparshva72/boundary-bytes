'use client';

import { useQueryState } from 'nuqs';
import { parseAsInteger } from 'nuqs';
import { useRunScorers } from '@/hooks/useStatsAPI';
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

export default function RunScorers() {
  const [currentPage, setCurrentPage] = useQueryState(
    'runScorersPage',
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  );

  const { data, isLoading } = useRunScorers(currentPage);

  const totalPages = data?.pagination ? data.pagination.pages : 1;

  return (
    <div className="w-full mx-auto p-0 sm:p-4">
      <div className="bg-white border-2 sm:border-4 border-black rounded-none overflow-hidden">
        <div className="bg-[#FF5E5B] p-2 sm:p-4 border-b-2 sm:border-b-4 border-black">
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-black text-center uppercase tracking-wide">
            Leading Run Scorers
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <MoonLoader color="#4F46E5" size={50} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-[#4ECDC4] border-b-2 sm:border-b-4 border-black">
                  <tr>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      #
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      Player
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      Runs
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      Balls
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      4s
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      6s
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      Dot %
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      SR
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide whitespace-nowrap">
                      Mat
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
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {(currentPage - 1) * 10 + index + 1}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {player.player}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {player.runs}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {player.ballsFaced}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {player.fours}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {player.sixes}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {player.dotBallPercentage.toFixed(2)}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {player.strikeRate.toFixed(2)}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black whitespace-nowrap">
                          {player.matches}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 sm:px-6 py-6 sm:py-8 text-sm sm:text-lg font-bold text-black text-center"
                      >
                        No run scorers data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              skipSize={10}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
