'use client';

import { useLeagueContext } from '@/contexts/LeagueContext';
import { League } from '@/types/league';
import { useCallback } from 'react';

const goApiBaseUrl = (process.env.NEXT_PUBLIC_GO_API_URL ?? '').replace(/\/$/, '');
const apiBaseUrl = goApiBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');

interface UseLeagueAPIReturn {
  fetchWithLeague: (endpoint: string, options?: RequestInit) => Promise<Response>;
  selectedLeague: League | null;
  isLeagueSelected: boolean;
}

export const useLeagueAPI = (): UseLeagueAPIReturn => {
  const { selectedLeague } = useLeagueContext();

  const fetchWithLeague = useCallback(
    async (endpoint: string, options?: RequestInit): Promise<Response> => {
      const url = new URL(endpoint, `${apiBaseUrl}/api`);

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
