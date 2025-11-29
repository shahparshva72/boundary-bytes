'use client';

import { useQueryState } from 'nuqs';
import { parseAsInteger } from 'nuqs';
import { useBowlingWicketTypes } from '@/hooks/useStatsAPI';
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

export default function BowlingWicketTypes() {
  const [currentPage, setCurrentPage] = useQueryState(
    'bowlingWicketTypesPage',
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  );

  const { data, isLoading } = useBowlingWicketTypes(currentPage);

  const totalPages = data?.pagination ? data.pagination.pages : 1;

  return (
    <div className="w-full mx-auto p-0 sm:p-4">
      <div className="bg-white border-2 sm:border-4 border-black rounded-none overflow-hidden">
        <div className="bg-[#FF5E5B] p-2 sm:p-4 border-b-2 sm:border-b-4 border-black">
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-black text-center uppercase tracking-wide">
            Bowling Wicket Types
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <MoonLoader color="#4F46E5" size={50} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead className="bg-[#4ECDC4] border-b-2 sm:border-b-4 border-black">
                  <tr>
                    <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      #
                    </th>
                    <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      Bowler
                    </th>
                    <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      Tot
                    </th>
                    <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      C
                    </th>
                    <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      B
                    </th>
                    <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      LBW
                    </th>
                    <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      St
                    </th>
                    <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      C&B
                    </th>
                    <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide border-r-2 border-black whitespace-nowrap">
                      HW
                    </th>
                    <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm md:text-base lg:text-xl font-black text-black uppercase tracking-wide whitespace-nowrap">
                      Mat
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
                        <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {(currentPage - 1) * 10 + index + 1}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {bowler.player}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {bowler.totalWickets}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {bowler.wicketTypes.caught}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {bowler.wicketTypes.bowled}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {bowler.wicketTypes.lbw}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {bowler.wicketTypes.stumped}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {bowler.wicketTypes.caughtAndBowled}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black border-r-2 border-black whitespace-nowrap">
                          {bowler.wicketTypes.hitWicket}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-base md:text-lg font-bold text-black whitespace-nowrap">
                          {bowler.matches}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 sm:px-6 py-6 sm:py-8 text-sm sm:text-lg font-bold text-black text-center"
                      >
                        No bowling wicket types data available
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
