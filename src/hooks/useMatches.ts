import { useQuery } from '@tanstack/react-query';
import { useLeagueAPI } from '@/hooks/useLeagueAPI';

type FetchWithLeague = (url: string, options?: RequestInit) => Promise<Response>;

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

export const fetchMatchesData = async (
  fetchWithLeague: FetchWithLeague,
  page: number,
  season?: string,
) => {
  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: '6',
  });
  if (season) {
    searchParams.append('season', season);
  }

  const response = await fetchWithLeague(`/api/matches?${searchParams}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch matches: ${response.statusText}`);
  }

  return response.json();
};

export function useMatches(page = 1, season?: string) {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery<MatchesResponse>({
    queryKey: ['matches', page, season, selectedLeague],
    queryFn: () => fetchMatchesData(fetchWithLeague, page, season),
    enabled: !!selectedLeague,
  });
}
