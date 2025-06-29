import { useQuery } from '@tanstack/react-query';
import api from './axios';

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
}

export function useMatches(page = 1, season?: string) {
  return useQuery<MatchesResponse>({
    queryKey: ['matches', page, season],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: '5',
      });
      if (season) searchParams.append('season', season);

      const { data } = await api.get<MatchesResponse>(`/matches?${searchParams}`);
      return data;
    },
  });
}
