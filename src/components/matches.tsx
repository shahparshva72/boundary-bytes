'use client';

import { useMatches } from '@/lib/useMatches';
import { MoonLoader } from 'react-spinners';
import Link from 'next/link';

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFEE0]">
        <MoonLoader color="#1a202c" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFEE0]">
        <div className="text-2xl font-bold text-red-600">Error loading matches</div>
      </div>
    );
  }

  const { matches, pagination, seasons } = data!;

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 pb-20 gap-8 sm:p-8 bg-[#FFFEE0]">
      <main className="flex flex-col gap-[40px] items-center w-full max-w-5xl mx-auto my-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-6 mb-4 w-full">
          <div className="bg-[#FF5E5B] p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-black text-black text-center tracking-tight">
              BOUNDARY BYTES
            </h1>
          </div>
          <p className="text-xl font-bold text-black bg-[#4ECDC4] px-6 py-3 rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            An upcoming cricket stats query website.
          </p>
        </div>

        {/* Season Filter */}
        <div className="w-full flex flex-wrap gap-4 justify-center">
          <Link
            href="/"
            className={`px-4 py-2 font-bold border-2 border-black text-black ${
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
              className={`px-4 py-2 font-bold border-2 border-black text-black ${
                initialSeason === season
                  ? 'bg-[#FF5E5B] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white hover:bg-[#FF5E5B] transition-colors'
              }`}
            >
              {season}
            </Link>
          ))}
        </div>

        {/* Match cards */}
        <div className="w-full grid gap-12">
          {matches.map((match: Match) => (
            <div
              key={match.id}
              className="p-8 bg-white rounded-none border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h2 className="font-black text-3xl text-black">{match.venue}</h2>
                  <p className="text-lg font-bold text-black mt-1 bg-[#4ECDC4] px-3 py-1 inline-block border-2 border-black">
                    {new Date(match.startDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="text-lg bg-[#FF9F1C] px-4 py-2 rounded-none border-3 border-black font-black text-black self-start">
                  {match.season}
                </div>
              </div>

              <div className="mb-6 grid gap-6">
                <div className="font-mono bg-white p-6 rounded-none border-4 border-black">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-2xl text-black">{match.team1}</span>
                    <span className="font-black text-2xl bg-[#FF5E5B] px-3 py-1 border-2 border-black text-black">
                      {match.innings1Score}
                    </span>
                  </div>
                  <div className="my-4 border-b-4 border-dashed border-black"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-2xl text-black">{match.team2}</span>
                    <span className="font-black text-2xl bg-[#4ECDC4] px-3 py-1 border-2 border-black text-black">
                      {match.innings2Score}
                    </span>
                  </div>
                </div>

                <div className="bg-[#FFED66] p-4 rounded-none border-4 border-black text-center font-bold text-xl text-black w-full max-w-md mx-auto">
                  {match.result}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <div className="text-base bg-[#FF9F1C] px-4 py-2 rounded-none border-3 border-black font-black text-black">
                  Match #{match.id}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex gap-4 justify-center flex-wrap">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <a
                key={page}
                href={`/?page=${page}${initialSeason ? `&season=${initialSeason}` : ''}`}
                className={`px-6 py-3 font-bold border-2 border-black text-black ${
                  initialPage === page
                    ? 'bg-[#FF5E5B] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white hover:bg-[#FF5E5B] transition-colors'
                }`}
              >
                {page}
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
