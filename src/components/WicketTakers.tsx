'use client';

import { useQueryState } from 'nuqs';
import { parseAsInteger } from 'nuqs';
import { useWicketTakers } from '@/hooks/useStatsAPI';
import { MoonLoader } from 'react-spinners';
import Pagination from './Pagination';

interface WicketTakerData {
  player: string;
  wickets: number;
  runsConceded: number;
  average: number;
  ballsBowled: number;
  economy: number;
  matches: number;
}

export default function WicketTakers() {
  const [currentPage, setCurrentPage] = useQueryState(
    'wicketTakersPage',
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  );

  const { data, isLoading } = useWicketTakers(currentPage);

  const totalPages = data?.pagination ? data.pagination.pages : 1;

  return (
    <div className="w-full mx-auto p-0 sm:p-4">
      <div className="bg-white border-2 sm:border-4 border-black rounded-none overflow-hidden">
        <div className="bg-[#FF5E5B] p-2 sm:p-4 border-b-2 sm:border-b-4 border-black">
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-black text-center uppercase tracking-wide">
            Leading Wicket Takers
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <MoonLoader color="#4F46E5" size={50} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[550px]">
                <thead className="bg-[#4ECDC4] border-b-2 sm:border-b-4 border-black">
                  <tr>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      #
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      Player
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      Wkts
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      Runs
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      Avg
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      Balls
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      Econ
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide whitespace-nowrap">
                      Mat
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
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {(currentPage - 1) * 10 + index + 1}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {player.player}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {player.wickets}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {player.runsConceded}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {player.average.toFixed(2)}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {player.ballsBowled}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {player.economy.toFixed(2)}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black whitespace-nowrap">
                          {player.matches}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 sm:px-6 py-6 sm:py-8 text-sm sm:text-lg font-bold text-black text-center"
                      >
                        No wicket takers data available
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
