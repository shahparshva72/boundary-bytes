'use client';

import { useQuery } from '@tanstack/react-query';
import { useLeagueAPI } from './useLeagueAPI';

export const fetchBattersData = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
) => {
  const response = await fetchWithLeague('/api/players/batters');
  if (!response.ok) {
    throw new Error('Failed to fetch batters');
  }
  const data = await response.json();
  return data.data; // Return the actual array of batters
};

export const useBatters = () => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['batters', selectedLeague],
    queryFn: () => fetchBattersData(fetchWithLeague),
    enabled: !!selectedLeague,
  });
};

export const fetchBowlersData = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
) => {
  const response = await fetchWithLeague('/api/players/bowlers');
  if (!response.ok) {
    throw new Error('Failed to fetch bowlers');
  }
  const data = await response.json();
  return data.data; // Return the actual array of bowlers
};

export const useBowlers = () => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['bowlers', selectedLeague],
    queryFn: () => fetchBowlersData(fetchWithLeague),
    enabled: !!selectedLeague,
  });
};
