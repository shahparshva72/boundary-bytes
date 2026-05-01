import api from './api';

// Team stats
export const fetchTeamWins = async () => {
  return api.get('stats/team-wins').json();
};

export const fetchTeamAverages = async () => {
  return api.get('stats/team-averages').json();
};

// Player stats
export const fetchWicketTakers = async (page: number) => {
  return api.get('stats/leading-wicket-takers', { searchParams: { page, limit: 10 } }).json();
};

export const fetchRunScorers = async (page: number, battingPositions: number[] = []) => {
  const searchParams: Record<string, string | number> = { page, limit: 10 };
  if (battingPositions.length) {
    searchParams.battingPositions = battingPositions.join(',');
  }
  return api.get('stats/leading-run-scorers', { searchParams }).json();
};

export const fetchBowlingWicketTypes = async (page: number) => {
  return api.get('stats/bowling-wicket-types', { searchParams: { page, limit: 10 } }).json();
};

// Matchup & advanced stats
export const fetchMatchup = async (batter: string, bowler: string) => {
  return api.get('stats/matchup', { searchParams: { batter, bowler } }).json();
};

export const fetchAdvancedStats = async (overs: number[], player: string, playerType: string) => {
  const searchParams: Record<string, string> = {
    overs: overs.join(','),
    playerType,
    ...(playerType === 'batter' ? { batter: player } : { bowler: player }),
  };
  return api.get('stats/advanced', { searchParams }).json();
};

// Fall of wickets
interface FallOfWicketsData {
  matchInfo: {
    id: number;
    teams: string[];
    venue: string;
    date: string;
    season: string;
  };
  innings: {
    inningsNumber: number;
    battingTeam: string;
    wickets: {
      wicketNumber: number;
      over: string;
      runsAtFall: number;
      batsmanOut: string;
      dismissalType: string;
      bowler: string;
    }[];
  }[];
}

export const fetchFallOfWickets = async (matchId: number) => {
  return api.get(`stats/fall-of-wickets/${matchId}`).json<FallOfWicketsData>();
};

// Player comparison
export const fetchPlayerComparison = async (
  players: string[],
  filters: { seasons?: string[]; team?: string; statType: string },
) => {
  const searchParams: Record<string, string> = {
    players: players.join(','),
    statType: filters.statType,
  };
  if (filters.seasons && filters.seasons.length > 0) {
    searchParams.seasons = filters.seasons.join(',');
  }
  if (filters.team) {
    searchParams.team = filters.team;
  }

  return api.get('stats/player-compare', { searchParams }).json();
};
