'use client';

import { useLeagueURL } from '@/hooks/useLeagueURL';
import { League, LeagueContextType } from '@/types/league';
import { getLeagueConfig } from '@/utils/league-config';
import React, { createContext, ReactNode, useContext, useState } from 'react';

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

interface LeagueProviderProps {
  children: ReactNode;
}

export const LeagueProvider: React.FC<LeagueProviderProps> = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const {
    selectedLeague,
    selectLeague: urlSelectLeague,
    resetLeagueSelection: urlReset,
    isFirstVisit,
    isHydrated,
  } = useLeagueURL();

  const selectLeague = async (league: League): Promise<void> => {
    setIsTransitioning(true);

    // Small delay for animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    await urlSelectLeague(league);
    setIsTransitioning(false);
  };

  const resetLeagueSelection = (): void => {
    urlReset();
    setIsTransitioning(false);
  };

  const leagueConfig = selectedLeague ? getLeagueConfig(selectedLeague) : null;

  const contextValue: LeagueContextType = {
    selectedLeague,
    isFirstVisit: isFirstVisit && isHydrated,
    selectLeague,
    resetLeagueSelection,
    isTransitioning,
    leagueConfig,
  };

  return <LeagueContext.Provider value={contextValue}>{children}</LeagueContext.Provider>;
};

export const useLeagueContext = (): LeagueContextType => {
  const context = useContext(LeagueContext);
  if (context === undefined) {
    throw new Error('useLeagueContext must be used within a LeagueProvider');
  }
  return context;
};
