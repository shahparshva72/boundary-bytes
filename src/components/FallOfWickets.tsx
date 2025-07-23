'use client';

import { useState } from 'react';
import { fetchFallOfWickets } from '@/services/statsService';
import { useQuery } from '@tanstack/react-query';
import { MoonLoader } from 'react-spinners';
import MatchSelector from './MatchSelector';

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

  return (
    <div className="w-full mx-auto p-4">
      <div className="bg-white border-4 border-black rounded-none overflow-hidden">
        <div className="bg-[#FF5E5B] p-4 border-b-4 border-black">
          <h2 className="text-2xl font-black text-black text-center uppercase tracking-wide">
            Fall of Wickets Analysis
          </h2>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-lg font-black text-black mb-2 uppercase tracking-wide">
              Select Match:
            </label>
            <MatchSelector onMatchSelect={handleMatchSelect} selectedMatchId={selectedMatchId} />
          </div>

          {!selectedMatchId ? (
            <div className="text-center py-8">
              <p className="text-lg font-bold text-black">
                Please select a match to view fall of wickets data
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center p-6">
              <MoonLoader color="#4F46E5" size={50} />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-lg font-bold text-black">
                Error loading fall of wickets data. Please try again.
              </p>
            </div>
          ) : data && data.innings && data.innings.length > 0 ? (
            <div className="space-y-6">
              {/* Match Info */}
              <div className="bg-[#4ECDC4] border-4 border-black p-4">
                <h3 className="text-xl font-black text-black uppercase tracking-wide mb-2">
                  {data.matchInfo.teams.join(' vs ')}
                </h3>
                <p className="text-lg font-bold text-black">
                  {data.matchInfo.venue} • {data.matchInfo.date} • {data.matchInfo.season}
                </p>
              </div>

              {/* Innings Data */}
              {data.innings.map((innings: InningsData) => (
                <div key={innings.inningsNumber} className="border-4 border-black">
                  <div className="bg-[#FFC700] p-4 border-b-4 border-black">
                    <h4 className="text-xl font-black text-black uppercase tracking-wide">
                      Innings {innings.inningsNumber} - {innings.battingTeam}
                    </h4>
                  </div>

                  {innings.wickets.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#4ECDC4] border-b-4 border-black">
                          <tr>
                            <th className="px-4 py-3 text-left text-lg font-black text-black uppercase tracking-wide border-r-4 border-black">
                              Wicket
                            </th>
                            <th className="px-4 py-3 text-left text-lg font-black text-black uppercase tracking-wide border-r-4 border-black">
                              Over
                            </th>
                            <th className="px-4 py-3 text-left text-lg font-black text-black uppercase tracking-wide border-r-4 border-black">
                              Runs
                            </th>
                            <th className="px-4 py-3 text-left text-lg font-black text-black uppercase tracking-wide border-r-4 border-black">
                              Batsman Out
                            </th>
                            <th className="px-4 py-3 text-left text-lg font-black text-black uppercase tracking-wide border-r-4 border-black">
                              How Out
                            </th>
                            <th className="px-4 py-3 text-left text-lg font-black text-black uppercase tracking-wide">
                              Bowler
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {innings.wickets.map((wicket: WicketData, index: number) => (
                            <tr
                              key={`${innings.inningsNumber}-${wicket.wicketNumber}`}
                              className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#FFED66]'}
                                border-b-2 border-black hover:bg-[#FFED66] transition-colors duration-150`}
                            >
                              <td className="px-4 py-3 text-lg font-bold text-black border-r-2 border-black">
                                {wicket.wicketNumber}
                              </td>
                              <td className="px-4 py-3 text-lg font-bold text-black border-r-2 border-black">
                                {wicket.over}
                              </td>
                              <td className="px-4 py-3 text-lg font-bold text-black border-r-2 border-black">
                                {wicket.runsAtFall}
                              </td>
                              <td className="px-4 py-3 text-lg font-bold text-black border-r-2 border-black">
                                {wicket.batsmanOut}
                              </td>
                              <td className="px-4 py-3 text-lg font-bold text-black border-r-2 border-black">
                                {wicket.dismissalType}
                              </td>
                              <td className="px-4 py-3 text-lg font-bold text-black">
                                {wicket.bowler}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-lg font-bold text-black">
                        No wickets fell in this innings
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg font-bold text-black">
                No fall of wickets data available for this match
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
