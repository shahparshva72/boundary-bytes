'use client';

import { useLeagueContext } from '@/contexts/LeagueContext';
import Link from 'next/link';
import { useState } from 'react';
import LeagueSwitcher from '../ui/LeagueSwitcher';
import NavLink from './NavLink';

const Header = () => {
  const { selectedLeague, leagueConfig } = useLeagueContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#FFC700] p-3 sm:p-4 border-b-4 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/" className="text-xl sm:text-2xl font-black text-black tracking-tighter">
            Boundary Bytes
          </Link>
          {selectedLeague && leagueConfig && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-black text-white font-bold text-sm uppercase">
              <span>{leagueConfig.icon}</span>
              <span>{leagueConfig.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden md:flex gap-2 lg:gap-4">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/stats">Stats</NavLink>
            <NavLink href="/chat">Chat</NavLink>
            <NavLink href="/news">News</NavLink>
            <NavLink href="/stats/advanced">Advanced Stats</NavLink>
          </nav>

          {selectedLeague && <LeagueSwitcher />}

          <button
            onClick={toggleMobileMenu}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 bg-white border-2 border-black"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span
              className={`block w-5 h-0.5 bg-black transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}
            />
            <span
              className={`block w-5 h-0.5 bg-black my-1 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`block w-5 h-0.5 bg-black transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}
            />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMobileMenu} />
          <nav className="fixed top-0 right-0 h-full w-64 bg-[#FFC700] border-l-4 border-black z-50 md:hidden flex flex-col p-4 shadow-[-8px_0px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-black text-black">Menu</span>
              <button
                onClick={closeMobileMenu}
                className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center font-black text-xl"
                aria-label="Close menu"
              >
                X
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <NavLink href="/" onClick={closeMobileMenu}>
                Home
              </NavLink>
              <NavLink href="/stats" onClick={closeMobileMenu}>
                Stats
              </NavLink>
              <NavLink href="/chat" onClick={closeMobileMenu}>
                Chat
              </NavLink>
              <NavLink href="/news" onClick={closeMobileMenu}>
                News
              </NavLink>
              <NavLink href="/stats/advanced" onClick={closeMobileMenu}>
                Advanced Stats
              </NavLink>
            </div>
          </nav>
        </>
      )}
    </header>
  );
};

export default Header;
