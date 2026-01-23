import api from './axios';

// Team stats
export const fetchTeamWins = async () => {
  const { data } = await api.get('/stats/team-wins');
  return data;
};

export const fetchTeamAverages = async () => {
  const { data } = await api.get('/stats/team-averages');
  return data;
};

// Player stats
export const fetchWicketTakers = async (page: number) => {
  const { data } = await api.get('/stats/leading-wicket-takers', {
    params: { page, limit: 10 },
  });
  return data;
};

export const fetchRunScorers = async (page: number) => {
  const { data } = await api.get('/stats/leading-run-scorers', {
    params: { page, limit: 10 },
  });
  return data;
};

export const fetchBowlingWicketTypes = async (page: number) => {
  const { data } = await api.get('/stats/bowling-wicket-types', {
    params: { page, limit: 10 },
  });
  return data;
};

// Matchup & advanced stats
export const fetchMatchup = async (batter: string, bowler: string) => {
  const { data } = await api.get(`/stats/matchup?batter=${batter}&bowler=${bowler}`);
  return data;
};

export const fetchAdvancedStats = async (overs: number[], player: string, playerType: string) => {
  const params = new URLSearchParams({
    overs: overs.join(','),
    playerType,
    ...(playerType === 'batter' ? { batter: player } : { bowler: player }),
  });
  const { data } = await api.get(`/stats/advanced?${params}`);
  return data;
};

// Fall of wickets
export const fetchFallOfWickets = async (matchId: number) => {
  const { data } = await api.get(`/stats/fall-of-wickets/${matchId}`);
  return data;
};

// Player comparison
export const fetchPlayerComparison = async (
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

  const { data } = await api.get(`/stats/player-compare?${params}`);
  return data;
};
