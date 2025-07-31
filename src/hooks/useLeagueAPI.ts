'use client';

import { useCallback } from 'react';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { League } from '@/types/league';

interface UseLeagueAPIReturn {
  fetchWithLeague: (endpoint: string, options?: RequestInit) => Promise<Response>;
  selectedLeague: League | null;
  isLeagueSelected: boolean;
}

export const useLeagueAPI = (): UseLeagueAPIReturn => {
  const { selectedLeague } = useLeagueContext();

  const fetchWithLeague = useCallback(
    async (endpoint: string, options?: RequestInit): Promise<Response> => {
      const url = new URL(endpoint, window.location.origin);

      // Automatically add league parameter if a league is selected
      if (selectedLeague) {
        url.searchParams.set('league', selectedLeague);
      }

      return fetch(url.toString(), options);
    },
    [selectedLeague],
  );

  return {
    fetchWithLeague,
    selectedLeague,
    isLeagueSelected: selectedLeague !== null,
  };
};
