import goApi from '@/services/api';
import { Gender, League, LeagueConfig } from '@/types/league';

interface LeagueConfigItem {
  league: League;
  // name and gender come from leagues.json; older APIs omit them.
  name?: string;
  gender?: Gender;
  stats: LeagueConfig['stats'];
}

interface LeagueConfigsResponse {
  data: LeagueConfigItem[];
}

const EMPTY_STATS: LeagueConfig['stats'] = {
  teams: 0,
  matches: 0,
  players: 0,
  seasons: [],
};

// Badge colors and icons for the original leagues. Every other league gets a
// color from DEFAULT_PALETTE. Names and genders always come from the API.
const THEMES: Record<League, Pick<LeagueConfig, 'colors' | 'icon'>> = {
  WPL: {
    colors: { primary: '#FF5E5B', secondary: '#FFED66', accent: '#4ECDC4', headerBg: '#FF5E5B' },
    icon: '🏏',
  },
  IPL: {
    colors: { primary: '#FF9F1C', secondary: '#4ECDC4', accent: '#FFC700', headerBg: '#FF9F1C' },
    icon: '🏆',
  },
  BBL: {
    colors: { primary: '#2E86AB', secondary: '#F6F5AE', accent: '#F26419', headerBg: '#2E86AB' },
    icon: '🔥',
  },
  WBBL: {
    colors: { primary: '#E91E63', secondary: '#FFC107', accent: '#00BCD4', headerBg: '#E91E63' },
    icon: '⭐',
  },
  SA20: {
    colors: { primary: '#FF5722', secondary: '#FFC107', accent: '#4CAF50', headerBg: '#FF5722' },
    icon: '🏏',
  },
};

const DEFAULT_PALETTE = [
  '#4ECDC4',
  '#FFC700',
  '#FF9F1C',
  '#2E86AB',
  '#FF5E5B',
  '#9B5DE5',
  '#00BB7F',
];

// Used until /leagues/config answers, and if it fails: the leagues every API
// version serves.
const FALLBACK_LEAGUES: { league: League; name: string; gender: Gender }[] = [
  { league: 'IPL', name: 'Indian Premier League', gender: 'male' },
  { league: 'WPL', name: "Women's Premier League", gender: 'female' },
  { league: 'BBL', name: 'Big Bash League', gender: 'male' },
  { league: 'WBBL', name: "Women's Big Bash League", gender: 'female' },
  { league: 'SA20', name: 'SA20', gender: 'male' },
];

function themeFor(league: League): Pick<LeagueConfig, 'colors' | 'icon'> {
  const theme = THEMES[league];
  if (theme) {
    return theme;
  }
  let hash = 0;
  for (const char of league) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  const color = DEFAULT_PALETTE[hash % DEFAULT_PALETTE.length];
  return {
    colors: { primary: color, secondary: '#FFFEE0', accent: color, headerBg: color },
    icon: '🏏',
  };
}

const formatSeasonRange = (seasons: string[]): string[] => {
  if (seasons.length <= 1) {
    return seasons;
  }

  return [`${seasons[0]}-${seasons[seasons.length - 1]}`];
};

function toConfig(item: LeagueConfigItem, gender: Gender, name: string): LeagueConfig {
  return {
    id: item.league,
    name: item.league,
    fullName: name,
    gender,
    stats: { ...item.stats, seasons: formatSeasonRange(item.stats.seasons ?? []) },
    ...themeFor(item.league),
  };
}

export const FALLBACK_LEAGUE_CONFIGS: Record<League, LeagueConfig> = Object.fromEntries(
  FALLBACK_LEAGUES.map(({ league, name, gender }) => [
    league,
    toConfig({ league, stats: EMPTY_STATS }, gender, name),
  ]),
);

// buildLeagueConfigs keeps every league the API serves, in its order. An API
// that predates leagues.json sends no name or gender; the original leagues
// then use their known values and any others are skipped.
export const buildLeagueConfigs = (items: LeagueConfigItem[]): Record<League, LeagueConfig> => {
  const configs: Record<League, LeagueConfig> = {};
  for (const item of items) {
    const fallback = FALLBACK_LEAGUE_CONFIGS[item.league];
    const gender = item.gender ?? fallback?.gender;
    if (!gender) {
      continue;
    }
    configs[item.league] = toConfig(item, gender, item.name ?? fallback?.fullName ?? item.league);
  }
  return Object.keys(configs).length > 0 ? configs : FALLBACK_LEAGUE_CONFIGS;
};

export const fetchLeagueConfigs = async (): Promise<Record<League, LeagueConfig>> => {
  const response = await goApi.get('leagues/config').json<LeagueConfigsResponse>();
  return buildLeagueConfigs(response.data);
};
