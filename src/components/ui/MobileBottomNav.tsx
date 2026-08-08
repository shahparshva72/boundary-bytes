'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileBottomNavProps {
  onOpenSearch: () => void;
}

export default function MobileBottomNav({ onOpenSearch }: MobileBottomNavProps) {
  const pathname = usePathname();

  const isMatches = pathname === '/';
  const isStats = pathname.startsWith('/stats') || pathname.startsWith('/stat-explorer');
  const isPlayers = pathname.startsWith('/players');
  const isPlay = pathname.startsWith('/play');

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFC700] border-t-2 border-black shadow-[0px_-2px_0px_0px_rgba(0,0,0,1)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-14 items-center">
        {/* Matches (Home) */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center h-full gap-0.5 border-r border-black font-black text-[10px] transition-colors ${
            isMatches ? 'bg-black text-white' : 'text-black hover:bg-[#FFED66]'
          }`}
        >
          <span className="text-base">🏟️</span>
          <span>Matches</span>
        </Link>

        {/* Stats Hub */}
        <Link
          href="/stats"
          className={`flex flex-col items-center justify-center h-full gap-0.5 border-r border-black font-black text-[10px] transition-colors ${
            isStats ? 'bg-black text-white' : 'text-black hover:bg-[#FFED66]'
          }`}
        >
          <span className="text-base">📊</span>
          <span>Stats</span>
        </Link>

        {/* Search Quick Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center h-full gap-0.5 border-r border-black font-black text-[10px] bg-[#4ECDC4] text-black hover:bg-[#4ECDC4]/80 active:bg-black active:text-white transition-colors"
          aria-label="Quick Search"
        >
          <span className="text-base">🔍</span>
          <span>Search</span>
        </button>

        {/* Players */}
        <Link
          href="/players"
          className={`flex flex-col items-center justify-center h-full gap-0.5 border-r border-black font-black text-[10px] transition-colors ${
            isPlayers ? 'bg-black text-white' : 'text-black hover:bg-[#FFED66]'
          }`}
        >
          <span className="text-base">👤</span>
          <span>Players</span>
        </Link>

        {/* Play Games */}
        <Link
          href="/play"
          className={`flex flex-col items-center justify-center h-full gap-0.5 font-black text-[10px] transition-colors ${
            isPlay ? 'bg-black text-white' : 'text-black hover:bg-[#FFED66]'
          }`}
        >
          <span className="text-base">🎮</span>
          <span>Play</span>
        </Link>
      </div>
    </nav>
  );
}
