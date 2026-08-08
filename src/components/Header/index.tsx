'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useLeagueContext } from '@/contexts/LeagueContext';
import CommandPalette from '../ui/CommandPalette';
import LeagueSwitcher from '../ui/LeagueSwitcher';
import NavLink from './NavLink';

const STATS_CATEGORIES = [
  {
    title: '🏆 Leaderboards',
    items: [
      {
        href: '/stats?tab=Run+Scorers',
        label: 'Run Scorers',
        icon: '🏏',
        desc: 'Top run getters & boundaries',
      },
      {
        href: '/stats?tab=Wicket+Takers',
        label: 'Wicket Takers',
        icon: '🎯',
        desc: 'Most wickets & best figures',
      },
      {
        href: '/stats?tab=Bowling+Wicket+Types',
        label: 'Dismissal Types',
        icon: '🧤',
        desc: 'Bowled, caught, LBW stats',
      },
    ],
  },
  {
    title: '⚔️ Matchups & Compare',
    items: [
      {
        href: '/stats?tab=Batter+vs+Bowler',
        label: 'Batter vs Bowler',
        icon: '🥊',
        desc: 'Head-to-head individual rivalry',
      },
      {
        href: '/stats?tab=Multi+Matchup',
        label: 'Multi Matchup Matrix',
        icon: '🔢',
        desc: 'Squad vs squad matrix',
      },
      {
        href: '/stats/compare',
        label: 'Compare Players',
        icon: '⚖️',
        desc: '2-5 player side-by-side bench',
      },
    ],
  },
  {
    title: '📈 Phase & Trends',
    items: [
      {
        href: '/stats/advanced',
        label: 'Over Phase Stats',
        icon: '⚡',
        desc: 'Powerplay (1-6) & Death (16-20)',
      },
      {
        href: '/stats/player-progression',
        label: 'Innings Progression',
        icon: '📈',
        desc: 'Strike rate acceleration curve',
      },
      {
        href: '/stats?tab=Team+Run+Rate',
        label: 'Team Run Rate Trends',
        icon: '📊',
        desc: 'Over-by-over progression',
      },
    ],
  },
  {
    title: '🛠️ Deep Queries & Teams',
    items: [
      {
        href: '/stat-explorer',
        label: 'Stat Explorer',
        icon: '🔍',
        desc: 'Multi-filter deep query engine',
      },
      {
        href: '/stats?tab=Team+Wins',
        label: 'Team Wins & Margins',
        icon: '🏆',
        desc: 'Toss correlation & win records',
      },
      {
        href: '/stats?tab=Team+Averages',
        label: 'Team Averages',
        icon: '🛡️',
        desc: 'Overall batting & bowling rates',
      },
    ],
  },
];

const Header = () => {
  const pathname = usePathname();
  const { selectedLeague, leagueConfig } = useLeagueContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStatsDropdownOpen, setIsStatsDropdownOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Is any stat page active?
  const isStatsActive =
    pathname === '/stats' ||
    pathname.startsWith('/stats/') ||
    pathname.startsWith('/stat-explorer');

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Cmd+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFC700] p-2 sm:p-2.5 border-b-2 border-black shadow-[0px_2px_0px_0px_rgba(0,0,0,1)]">
        <div className="container mx-auto flex justify-between items-center gap-2">
          {/* Logo + League Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <Link
              href="/"
              className="text-lg sm:text-xl lg:text-2xl font-black text-black tracking-tighter flex items-center gap-1 hover:opacity-90 transition-opacity"
            >
              <span>Boundary Bytes</span>
            </Link>

            {selectedLeague && leagueConfig && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-black text-white font-black text-xs uppercase border border-black shadow-[1px_1px_0px_0px_rgba(255,255,255,1)]">
                <span>{leagueConfig.icon}</span>
                <span>{leagueConfig.name}</span>
              </div>
            )}
          </div>

          {/* Core Desktop Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              {/* 1. Matches */}
              <NavLink href="/" exact>
                Matches
              </NavLink>

              {/* 2. Stats & Analytics Mega Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center">
                  <Link
                    href="/stats"
                    className={`text-sm sm:text-base font-black tracking-tight px-2.5 lg:px-3 py-1.5 border-2 border-black border-r-0 transition-all ${
                      isStatsActive
                        ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white text-black hover:bg-[#FFED66] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    Stats & Analytics
                  </Link>
                  <button
                    onClick={() => setIsStatsDropdownOpen((prev) => !prev)}
                    className={`px-1.5 lg:px-2 py-1.5 border-2 border-black font-black text-xs transition-all ${
                      isStatsActive
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-[#FFED66]'
                    }`}
                    aria-label="Toggle Stats Menu"
                    aria-expanded={isStatsDropdownOpen}
                  >
                    <span
                      className={`inline-block transition-transform duration-200 ${isStatsDropdownOpen ? 'rotate-180' : ''}`}
                    >
                      ▼
                    </span>
                  </button>
                </div>

                {/* Mega Dropdown Menu */}
                {isStatsDropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[720px] bg-[#FFFEE0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        <h3 className="font-black text-base uppercase text-black">
                          Cricket Statistics & Analytics Hub
                        </h3>
                      </div>
                      <Link
                        href="/stats"
                        onClick={() => setIsStatsDropdownOpen(false)}
                        className="text-xs font-black bg-[#FF5E5B] text-white px-2 py-1 border border-black hover:bg-black transition-colors"
                      >
                        Open Full Dashboard →
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {STATS_CATEGORIES.map((category) => (
                        <div
                          key={category.title}
                          className="bg-white border-2 border-black p-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                          <h4 className="font-black text-xs sm:text-sm text-black mb-2 pb-1 border-b border-black/20 uppercase tracking-wide">
                            {category.title}
                          </h4>
                          <div className="space-y-1.5">
                            {category.items.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsStatsDropdownOpen(false)}
                                className="group flex items-start gap-2 p-1.5 hover:bg-[#FFED66] transition-colors rounded-none"
                              >
                                <span className="text-base flex-shrink-0">{item.icon}</span>
                                <div className="min-w-0">
                                  <p className="font-bold text-xs text-black group-hover:text-red-600 transition-colors">
                                    {item.label}
                                  </p>
                                  <p className="text-[10px] text-gray-600 truncate">{item.desc}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Deep Link to Explorer */}
                    <div className="mt-3 pt-2.5 border-t-2 border-black/20 flex justify-between items-center bg-[#FFED66] p-2 border border-black">
                      <span className="text-xs font-bold text-black">
                        🛠️ Want custom multi-dimensional stats?
                      </span>
                      <Link
                        href="/stat-explorer"
                        onClick={() => setIsStatsDropdownOpen(false)}
                        className="text-xs font-black bg-[#4ECDC4] text-black px-2.5 py-1 border border-black hover:bg-black hover:text-white transition-colors"
                      >
                        Launch Stat Explorer
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Players */}
              <NavLink href="/players">Players</NavLink>

              {/* 4. Play */}
              <NavLink href="/play">Play 🎮</NavLink>

              {/* 5. AI Chat */}
              <NavLink href="/chat">Chat 🤖</NavLink>
            </nav>

            {/* Quick Search (Cmd + K) Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-white border-2 border-black font-bold text-xs sm:text-sm text-black hover:bg-[#FFED66] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              title="Quick Search (Cmd+K / Ctrl+K)"
            >
              <span>🔍</span>
              <span className="hidden lg:inline text-xs font-mono bg-black text-white px-1.5 py-0.5">
                ⌘K
              </span>
            </button>

            {/* League Switcher */}
            {selectedLeague && <LeagueSwitcher />}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span
                className={`block w-4 h-0.5 bg-black transition-transform duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''
                }`}
              />
              <span
                className={`block w-4 h-0.5 bg-black my-0.5 transition-opacity duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-4 h-0.5 bg-black transition-transform duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Slide-Over Menu */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 z-40 md:hidden animate-in fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <nav className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[#FFFEE0] border-l-4 border-black z-50 md:hidden flex flex-col p-4 shadow-[-6px_0px_0px_0px_rgba(0,0,0,1)] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center pb-3 mb-3 border-b-2 border-black">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">🏏</span>
                  <span className="text-lg font-black text-black">Menu</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 bg-[#FF5E5B] text-white border-2 border-black flex items-center justify-center font-black text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              {/* Quick Search Button in Mobile Menu */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCommandPaletteOpen(true);
                }}
                className="w-full flex items-center justify-between p-2.5 mb-3 bg-[#FFED66] border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <span>🔍 Quick Search Stats & Players</span>
                <span className="bg-black text-white px-1.5 py-0.5 text-[10px]">Open</span>
              </button>

              {/* Primary Links */}
              <div className="flex flex-col gap-2">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 border-2 border-black font-black text-sm uppercase transition-colors ${
                    pathname === '/' ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  🏟️ Matches & Scores
                </Link>

                <Link
                  href="/stats"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 border-2 border-black font-black text-sm uppercase transition-colors ${
                    isStatsActive ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  📊 Stats & Analytics Hub
                </Link>

                {/* Expandable / Nested Stats Shortcuts in Mobile Menu */}
                <div className="bg-white border-2 border-black p-2.5 space-y-1.5">
                  <p className="text-[10px] font-black text-black/60 uppercase tracking-widest">
                    Quick Stat Views
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                    <Link
                      href="/stats?tab=Run+Scorers"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 bg-[#FFFEE0] border border-black hover:bg-[#FFED66]"
                    >
                      🏏 Run Scorers
                    </Link>
                    <Link
                      href="/stats?tab=Wicket+Takers"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 bg-[#FFFEE0] border border-black hover:bg-[#FFED66]"
                    >
                      🎯 Wickets
                    </Link>
                    <Link
                      href="/stats/advanced"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 bg-[#FFFEE0] border border-black hover:bg-[#FFED66]"
                    >
                      ⚡ Phase Stats
                    </Link>
                    <Link
                      href="/stats/player-progression"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 bg-[#FFFEE0] border border-black hover:bg-[#FFED66]"
                    >
                      📈 Progression
                    </Link>
                    <Link
                      href="/stats/compare"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 bg-[#FFFEE0] border border-black hover:bg-[#FFED66]"
                    >
                      ⚖️ Compare
                    </Link>
                    <Link
                      href="/stat-explorer"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 bg-[#4ECDC4] border border-black font-black"
                    >
                      🛠️ Explorer
                    </Link>
                  </div>
                </div>

                <Link
                  href="/players"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 border-2 border-black font-black text-sm uppercase transition-colors ${
                    pathname.startsWith('/players') ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  👤 Players Directory
                </Link>

                <Link
                  href="/play"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 border-2 border-black font-black text-sm uppercase transition-colors ${
                    pathname.startsWith('/play') ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  🎮 Play Trivia & Games
                </Link>

                <Link
                  href="/chat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 border-2 border-black font-black text-sm uppercase transition-colors ${
                    pathname === '/chat' ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  🤖 AI Cricket Chat
                </Link>

                <Link
                  href="/news"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 border-2 border-black font-black text-sm uppercase transition-colors ${
                    pathname === '/news' ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  📰 Tournament News
                </Link>
              </div>

              {/* League info badge in mobile menu */}
              {selectedLeague && leagueConfig && (
                <div className="mt-auto pt-4 border-t-2 border-black">
                  <div className="bg-[#FFED66] p-2 border-2 border-black text-center">
                    <p className="text-[10px] font-bold uppercase text-black/70">
                      Current Tournament
                    </p>
                    <p className="font-black text-sm text-black">
                      {leagueConfig.icon} {leagueConfig.fullName}
                    </p>
                  </div>
                </div>
              )}
            </nav>
          </>
        )}
      </header>

      {/* Universal Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
};

export default Header;
