'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface StatLink {
  href: string;
  label: string;
  description: string;
}

const STAT_LINKS: StatLink[] = [
  {
    href: '/stats',
    label: 'Stats Hub & Leaderboards',
    description: 'Run scorers, wicket takers, matchups and team averages',
  },
  {
    href: '/stats/advanced',
    label: 'Phase Analysis (Overs)',
    description: 'Powerplay (1-6), Middle (7-15) and Death (16-20)',
  },
  {
    href: '/stats/player-progression',
    label: 'Innings Progression',
    description: 'Strike rate acceleration curve across 20 overs',
  },
  {
    href: '/stats/compare',
    label: 'Compare Players',
    description: 'Side-by-side batting and bowling comparison',
  },
  {
    href: '/stat-explorer',
    label: 'Stat Explorer',
    description: 'Multi-filter custom statistical explorer',
  },
];

interface StatsSubNavProps {
  current?: string;
}

export default function StatsSubNav({ current }: StatsSubNavProps) {
  const pathname = usePathname();

  return (
    <div className="w-full max-w-6xl mx-auto mb-4 sm:mb-6">
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2.5 sm:p-3">
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b-2 border-black">
          <span className="font-black text-xs sm:text-sm uppercase tracking-wider text-black">
            Cricket Analytics Suite
          </span>
          <Link
            href="/stats"
            className="text-xs font-black text-black hover:text-[#FF5E5B] underline flex items-center gap-1"
          >
            <span>←</span> Back to Main Hub
          </Link>
        </div>

        {/* Horizontal scrollable pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide py-1">
          {STAT_LINKS.map((link) => {
            const isActive = current ? current === link.href : pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 border-2 border-black font-black text-xs sm:text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#FF5E5B] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                    : 'bg-[#FFFEE0] text-black hover:bg-[#FFED66] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
