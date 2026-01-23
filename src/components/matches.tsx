'use client';

import { useMatches } from '@/lib/useMatches';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import Pagination from './ui/Pagination';

function redirectToCricinfoScorecard(matchId: number) {
  const scorecardUrl = 'https://www.espncricinfo.com/matches/engine/match/' + matchId + '.html';
  window.open(scorecardUrl, '_blank');
}

interface MatchesProps {
  initialPage: number;
  initialSeason?: string;
}

interface Match {
  id: number;
  venue: string;
  startDate: string;
  season: string;
  team1: string;
  team2: string;
  innings1Score: string;
  innings2Score: string;
  result: string;
}

export default function Matches({ initialPage, initialSeason }: MatchesProps) {
  const { data, isLoading, error } = useMatches(initialPage, initialSeason);
  const router = useRouter();

  const cachedSeasonsRef = useRef<string[]>([]);

  if (data?.seasons && data.seasons.length > 0) {
    cachedSeasonsRef.current = data.seasons;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFEE0]">
        <div className="text-2xl font-bold text-red-600">Error loading matches</div>
      </div>
    );
  }

  const { matches, pagination } = data || {
    matches: [],
    pagination: { pages: 0 },
  };

  const seasons = cachedSeasonsRef.current;

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-2 sm:p-2.5 pb-20 gap-2 sm:gap-4 bg-[#FFFEE0]">
      <main className="flex flex-col gap-3 sm:gap-5 items-center w-full mx-auto my-2 sm:my-4">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 sm:gap-3 mb-1 sm:mb-2 w-full">
          <div className="bg-[#FF5E5B] p-2 sm:p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black transition-all hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-black text-center tracking-tight">
              BOUNDARY BYTES
            </h1>
          </div>
          <p className="text-sm sm:text-base font-bold text-black bg-[#4ECDC4] px-2 sm:px-3 py-1 sm:py-1.5 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-center">
            Get the latest cricket league stats and settle the debates with your friends!
          </p>
        </div>

        {/* Season Filter */}
        {seasons.length && (
          <div className="w-full flex flex-wrap gap-2 sm:gap-4 justify-center">
            <Link
              href="/"
              className={`px-3 sm:px-4 py-2 font-bold border-2 border-black text-black text-sm sm:text-base ${
                !initialSeason
                  ? 'bg-[#FF5E5B] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white hover:bg-[#FF5E5B] transition-colors'
              }`}
            >
              All Seasons
            </Link>
            {seasons.map((season: string) => (
              <Link
                key={season}
                href={`/?season=${season}`}
                className={`px-3 sm:px-4 py-2 font-bold border-2 border-black text-black text-sm sm:text-base ${
                  initialSeason === season
                    ? 'bg-[#FF5E5B] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white hover:bg-[#FF5E5B] transition-colors'
                }`}
              >
                {season}
              </Link>
            ))}
          </div>
        )}

        {/* Match cards */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {isLoading
            ? // Skeleton loader for 6 cards
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="p-2 sm:p-3 bg-white rounded-none border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-pulse"
                >
                  <div className="flex flex-col gap-2 sm:gap-2.5 mb-2 sm:mb-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-2.5">
                      <div className="flex-1">
                        <div className="h-5 sm:h-6 bg-gray-300 rounded w-3/4 mb-1.5"></div>
                        <div className="h-5 sm:h-6 bg-[#4ECDC4]/30 w-32 border-2 border-black"></div>
                      </div>
                      <div className="h-5 sm:h-6 bg-[#FF9F1C]/30 w-20 border-2 border-black"></div>
                    </div>
                  </div>

                  <div className="mb-2 sm:mb-3 grid gap-2 sm:gap-3">
                    <div className="font-mono bg-white p-2 sm:p-3 rounded-none border-2 border-black">
                      <div className="flex justify-between items-center gap-2">
                        <div className="h-5 sm:h-6 bg-gray-300 rounded w-2/3"></div>
                        <div className="h-5 sm:h-6 bg-[#FF5E5B]/30 w-20 border-2 border-black"></div>
                      </div>
                      <div className="my-2 sm:my-2.5 border-b-2 border-dashed border-black"></div>
                      <div className="flex justify-between items-center gap-2">
                        <div className="h-5 sm:h-6 bg-gray-300 rounded w-2/3"></div>
                        <div className="h-5 sm:h-6 bg-[#4ECDC4]/30 w-20 border-2 border-black"></div>
                      </div>
                    </div>

                    <div className="bg-[#FFED66]/30 p-2 sm:p-2.5 rounded-none border-2 border-black h-10 sm:h-12 w-full max-w-md mx-auto"></div>
                  </div>

                  <div className="flex justify-end mt-2 sm:mt-2.5">
                    <div className="h-7 sm:h-8 bg-[#FF9F1C]/30 w-24 border-2 border-black"></div>
                  </div>
                </div>
              ))
            : matches.map((match: Match) => (
                <div
                  key={match.id}
                  className="p-2 sm:p-3 bg-white rounded-none border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] sm:hover:translate-x-[2px] hover:translate-y-[1px] sm:hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <div className="flex flex-col gap-2 sm:gap-2.5 mb-2 sm:mb-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-2.5">
                      <div className="flex-1">
                        <h2 className="font-black text-lg sm:text-xl lg:text-2xl text-black">
                          {match.venue}
                        </h2>
                        <p className="text-sm sm:text-base font-bold text-black mt-0.5 bg-[#4ECDC4] px-1.5 sm:px-2 py-0.5 inline-block border-2 border-black">
                          {new Date(match.startDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-xs sm:text-sm bg-[#FF9F1C] px-2 sm:px-3 py-0.5 sm:py-1 rounded-none border-2 border-black font-black text-black self-start">
                        {match.season}
                      </div>
                    </div>
                  </div>

                  <div className="mb-2 sm:mb-3 grid gap-2 sm:gap-3">
                    <div className="bg-white p-2 sm:p-3 rounded-none border-2 border-black overflow-hidden">
                      <div className="flex justify-between items-center gap-2 min-w-0">
                        <span className="font-black text-base sm:text-lg lg:text-xl text-black truncate min-w-0 flex-1">
                          {match.team1}
                        </span>
                        <span className="font-black text-base sm:text-lg lg:text-xl bg-[#FF5E5B] px-1.5 sm:px-2 py-0.5 border-2 border-black text-black whitespace-nowrap flex-shrink-0">
                          {match.innings1Score}
                        </span>
                      </div>
                      <div className="my-2 sm:my-2.5 border-b-2 border-dashed border-black"></div>
                      <div className="flex justify-between items-center gap-2 min-w-0">
                        <span className="font-black text-base sm:text-lg lg:text-xl text-black truncate min-w-0 flex-1">
                          {match.team2}
                        </span>
                        <span className="font-black text-base sm:text-lg lg:text-xl bg-[#4ECDC4] px-1.5 sm:px-2 py-0.5 border-2 border-black text-black whitespace-nowrap flex-shrink-0">
                          {match.innings2Score}
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#FFED66] p-2 sm:p-2.5 rounded-none border-2 border-black text-center font-bold text-sm sm:text-base text-black w-full max-w-md mx-auto">
                      {match.result}
                    </div>
                  </div>

                  <div className="flex justify-end mt-2 sm:mt-2.5">
                    <button
                      onClick={() => redirectToCricinfoScorecard(match.id)}
                      className="text-xs sm:text-sm bg-[#FF9F1C] px-2 sm:px-3 py-1.5 rounded-none border-2 border-black font-black text-black cursor-pointer hover:bg-[#FF9F1C]/80 transition-colors"
                    >
                      Match #{match.id}
                    </button>
                  </div>
                </div>
              ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Pagination
            currentPage={initialPage}
            totalPages={pagination.pages}
            skipSize={10}
            onPageChange={(page) => {
              const params = new URLSearchParams();
              params.set('page', String(page));
              if (initialSeason) {
                params.set('season', initialSeason);
              }
              router.push(`/?${params.toString()}`);
            }}
          />
        )}
      </main>
    </div>
  );
}
