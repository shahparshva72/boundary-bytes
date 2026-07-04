import type { Metadata } from 'next';
import Link from 'next/link';
import PlayersPagination from '@/components/players/PlayersPagination';
import { listPlayerSlugs, type PlayerSlugEntry } from '@/services/playerService';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 60;

function parsePage(pageParam?: string): number {
  const parsed = Number(pageParam);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);

  const title =
    page > 1
      ? `Cricket Players Directory — Page ${page} | Boundary Bytes`
      : 'Cricket Players Directory | Boundary Bytes';
  const description =
    'Browse cricket player profiles and career statistics across WPL, IPL, BBL, WBBL and SA20.';

  return {
    title,
    description,
    alternates: { canonical: page > 1 ? `/players?page=${page}` : '/players' },
  };
}

export default async function PlayersDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const requestedPage = parsePage(pageParam);

  let players: PlayerSlugEntry[] = [];
  let totalPlayers = 0;
  let totalPages = 0;
  let currentPage = requestedPage;
  let error = false;

  try {
    const result = await listPlayerSlugs(requestedPage, PAGE_SIZE);
    players = result.players;
    totalPlayers = result.pagination.total;
    totalPages = result.pagination.pages;
    currentPage = result.pagination.currentPage;
  } catch {
    error = true;
  }

  return (
    <div className="p-2 sm:p-3 md:p-4 pb-16 sm:pb-20">
      <div className="max-w-4xl mx-auto flex flex-col gap-3 sm:gap-4 md:gap-6">
        <div className="bg-[#FF5E5B] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 md:p-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-black tracking-tight text-center">
            Players Directory
          </h1>
          <p className="mt-2 text-sm sm:text-base font-bold text-black text-center">
            Browse {totalPlayers} player profiles across WPL, IPL, BBL, WBBL and SA20.
          </p>
        </div>

        {error && (
          <div className="bg-[#FFED66] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
            <p className="text-sm sm:text-base font-bold text-black text-center">
              Player directory is temporarily unavailable. Please try again shortly.
            </p>
          </div>
        )}

        {!error && players.length === 0 && (
          <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
            <p className="text-sm sm:text-base font-bold text-black text-center">
              No players found on this page.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
          {players.map((player) => (
            <Link
              key={player.slug}
              href={`/players/${player.slug}`}
              className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-2 sm:p-3 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <span className="text-sm sm:text-base font-black text-black block">
                {player.playerName}
              </span>
              <span className="text-xs font-bold text-black/70">{player.leagues.join(', ')}</span>
            </Link>
          ))}
        </div>

        <PlayersPagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
