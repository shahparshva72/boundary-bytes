'use client';

import { useLeagueURL } from '@/hooks/useLeagueURL';
import { fetchLeagueConfigs, LEAGUE_CONFIGS } from '@/lib/league-config';
import { League, LeagueContextType } from '@/types/league';
import { useQuery } from '@tanstack/react-query';
import { createContext, type ReactNode, useContext, useState } from 'react';

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

interface LeagueProviderProps {
  children: ReactNode;
}

export const LeagueProvider = ({ children }: LeagueProviderProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { data: leagueConfigs = LEAGUE_CONFIGS } = useQuery({
    queryKey: ['league-configs'],
    queryFn: fetchLeagueConfigs,
    staleTime: 5 * 60 * 1000,
  });

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

  const leagueConfig = selectedLeague ? leagueConfigs[selectedLeague] : null;

  const contextValue: LeagueContextType = {
    selectedLeague,
    isFirstVisit: isFirstVisit && isHydrated,
    selectLeague,
    resetLeagueSelection,
    isTransitioning,
    leagueConfig,
    leagueConfigs,
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
