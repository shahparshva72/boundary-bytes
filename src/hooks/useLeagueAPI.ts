import { useCallback } from 'react';
import { useLeagueContext } from '@/contexts/LeagueContext';
import { env } from '@/lib/env';
import { scopeParams } from '@/lib/league-scope';

const apiBaseUrl = env.NEXT_PUBLIC_GO_API_URL.replace(/\/$/, '');

interface UseLeagueAPIReturn {
  // Fetches an API endpoint for the current league scope (?leagues= or ?gender=).
  fetchWithLeague: (endpoint: string, options?: RequestInit) => Promise<Response>;
  // Changes whenever the scope does; include it in query keys.
  scopeKey: string;
}

export const useLeagueAPI = (): UseLeagueAPIReturn => {
  const { scope, scopeKey } = useLeagueContext();

  const fetchWithLeague = useCallback(
    async (endpoint: string, options?: RequestInit): Promise<Response> => {
      const url = new URL(endpoint, `${apiBaseUrl}/api`);

      for (const [key, value] of Object.entries(scopeParams(scope))) {
        url.searchParams.set(key, value);
      }

      return fetch(url.toString(), options);
    },
    [scope],
  );

  return { fetchWithLeague, scopeKey };
};
