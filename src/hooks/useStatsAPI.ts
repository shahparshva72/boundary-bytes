import { useQuery } from '@tanstack/react-query';
import { useLeagueAPI } from './useLeagueAPI';

type FetchWithLeague = (url: string, options?: RequestInit) => Promise<Response>;

export const fetchTeamWins = async (fetchWithLeague: FetchWithLeague) => {
  const response = await fetchWithLeague('/api/stats/team-wins');
  if (!response.ok) {
    throw new Error('Failed to fetch team wins');
  }
  return response.json();
};

export const fetchTeamAverages = async (fetchWithLeague: FetchWithLeague) => {
  const response = await fetchWithLeague('/api/stats/team-averages');
  if (!response.ok) {
    throw new Error('Failed to fetch team averages');
  }
  return response.json();
};

export const fetchWicketTakers = async (
  fetchWithLeague: FetchWithLeague,
  page: number,
  limit = 10,
) => {
  const response = await fetchWithLeague(
    `/api/stats/leading-wicket-takers?page=${page}&limit=${limit}`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch wicket takers');
  }
  return response.json();
};

export const fetchRunScorers = async (
  fetchWithLeague: FetchWithLeague,
  page: number,
  battingPositions: number[] = [],
  limit = 10,
) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (battingPositions.length) {
    params.set('battingPositions', battingPositions.join(','));
  }
  const response = await fetchWithLeague(`/api/stats/leading-run-scorers?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch run scorers');
  }
  return response.json();
};

export const fetchBowlingWicketTypes = async (fetchWithLeague: FetchWithLeague, page: number) => {
  const response = await fetchWithLeague(`/api/stats/bowling-wicket-types?page=${page}&limit=10`);
  if (!response.ok) {
    throw new Error('Failed to fetch bowling wicket types');
  }
  return response.json();
};

export const fetchMatchup = async (
  fetchWithLeague: FetchWithLeague,
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
  fetchWithLeague: FetchWithLeague,
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

export const fetchFallOfWicketsData = async (fetchWithLeague: FetchWithLeague, matchId: number) => {
  const response = await fetchWithLeague(`/api/stats/fall-of-wickets/${matchId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch fall of wickets');
  }
  return response.json();
};

export const fetchTeamRunRateProgression = async (
  fetchWithLeague: FetchWithLeague,
  team: string,
  season: string,
) => {
  const params = new URLSearchParams({ team, season });
  const response = await fetchWithLeague(`/api/stats/team-runrate-progression?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch team run rate progression');
  }
  return response.json();
};

export const fetchRunRateTrend = async (fetchWithLeague: FetchWithLeague, team?: string | null) => {
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

export const useTeamWins = () => {
  const { fetchWithLeague, scopeKey } = useLeagueAPI();

  return useQuery({
    queryKey: ['teamWins', scopeKey],
    queryFn: () => fetchTeamWins(fetchWithLeague),
  });
};

export const useTeamAverages = () => {
  const { fetchWithLeague, scopeKey } = useLeagueAPI();

  return useQuery({
    queryKey: ['teamAverages', scopeKey],
    queryFn: () => fetchTeamAverages(fetchWithLeague),
  });
};

export const useWicketTakers = (page: number, limit = 10) => {
  const { fetchWithLeague, scopeKey } = useLeagueAPI();

  return useQuery({
    queryKey: ['wicketTakers', page, limit, scopeKey],
    queryFn: () => fetchWicketTakers(fetchWithLeague, page, limit),
  });
};

export const useRunScorers = (page: number, battingPositions: number[] = [], limit = 10) => {
  const { fetchWithLeague, scopeKey } = useLeagueAPI();

  return useQuery({
    queryKey: ['runScorers', page, battingPositions, limit, scopeKey],
    queryFn: () => fetchRunScorers(fetchWithLeague, page, battingPositions, limit),
  });
};

export const useBowlingWicketTypes = (page: number) => {
  const { fetchWithLeague, scopeKey } = useLeagueAPI();

  return useQuery({
    queryKey: ['bowlingWicketTypes', page, scopeKey],
    queryFn: () => fetchBowlingWicketTypes(fetchWithLeague, page),
  });
};

export const useMatchup = (batter: string, bowler: string) => {
  const { fetchWithLeague, scopeKey } = useLeagueAPI();

  return useQuery({
    queryKey: ['matchup', batter, bowler, scopeKey],
    queryFn: () => fetchMatchup(fetchWithLeague, batter, bowler),
    enabled: !!batter && !!bowler,
  });
};

export const useAdvancedStats = (overs: number[], player: string, playerType: string) => {
  const { fetchWithLeague, scopeKey } = useLeagueAPI();

  return useQuery({
    queryKey: ['advancedStats', overs, player, playerType, scopeKey],
    queryFn: () => fetchAdvancedStatsData(fetchWithLeague, overs, player, playerType),
    enabled: !!player && overs.length > 0,
  });
};

export const useFallOfWickets = (matchId: number) => {
  const { fetchWithLeague, scopeKey } = useLeagueAPI();

  return useQuery({
    queryKey: ['fallOfWickets', matchId, scopeKey],
    queryFn: () => fetchFallOfWicketsData(fetchWithLeague, matchId),
    enabled: !!matchId,
  });
};

export const useTeamRunRateProgression = (team: string, season: string) => {
  const { fetchWithLeague, scopeKey } = useLeagueAPI();

  return useQuery({
    queryKey: ['teamRunRateProgression', team, season, scopeKey],
    queryFn: () => fetchTeamRunRateProgression(fetchWithLeague, team, season),
    enabled: !!team && !!season,
  });
};

export const useRunRateTrend = (team?: string | null) => {
  const { fetchWithLeague, scopeKey } = useLeagueAPI();

  return useQuery({
    queryKey: ['runRateTrend', team, scopeKey],
    queryFn: () => fetchRunRateTrend(fetchWithLeague, team),
  });
};

export const fetchSeasonsData = async (fetchWithLeague: FetchWithLeague) => {
  const response = await fetchWithLeague('/api/stats/seasons');
  if (!response.ok) {
    throw new Error('Failed to fetch seasons');
  }
  return response.json();
};

export const useSeasons = () => {
  const { fetchWithLeague, scopeKey } = useLeagueAPI();

  return useQuery({
    queryKey: ['seasons', scopeKey],
    queryFn: () => fetchSeasonsData(fetchWithLeague),
  });
};

export const fetchPlayerComparisonData = async (
  fetchWithLeague: FetchWithLeague,
  players: string[],
  filters: { seasons?: string[]; team?: string; statType: string },
) => {
  const params = new URLSearchParams({
    players: players.join(','),
    statType: filters.statType,
  });
  if (filters.seasons?.length) {
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

export const usePlayerComparison = (
  players: string[],
  filters: { seasons?: string[]; team?: string; statType: string },
) => {
  const { fetchWithLeague, scopeKey } = useLeagueAPI();

  return useQuery({
    queryKey: ['playerComparison', players, filters, scopeKey],
    queryFn: () => fetchPlayerComparisonData(fetchWithLeague, players, filters),
    enabled: players.length >= 2,
  });
};

export const fetchPlayerProgression = async (
  fetchWithLeague: FetchWithLeague,
  player: string,
  innings?: '1' | '2' | null,
) => {
  const params = new URLSearchParams({ player });
  if (innings) {
    params.append('innings', innings);
  }
  const response = await fetchWithLeague(`/api/stats/player-progression?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch player progression');
  }
  return response.json();
};

export const usePlayerProgression = (player: string, innings?: '1' | '2' | null) => {
  const { fetchWithLeague, scopeKey } = useLeagueAPI();

  return useQuery({
    queryKey: ['playerProgression', player, innings, scopeKey],
    queryFn: () => fetchPlayerProgression(fetchWithLeague, player, innings),
    enabled: !!player,
  });
};

export const fetchMultiMatchup = async (
  fetchWithLeague: FetchWithLeague,
  player: string,
  opponents: string[],
  mode: 'batterVsBowlers' | 'bowlerVsBatters',
) => {
  if (opponents.length === 0) {
    throw new Error('At least one opponent is required');
  }
  if (opponents.length > 5) {
    throw new Error('Maximum 5 opponents allowed');
  }

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

export const fetchMatchupRound = async (fetchWithLeague: FetchWithLeague, seed?: string) => {
  const params = new URLSearchParams();
  if (seed) {
    params.set('seed', seed);
  }
  const query = params.toString();
  const response = await fetchWithLeague(`/api/games/matchup-round${query ? `?${query}` : ''}`);
  if (!response.ok) {
    throw new Error('Failed to fetch matchup round');
  }
  return response.json();
};

export const useMultiMatchup = (
  player: string,
  opponents: string[],
  mode: 'batterVsBowlers' | 'bowlerVsBatters',
) => {
  const { fetchWithLeague, scopeKey } = useLeagueAPI();

  return useQuery({
    queryKey: ['multiMatchup', player, opponents, mode, scopeKey],
    queryFn: () => fetchMultiMatchup(fetchWithLeague, player, opponents, mode),
    enabled: !!player && opponents.length > 0 && opponents.length <= 5,
  });
};
