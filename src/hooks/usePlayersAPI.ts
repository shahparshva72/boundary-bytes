'use client';

import { useQuery } from '@tanstack/react-query';
import { useLeagueAPI } from './useLeagueAPI';

export const useBatters = () => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['batters', selectedLeague],
    queryFn: async () => {
      const response = await fetchWithLeague('/api/players/batters');
      if (!response.ok) throw new Error('Failed to fetch batters');
      const data = await response.json();
      return data.data; // Return the actual array of batters
    },
    enabled: !!selectedLeague,
  });
};

export const useBowlers = () => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['bowlers', selectedLeague],
    queryFn: async () => {
      const response = await fetchWithLeague('/api/players/bowlers');
      if (!response.ok) throw new Error('Failed to fetch bowlers');
      const data = await response.json();
      return data.data; // Return the actual array of bowlers
    },
    enabled: !!selectedLeague,
  });
};
