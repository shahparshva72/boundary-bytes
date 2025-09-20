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
      {/* League Switcher Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-black font-bold text-black hover:bg-[#FFED66] transition-colors"
          style={{
            boxShadow: isOpen ? '2px 2px 0px 0px rgba(0,0,0,1)' : '4px 4px 0px 0px rgba(0,0,0,1)',
          }}
        >
          <span className="text-lg">{currentConfig.icon}</span>
          <span className="hidden sm:inline">{selectedLeague}</span>
          <span className="text-sm">▼</span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="absolute top-full left-0 mt-2 bg-white border-4 border-black z-50 min-w-[200px]"
            style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
          >
            {/* Current League */}
            <div className="p-3 border-b-2 border-black bg-[#FFED66]">
              <div className="flex items-center gap-2 font-bold text-black">
                <span>{currentConfig.icon}</span>
                <span>{currentConfig.name}</span>
                <span className="text-sm">(Current)</span>
              </div>
            </div>

            {otherLeagues.map((l, idx) => {
              const cfg = LEAGUE_CONFIGS[l];
              const isLast = idx === otherLeagues.length - 1;
              return (
                <button
                  key={l}
                  onClick={() => handleLeagueChange(l)}
                  className={`w-full p-3 text-left hover:bg-[#4ECDC4] transition-colors ${!isLast ? 'border-b-2 border-black' : ''}`}
                >
                  <div className="flex items-center gap-2 font-bold text-black">
                    <span>{cfg.icon}</span>
                    <span>{cfg.name}</span>
                  </div>
                  <div className="text-sm text-black mt-1">{cfg.description}</div>
                </button>
              );
            })}

            {/* Reset Option */}
            <button
              onClick={() => {
                resetLeagueSelection();
                setIsOpen(false);
              }}
              className="w-full p-3 text-left hover:bg-[#FF5E5B] hover:text-white transition-colors font-bold text-black"
            >
              🔄 Choose Again
            </button>
          </div>
        )}

        {/* Click outside to close */}
        {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
      </div>

      {/* Confirmation Modal */}
      {isConfirming && pendingLeague && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div
            className="bg-white border-4 border-black p-6 max-w-md w-full"
            style={{ boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)' }}
          >
            <h3 className="text-xl font-black text-black mb-4 text-center uppercase">
              Switch League?
            </h3>

            <div className="text-center mb-6">
              <p className="text-lg font-bold text-black mb-2">
                Switch from {currentConfig.name} to {LEAGUE_CONFIGS[pendingLeague].name}?
              </p>
              <p className="text-sm text-black">
                This will reload the page with {LEAGUE_CONFIGS[pendingLeague].fullName} data.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={confirmLeagueChange}
                className="px-6 py-2 bg-[#4ECDC4] border-2 border-black font-bold text-black hover:bg-[#4ECDC4]/80 transition-colors"
              >
                Yes, Switch
              </button>
              <button
                onClick={cancelLeagueChange}
                className="px-6 py-2 bg-[#FF5E5B] border-2 border-black font-bold text-black hover:bg-[#FF5E5B]/80 transition-colors"
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
