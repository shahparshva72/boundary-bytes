'use client';

import { useQuery } from '@tanstack/react-query';
import { useLeagueAPI } from './useLeagueAPI';

// Team stats fetchers
export const fetchTeamWins = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
) => {
  const response = await fetchWithLeague('/api/stats/team-wins');
  if (!response.ok) {
    throw new Error('Failed to fetch team wins');
  }
  return response.json();
};

export const fetchTeamAverages = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
) => {
  const response = await fetchWithLeague('/api/stats/team-averages');
  if (!response.ok) {
    throw new Error('Failed to fetch team averages');
  }
  return response.json();
};

// Player stats fetchers
export const fetchWicketTakers = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  page: number,
) => {
  const response = await fetchWithLeague(`/api/stats/leading-wicket-takers?page=${page}&limit=10`);
  if (!response.ok) {
    throw new Error('Failed to fetch wicket takers');
  }
  return response.json();
};

export const fetchRunScorers = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  page: number,
) => {
  const response = await fetchWithLeague(`/api/stats/leading-run-scorers?page=${page}&limit=10`);
  if (!response.ok) {
    throw new Error('Failed to fetch run scorers');
  }
  return response.json();
};

export const fetchBowlingWicketTypes = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  page: number,
) => {
  const response = await fetchWithLeague(`/api/stats/bowling-wicket-types?page=${page}&limit=10`);
  if (!response.ok) {
    throw new Error('Failed to fetch bowling wicket types');
  }
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
  if (!response.ok) {
    throw new Error('Failed to fetch matchup');
  }
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
  if (!response.ok) {
    throw new Error('Failed to fetch advanced stats');
  }
  return response.json();
};

export const fetchFallOfWicketsData = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  matchId: number,
) => {
  const response = await fetchWithLeague(`/api/stats/fall-of-wickets/${matchId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch fall of wickets');
  }
  return response.json();
};

// Team run rate progression fetcher
export const fetchTeamRunRateProgression = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  team: string,
  season: string,
) => {
  const params = new URLSearchParams({
    team,
    season,
  });
  const response = await fetchWithLeague(`/api/stats/team-runrate-progression?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch team run rate progression');
  }
  return response.json();
};

// Run rate trend fetcher
export const fetchRunRateTrend = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  team?: string | null,
) => {
  const params = new URLSearchParams();
  if (team) {
    params.set('team', team);
  }
  const query = params.toString();
  const response = await fetchWithLeague(`/api/stats/runrate-trend${query ? `?${query}` : ''}`);
  if (!response.ok) {
    throw new Error('Failed to fetch run rate trend');
  }
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

// Team run rate progression hook
export const useTeamRunRateProgression = (team: string, season: string) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['teamRunRateProgression', team, season, selectedLeague],
    queryFn: () => fetchTeamRunRateProgression(fetchWithLeague, team, season),
    enabled: !!selectedLeague && !!team && !!season,
  });
};

// Run rate trend hook
export const useRunRateTrend = (team?: string | null) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['runRateTrend', team, selectedLeague],
    queryFn: () => fetchRunRateTrend(fetchWithLeague, team),
    enabled: !!selectedLeague,
  });
};

// Seasons fetcher
export const fetchSeasonsData = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
) => {
  const response = await fetchWithLeague('/api/stats/seasons');
  if (!response.ok) {
    throw new Error('Failed to fetch seasons');
  }
  return response.json();
};

// Seasons hook
export const useSeasons = () => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['seasons', selectedLeague],
    queryFn: () => fetchSeasonsData(fetchWithLeague),
    enabled: !!selectedLeague,
  });
};

// Player comparison fetcher
export const fetchPlayerComparisonData = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  players: string[],
  filters: { seasons?: string[]; team?: string; statType: string },
) => {
  const params = new URLSearchParams({
    players: players.join(','),
    statType: filters.statType,
  });
  if (filters.seasons && filters.seasons.length > 0) {
    params.append('seasons', filters.seasons.join(','));
  }
  if (filters.team) {
    params.append('team', filters.team);
  }

  const response = await fetchWithLeague(`/api/stats/player-compare?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch player comparison');
  }
  return response.json();
};

// Player comparison hook
export const usePlayerComparison = (
  players: string[],
  filters: { seasons?: string[]; team?: string; statType: string },
) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['playerComparison', players, filters, selectedLeague],
    queryFn: () => fetchPlayerComparisonData(fetchWithLeague, players, filters),
    enabled: !!selectedLeague && players.length >= 2,
  });
};

// Player progression fetcher
export const fetchPlayerProgression = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  player: string,
  innings?: '1' | '2' | null,
) => {
  const params = new URLSearchParams({
    player,
  });
  if (innings) {
    params.append('innings', innings);
  }
  const response = await fetchWithLeague(`/api/stats/player-progression?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch player progression');
  }
  return response.json();
};

// Player progression hook
export const usePlayerProgression = (player: string, innings?: '1' | '2' | null) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['playerProgression', player, innings, selectedLeague],
    queryFn: () => fetchPlayerProgression(fetchWithLeague, player, innings),
    enabled: !!selectedLeague && !!player,
  });
};

// Multi-matchup fetcher
export const fetchMultiMatchup = async (
  fetchWithLeague: (url: string, options?: RequestInit) => Promise<Response>,
  player: string,
  opponents: string[],
  mode: 'batterVsBowlers' | 'bowlerVsBatters',
) => {
  const params = new URLSearchParams({
    player,
    opponents: opponents.join(','),
    mode,
  });
  const response = await fetchWithLeague(`/api/stats/multi-matchup?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch multi-matchup stats');
  }
  return response.json();
};

// Multi-matchup hook
export const useMultiMatchup = (
  player: string,
  opponents: string[],
  mode: 'batterVsBowlers' | 'bowlerVsBatters',
) => {
  const { fetchWithLeague, selectedLeague } = useLeagueAPI();

  return useQuery({
    queryKey: ['multiMatchup', player, opponents, mode, selectedLeague],
    queryFn: () => fetchMultiMatchup(fetchWithLeague, player, opponents, mode),
    enabled: !!selectedLeague && !!player && opponents.length > 0,
  });
};
