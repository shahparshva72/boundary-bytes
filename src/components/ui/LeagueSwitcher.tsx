'use client';

import React, { useState } from 'react';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { LEAGUE_CONFIGS, VALID_LEAGUES } from '@/utils/league-config';
import { League } from '@/types/league';

const LeagueSwitcher: React.FC = () => {
  const { selectedLeague, selectLeague, resetLeagueSelection } = useLeagueContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pendingLeague, setPendingLeague] = useState<League | null>(null);

  if (!selectedLeague) return null;

  const currentConfig = LEAGUE_CONFIGS[selectedLeague];
  const otherLeagues: League[] = VALID_LEAGUES.filter((l) => l !== selectedLeague);

  const handleLeagueChange = (league: League) => {
    if (league === selectedLeague) {
      setIsOpen(false);
      return;
    }

    setPendingLeague(league);
    setIsConfirming(true);
    setIsOpen(false);
  };

  const confirmLeagueChange = async () => {
    if (pendingLeague) {
      await selectLeague(pendingLeague);
      setIsConfirming(false);
      setPendingLeague(null);
    }
  };

  const cancelLeagueChange = () => {
    setIsConfirming(false);
    setPendingLeague(null);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white border-2 border-black font-bold text-black hover:bg-[#FFED66] transition-colors text-sm sm:text-base"
          style={{
            boxShadow: isOpen ? '2px 2px 0px 0px rgba(0,0,0,1)' : '4px 4px 0px 0px rgba(0,0,0,1)',
          }}
        >
          <span className="text-base sm:text-lg">{currentConfig.icon}</span>
          <span className="hidden sm:inline">{selectedLeague}</span>
          <span className="text-xs sm:text-sm">▼</span>
        </button>

        {isOpen && (
          <div
            className="absolute top-full right-0 sm:left-0 sm:right-auto mt-2 bg-white border-4 border-black z-50 min-w-[180px] sm:min-w-[200px]"
            style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
          >
            <div className="p-2 sm:p-3 border-b-2 border-black bg-[#FFED66]">
              <div className="flex items-center gap-2 font-bold text-black text-sm sm:text-base">
                <span>{currentConfig.icon}</span>
                <span>{currentConfig.name}</span>
                <span className="text-xs sm:text-sm">(Current)</span>
              </div>
            </div>

            {otherLeagues.map((l, idx) => {
              const cfg = LEAGUE_CONFIGS[l];
              const isLast = idx === otherLeagues.length - 1;
              return (
                <button
                  key={l}
                  onClick={() => handleLeagueChange(l)}
                  className={`w-full p-2 sm:p-3 text-left hover:bg-[#4ECDC4] transition-colors ${!isLast ? 'border-b-2 border-black' : ''}`}
                >
                  <div className="flex items-center gap-2 font-bold text-black text-sm sm:text-base">
                    <span>{cfg.icon}</span>
                    <span>{cfg.name}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-black mt-1">{cfg.description}</div>
                </button>
              );
            })}

            <button
              onClick={() => {
                resetLeagueSelection();
                setIsOpen(false);
              }}
              className="w-full p-2 sm:p-3 text-left hover:bg-[#FF5E5B] hover:text-white transition-colors font-bold text-black text-sm sm:text-base"
            >
              🔄 Choose Again
            </button>
          </div>
        )}

        {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
      </div>

      {isConfirming && pendingLeague && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div
            className="bg-white border-4 border-black p-4 sm:p-6 max-w-md w-full mx-4"
            style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
          >
            <h3 className="text-lg sm:text-xl font-black text-black mb-3 sm:mb-4 text-center uppercase">
              Switch League?
            </h3>

            <div className="text-center mb-4 sm:mb-6">
              <p className="text-base sm:text-lg font-bold text-black mb-2">
                Switch from {currentConfig.name} to {LEAGUE_CONFIGS[pendingLeague].name}?
              </p>
              <p className="text-xs sm:text-sm text-black">
                This will reload the page with {LEAGUE_CONFIGS[pendingLeague].fullName} data.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <button
                onClick={confirmLeagueChange}
                className="px-4 sm:px-6 py-2 bg-[#4ECDC4] border-2 border-black font-bold text-black hover:bg-[#4ECDC4]/80 transition-colors text-sm sm:text-base"
              >
                Yes, Switch
              </button>
              <button
                onClick={cancelLeagueChange}
                className="px-4 sm:px-6 py-2 bg-[#FF5E5B] border-2 border-black font-bold text-black hover:bg-[#FF5E5B]/80 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeagueSwitcher;
