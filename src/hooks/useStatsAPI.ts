'use client';

import { useQuery } from '@tanstack/react-query';
import { useLeagueAPI } from './useLeagueAPI';

// Team stats fetchers
export const fetchTeamWins = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
) => {
  const response = await fetchWithLeague('/api/stats/team-wins');
  if (!response.ok) throw new Error('Failed to fetch team wins');
  return response.json();
};

export const fetchTeamAverages = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
) => {
  const response = await fetchWithLeague('/api/stats/team-averages');
  if (!response.ok) throw new Error('Failed to fetch team averages');
  return response.json();
};

// Player stats fetchers
export const fetchWicketTakers = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  page: number,
) => {
  const response = await fetchWithLeague(`/api/stats/leading-wicket-takers?page=${page}&limit=10`);
  if (!response.ok) throw new Error('Failed to fetch wicket takers');
  return response.json();
};

export const fetchRunScorers = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  page: number,
) => {
  const response = await fetchWithLeague(`/api/stats/leading-run-scorers?page=${page}&limit=10`);
  if (!response.ok) throw new Error('Failed to fetch run scorers');
  return response.json();
};

export const fetchBowlingWicketTypes = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  page: number,
) => {
  const response = await fetchWithLeague(`/api/stats/bowling-wicket-types?page=${page}&limit=10`);
  if (!response.ok) throw new Error('Failed to fetch bowling wicket types');
  return response.json();
};

// Matchup & advanced stats fetchers
export const fetchMatchup = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  batter: string,
  bowler: string,
) => {
  const response = await fetchWithLeague(
    `/api/stats/matchup?batter=${encodeURIComponent(batter)}&bowler=${encodeURIComponent(bowler)}`,
  );
  if (!response.ok) throw new Error('Failed to fetch matchup');
  return response.json();
};

export const fetchAdvancedStatsData = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  overs: number[],
  player: string,
  playerType: string,
) => {
  const params = new URLSearchParams({
    overs: overs.join(','),
    playerType,
    ...(playerType === 'batter' ? { batter: player } : { bowler: player }),
  });
  const response = await fetchWithLeague(`/api/stats/advanced?${params}`);
  if (!response.ok) throw new Error('Failed to fetch advanced stats');
  return response.json();
};

export const fetchFallOfWicketsData = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  matchId: number,
) => {
  const response = await fetchWithLeague(`/api/stats/fall-of-wickets/${matchId}`);
  if (!response.ok) throw new Error('Failed to fetch fall of wickets');
  return response.json();
};

// Team stats hooks
export const useTeamWins = () => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['teamWins', selectedLeague],
    queryFn: () => fetchTeamWins(fetchWithLeague),
    enabled: !!selectedLeague,
  });
};

export const useTeamAverages = () => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['teamAverages', selectedLeague],
    queryFn: () => fetchTeamAverages(fetchWithLeague),
    enabled: !!selectedLeague,
  });
};

// Player stats hooks
export const useWicketTakers = (page: number) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['wicketTakers', page, selectedLeague],
    queryFn: () => fetchWicketTakers(fetchWithLeague, page),
    enabled: !!selectedLeague,
  });
};

export const useRunScorers = (page: number) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['runScorers', page, selectedLeague],
    queryFn: () => fetchRunScorers(fetchWithLeague, page),
    enabled: !!selectedLeague,
  });
};

export const useBowlingWicketTypes = (page: number) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['bowlingWicketTypes', page, selectedLeague],
    queryFn: () => fetchBowlingWicketTypes(fetchWithLeague, page),
    enabled: !!selectedLeague,
  });
};

// Matchup & advanced stats hooks
export const useMatchup = (batter: string, bowler: string) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['matchup', batter, bowler, selectedLeague],
    queryFn: () => fetchMatchup(fetchWithLeague, batter, bowler),
    enabled: !!selectedLeague && !!batter && !!bowler,
  });
};

export const useAdvancedStats = (overs: number[], player: string, playerType: string) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['advancedStats', overs, player, playerType, selectedLeague],
    queryFn: () => fetchAdvancedStatsData(fetchWithLeague, overs, player, playerType),
    enabled: !!selectedLeague && !!player && overs.length > 0,
  });
};

// Fall of wickets hook
export const useFallOfWickets = (matchId: number) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['fallOfWickets', matchId, selectedLeague],
    queryFn: () => fetchFallOfWicketsData(fetchWithLeague, matchId),
    enabled: !!selectedLeague && !!matchId,
  });
};
