'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { League, LeagueContextType } from '@/types/league';
import { getLeagueConfig } from '@/utils/league-config';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

interface LeagueProviderProps {
  children: ReactNode;
}

export const LeagueProvider: React.FC<LeagueProviderProps> = ({ children }) => {
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    getLeaguePreference,
    setLeaguePreference,
    clearLeaguePreference,
    isFirstVisit: checkIsFirstVisit,
    isClient,
  } = useLocalStorage();

  // Initialize league preference on client-side
  useEffect(() => {
    if (!isClient) return;

    const preference = getLeaguePreference();
    const firstVisit = checkIsFirstVisit();

    if (preference && preference.league) {
      setSelectedLeague(preference.league);
      setIsFirstVisit(false);
    } else {
      setIsFirstVisit(firstVisit);
    }

    setIsInitialized(true);
  }, [isClient, getLeaguePreference, checkIsFirstVisit]);

  const selectLeague = async (league: League): Promise<void> => {
    setIsTransitioning(true);

    // Save to localStorage
    setLeaguePreference(league);

    // Small delay for animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    setSelectedLeague(league);
    setIsFirstVisit(false);
    setIsTransitioning(false);
  };

  const resetLeagueSelection = (): void => {
    clearLeaguePreference();
    setSelectedLeague(null);
    setIsFirstVisit(true);
    setIsTransitioning(false);
  };

  const leagueConfig = selectedLeague ? getLeagueConfig(selectedLeague) : null;

  const contextValue: LeagueContextType = {
    selectedLeague,
    isFirstVisit: isFirstVisit && isInitialized,
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
