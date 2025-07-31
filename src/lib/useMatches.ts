import { useQuery } from '@tanstack/react-query';
import { useLeagueAPI } from '@/hooks/useLeagueAPI';

interface Match {
  id: number;
  season: string;
  startDate: string;
  venue: string;
  team1: string;
  team2: string;
  innings1Score: string;
  innings2Score: string;
  result: string;
}

interface PaginationData {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

interface MatchesResponse {
  matches: Match[];
  pagination: PaginationData;
  seasons: string[];
  league: string;
  metadata: {
    availableLeagues: string[];
    totalRecords: number;
  };
}

export function useMatches(page = 1, season?: string) {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery<MatchesResponse>({
    queryKey: ['matches', page, season, selectedLeague],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: '5',
      });
      if (season) searchParams.append('season', season);

      const response = await fetchWithLeague(`/api/matches?${searchParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    enabled: !!selectedLeague, // Only run query when league is selected
  });
}
