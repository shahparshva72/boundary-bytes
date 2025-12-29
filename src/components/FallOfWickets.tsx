'use client';

import { fetchFallOfWickets } from '@/services/statsService';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import MatchSelector from './MatchSelector';
import {
  Card,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHeadCell,
  DataTableHeader,
  DataTableRow,
  SectionHeader,
} from './ui';

interface WicketData {
  wicketNumber: number;
  over: string;
  runsAtFall: number;
  batsmanOut: string;
  dismissalType: string;
  bowler: string;
}

interface InningsData {
  inningsNumber: number;
  battingTeam: string;
  wickets: WicketData[];
}

interface FallOfWicketsData {
  matchInfo: {
    id: number;
    teams: string[];
    venue: string;
    date: string;
    season: string;
  };
  innings: InningsData[];
}

export default function FallOfWickets() {
  const [selectedMatchId, setSelectedMatchId] = useState<number | undefined>();

  const { data, isLoading, error } = useQuery<FallOfWicketsData>({
    queryKey: ['fallOfWickets', selectedMatchId],
    queryFn: () => fetchFallOfWickets(selectedMatchId!),
    enabled: !!selectedMatchId,
  });

  const handleMatchSelect = (matchId: number) => {
    setSelectedMatchId(matchId);
  };

  const wicketHeaders = ['W', 'Over', 'Runs', 'Out', 'How', 'Bowler'];

  return (
    <div className="w-full mx-auto p-2 sm:p-4">
      <Card variant="default" className="border-4">
        <SectionHeader title="Fall of Wickets Analysis" color="coral" size="md" />

        <div className="p-3 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <label className="block text-base sm:text-lg font-black text-black mb-2 uppercase tracking-wide">
              Select Match:
            </label>
            <MatchSelector onMatchSelect={handleMatchSelect} selectedMatchId={selectedMatchId} />
          </div>

          {!selectedMatchId ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-base sm:text-lg font-bold text-black">
                Please select a match to view fall of wickets data
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-4 sm:space-y-6 animate-pulse">
              <div className="bg-[#4ECDC4]/30 border-4 border-black p-3 sm:p-4">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-1/2"></div>
              </div>

              {Array.from({ length: 2 }).map((_, inningsIndex) => (
                <div key={inningsIndex} className="border-4 border-black">
                  <div className="bg-[#FFC700]/30 p-3 sm:p-4 border-b-4 border-black">
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead className="bg-[#4ECDC4]/30 border-b-4 border-black">
                        <tr>
                          {wicketHeaders.map((header, i) => (
                            <th
                              key={i}
                              className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left ${i < 5 ? 'border-r-2 border-black' : ''}`}
                            >
                              <div className="h-4 bg-gray-300 rounded w-16"></div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 5 }).map((_, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#FFED66]/30'} border-b-2 border-black`}
                          >
                            {Array.from({ length: 6 }).map((_, colIndex) => (
                              <td
                                key={colIndex}
                                className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 ${colIndex < 5 ? 'border-r-2 border-black' : ''}`}
                              >
                                <div className="h-4 bg-gray-300 rounded w-20"></div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-base sm:text-lg font-bold text-black">
                Error loading fall of wickets data. Please try again.
              </p>
            </div>
          ) : data && data.innings && data.innings.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-[#4ECDC4] border-4 border-black p-3 sm:p-4">
                <h3 className="text-base sm:text-lg md:text-xl font-black text-black uppercase tracking-wide mb-1 sm:mb-2">
                  {data.matchInfo.teams.join(' vs ')}
                </h3>
                <p className="text-sm sm:text-base md:text-lg font-bold text-black">
                  {data.matchInfo.venue} - {data.matchInfo.date} - {data.matchInfo.season}
                </p>
              </div>

              {data.innings.map((innings: InningsData) => (
                <div key={innings.inningsNumber} className="border-4 border-black">
                  <div className="bg-[#FFC700] p-3 sm:p-4 border-b-4 border-black">
                    <h4 className="text-base sm:text-lg md:text-xl font-black text-black uppercase tracking-wide">
                      Innings {innings.inningsNumber} - {innings.battingTeam}
                    </h4>
                  </div>

                  {innings.wickets.length > 0 ? (
                    <DataTable minWidth="500px">
                      <DataTableHeader color="teal">
                        <tr>
                          {wicketHeaders.map((header, idx) => (
                            <DataTableHeadCell
                              key={header}
                              isLast={idx === wicketHeaders.length - 1}
                            >
                              {header}
                            </DataTableHeadCell>
                          ))}
                        </tr>
                      </DataTableHeader>
                      <DataTableBody>
                        {innings.wickets.map((wicket: WicketData, index: number) => (
                          <DataTableRow
                            key={`${innings.inningsNumber}-${wicket.wicketNumber}`}
                            index={index}
                          >
                            <DataTableCell>{wicket.wicketNumber}</DataTableCell>
                            <DataTableCell>{wicket.over}</DataTableCell>
                            <DataTableCell>{wicket.runsAtFall}</DataTableCell>
                            <DataTableCell>{wicket.batsmanOut}</DataTableCell>
                            <DataTableCell>{wicket.dismissalType}</DataTableCell>
                            <DataTableCell isLast>{wicket.bowler}</DataTableCell>
                          </DataTableRow>
                        ))}
                      </DataTableBody>
                    </DataTable>
                  ) : (
                    <div className="p-4 sm:p-6 text-center">
                      <p className="text-base sm:text-lg font-bold text-black">
                        No wickets fell in this innings
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <p className="text-base sm:text-lg font-bold text-black">
                No fall of wickets data available for this match
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
