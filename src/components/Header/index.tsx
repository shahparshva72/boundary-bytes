'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLeagueContext } from '@/contexts/LeagueContext';
import CommandPalette from '../ui/CommandPalette';
import LeagueSwitcher from '../ui/LeagueSwitcher';
import NavLink from './NavLink';

interface HeaderProps {
  onOpenSearch?: () => void;
}

const NAV_LINKS = [
  { href: '/', label: 'Home', exact: true },
  { href: '/players', label: 'Players' },
  { href: '/stats', label: 'Stats', exact: true },
  { href: '/stat-explorer', label: 'Stat Explorer' },
  { href: '/chat', label: 'Chat' },
  { href: '/play', label: 'Play' },
  { href: '/news', label: 'News' },
  { href: '/stats/advanced', label: 'Advanced Stats' },
  { href: '/stats/player-progression', label: 'Player Progression' },
];

const Header = ({ onOpenSearch }: HeaderProps = {}) => {
  const { selectedLeague, leagueConfig } = useLeagueContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const handleOpenSearch = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      setIsCommandPaletteOpen(true);
    }
  };

  // Global Cmd+K keyboard shortcut if standalone
  useEffect(() => {
    if (onOpenSearch) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  return (
    <>
      <header className="bg-[#FFC700] p-2 sm:p-2.5 border-b-2 border-black shadow-[0px_2px_0px_0px_rgba(0,0,0,1)]">
        <div className="container mx-auto flex justify-between items-center gap-2">
          {/* Logo & League Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Link
              href="/"
              className="text-lg sm:text-xl font-black text-black tracking-tighter hover:opacity-90 transition-opacity"
            >
              Boundary Bytes
            </Link>

            {selectedLeague && leagueConfig && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-black text-white font-black text-xs uppercase border border-black">
                <span>{leagueConfig.name}</span>
              </div>
            )}
          </div>

          {/* Desktop Nav Links & Controls */}
          <div className="flex items-center gap-1.5 lg:gap-2">
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} exact={link.exact}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Quick Search Button */}
            <button
              onClick={handleOpenSearch}
              className="flex items-center gap-1.5 px-2 lg:px-2.5 py-1.5 bg-white border-2 border-black font-black text-xs sm:text-sm text-black hover:bg-[#FFED66] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer whitespace-nowrap"
              title="Quick Search (Cmd+K / Ctrl+K)"
            >
              <span>Search</span>
              <span className="hidden xl:inline text-[10px] font-mono bg-black text-white px-1 py-0.5">
                ⌘K
              </span>
            </button>

            {/* League Switcher */}
            {selectedLeague && <LeagueSwitcher />}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="lg:hidden flex flex-col justify-center items-center w-9 h-9 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0"
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

        {/* Mobile Slide-Over Drawer */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden animate-in fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <nav className="fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-[#FFFEE0] border-l-4 border-black z-50 lg:hidden flex flex-col p-4 shadow-[-6px_0px_0px_0px_rgba(0,0,0,1)] overflow-y-auto">
              <div className="flex justify-between items-center pb-3 mb-3 border-b-2 border-black">
                <span className="text-lg font-black text-black">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 bg-[#FF5E5B] text-black border-2 border-black flex items-center justify-center font-black text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              {/* Quick Search Button in Mobile Menu */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleOpenSearch();
                }}
                className="w-full flex items-center justify-between p-2.5 mb-3 bg-[#FFED66] border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black cursor-pointer"
              >
                <span>Quick Search (Cmd+K)</span>
                <span className="bg-black text-white px-1.5 py-0.5 text-[10px]">Open</span>
              </button>

              <div className="flex flex-col gap-1.5">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    exact={link.exact}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              {selectedLeague && leagueConfig && (
                <div className="mt-auto pt-4 border-t-2 border-black">
                  <div className="bg-[#FFED66] p-2 border-2 border-black text-center">
                    <p className="text-[10px] font-black uppercase text-black">
                      Current Tournament
                    </p>
                    <p className="font-black text-sm text-black">{leagueConfig.fullName}</p>
                  </div>
                </div>
              )}
            </nav>
          </>
        )}
      </header>

      {/* Standalone Command Palette Modal */}
      {!onOpenSearch && (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
