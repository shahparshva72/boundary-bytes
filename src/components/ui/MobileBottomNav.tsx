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
      <div className="grid grid-cols-5 h-12 items-center">
        {/* Matches */}
        <Link
          href="/"
          className={`flex items-center justify-center h-full border-r-2 border-black font-black text-xs uppercase tracking-tight transition-colors ${
            isMatches ? 'bg-black text-white' : 'text-black hover:bg-[#FFED66]'
          }`}
        >
          Matches
        </Link>

        {/* Stats Hub */}
        <Link
          href="/stats"
          className={`flex items-center justify-center h-full border-r-2 border-black font-black text-xs uppercase tracking-tight transition-colors ${
            isStats ? 'bg-black text-white' : 'text-black hover:bg-[#FFED66]'
          }`}
        >
          Stats
        </Link>

        {/* Search Quick Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center justify-center h-full border-r-2 border-black font-black text-xs uppercase tracking-tight bg-[#4ECDC4] text-black hover:bg-[#FFED66] active:bg-black active:text-white transition-colors cursor-pointer"
          aria-label="Quick Search"
        >
          Search
        </button>

        {/* Players */}
        <Link
          href="/players"
          className={`flex items-center justify-center h-full border-r-2 border-black font-black text-xs uppercase tracking-tight transition-colors ${
            isPlayers ? 'bg-black text-white' : 'text-black hover:bg-[#FFED66]'
          }`}
        >
          Players
        </Link>

        {/* Play Games */}
        <Link
          href="/play"
          className={`flex items-center justify-center h-full font-black text-xs uppercase tracking-tight transition-colors ${
            isPlay ? 'bg-black text-white' : 'text-black hover:bg-[#FFED66]'
          }`}
        >
          Play
        </Link>
      </div>
    </nav>
  );
}
