// A league code from the API's leagues.json, e.g. 'IPL', 'PSL', 'WHND'.
export type League = string;

export type Gender = 'male' | 'female';

export interface LeagueConfig {
  id: League;
  // Short label: the league code.
  name: string;
  // The league's name as Cricsheet publishes it.
  fullName: string;
  gender: Gender;
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

// What the stats are about: one gender, and optionally specific leagues of
// it. No leagues means every league of that gender.
export interface LeagueScope {
  gender: Gender;
  leagues: League[];
}

export interface LeagueContextType {
  scope: LeagueScope;
  // Stable string for query keys and per-scope storage, e.g. 'male' or 'male:IPL,PSL'.
  scopeKey: string;
  // Short label for buttons: "All men's leagues", "IPL", "IPL, PSL".
  scopeLabel: string;
  // For sentences: "all men's leagues", "the IPL", "the IPL and PSL".
  scopeDescription: string;
  // The league when exactly one is selected.
  singleLeague: League | null;
  setGender: (gender: Gender) => void;
  setLeagues: (leagues: League[]) => void;
  leagueConfigs: Record<League, LeagueConfig>;
  // Leagues of a gender, A–Z by name.
  leaguesFor: (gender: Gender) => LeagueConfig[];
}
