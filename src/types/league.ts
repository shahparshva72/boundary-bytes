export type League = 'WPL' | 'IPL' | 'BBL' | 'WBBL' | 'SA20';

export interface LeagueConfig {
  id: League;
  name: string;
  fullName: string;
  description: string;
  tagline: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    headerBg: string;
  };
  stats: {
    teams: number;
    matches: number;
    players: number;
    seasons: string[];
  };
  icon: string;
}

export interface LeaguePreference {
  league: League;
  timestamp: number;
  version: string;
}

export interface LeagueContextType {
  selectedLeague: League | null;
  isFirstVisit: boolean;
  selectLeague: (league: League) => void;
  resetLeagueSelection: () => void;
  isTransitioning: boolean;
  leagueConfig: LeagueConfig | null;
}
