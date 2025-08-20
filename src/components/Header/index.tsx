'use client';

import Link from 'next/link';
import NavLink from './NavLink';
import LeagueSwitcher from '../ui/LeagueSwitcher';
import { useLeagueContext } from '@/contexts/LeagueContext';

const Header = () => {
  const { selectedLeague, leagueConfig } = useLeagueContext();

  return (
    <header className="bg-[#FFC700] p-4 border-b-4 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-black text-black tracking-tighter">
            Boundary Bytes
          </Link>
          {selectedLeague && leagueConfig && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-black text-white font-bold text-sm uppercase">
              <span>{leagueConfig.icon}</span>
              <span>{leagueConfig.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex gap-4">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/stats">Stats</NavLink>
            <NavLink href="/chat">Chat</NavLink>
            <NavLink href="/stats/advanced">Advanced Stats</NavLink>
            {/* <NavLink href="/stats/fall-of-wickets">Fall of Wickets</NavLink> */}
          </nav>

          {selectedLeague && <LeagueSwitcher />}
        </div>
      </div>
    </header>
  );
};

export default Header;
