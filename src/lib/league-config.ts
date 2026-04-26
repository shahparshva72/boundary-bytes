import goApi from '@/services/api';
import { League, LeagueConfig } from '@/types/league';

interface LeagueConfigStatsItem {
  league: League;
  stats: LeagueConfig['stats'];
}

interface LeagueConfigsResponse {
  data: LeagueConfigStatsItem[];
}

const EMPTY_STATS: LeagueConfig['stats'] = {
  teams: 0,
  matches: 0,
  players: 0,
  seasons: [],
};

export const LEAGUE_CONFIGS: Record<League, LeagueConfig> = {
  WPL: {
    id: 'WPL',
    name: 'WPL',
    fullName: "Women's Premier League",
    description: "India's premier women's cricket tournament",
    tagline: 'POWER. PASSION. PERFORMANCE.',
    colors: {
      primary: '#FF5E5B', // Main red from existing theme
      secondary: '#FFED66', // Light yellow accent
      accent: '#4ECDC4', // Teal accent
      headerBg: '#FF5E5B', // Header background
    },
    stats: EMPTY_STATS,
    icon: '🏏',
  },
  IPL: {
    id: 'IPL',
    name: 'IPL',
    fullName: 'Indian Premier League',
    description: "The world's most popular T20 cricket league",
    tagline: 'CRICKET. ENTERTAINMENT. EXCELLENCE.',
    colors: {
      primary: '#FF9F1C', // Orange from existing theme
      secondary: '#4ECDC4', // Teal accent
      accent: '#FFC700', // Yellow accent
      headerBg: '#FF9F1C', // Header background
    },
    stats: EMPTY_STATS,
    icon: '🏆',
  },
  BBL: {
    id: 'BBL',
    name: 'BBL',
    fullName: 'Big Bash League',
    description: "Australia's premier T20 cricket league",
    tagline: 'BIG HITS. BIG MOMENTS.',
    colors: {
      primary: '#2E86AB',
      secondary: '#F6F5AE',
      accent: '#F26419',
      headerBg: '#2E86AB',
    },
    stats: EMPTY_STATS,
    icon: '🔥',
  },
  WBBL: {
    id: 'WBBL',
    name: 'WBBL',
    fullName: "Women's Big Bash League",
    description: "Australia's premier women's T20 cricket league",
    tagline: 'INSPIRING THE NEXT GENERATION.',
    colors: {
      primary: '#E91E63',
      secondary: '#FFC107',
      accent: '#00BCD4',
      headerBg: '#E91E63',
    },
    stats: EMPTY_STATS,
    icon: '⭐',
  },
  SA20: {
    id: 'SA20',
    name: 'SA20',
    fullName: 'SA20',
    description: "South Africa's premier T20 cricket league",
    tagline: "AFRICA'S FINEST. GLOBAL STAGE.",
    colors: {
      primary: '#FF5722',
      secondary: '#FFC107',
      accent: '#4CAF50',
      headerBg: '#FF5722',
    },
    stats: EMPTY_STATS,
    icon: '🏏',
  },
};

export const VALID_LEAGUES: League[] = ['WPL', 'IPL', 'BBL', 'WBBL', 'SA20'];

export const getLeagueConfig = (league: League): LeagueConfig => {
  return LEAGUE_CONFIGS[league];
};

const formatSeasonRange = (seasons: string[]): string[] => {
  if (seasons.length <= 1) {
    return seasons;
  }

  return [`${seasons[0]}-${seasons[seasons.length - 1]}`];
};

export const mergeLeagueConfigStats = (
  statsItems: LeagueConfigStatsItem[],
): Record<League, LeagueConfig> => {
  return statsItems.reduce<Record<League, LeagueConfig>>(
    (configs, item) => {
      if (!VALID_LEAGUES.includes(item.league)) {
        return configs;
      }

      configs[item.league] = {
        ...configs[item.league],
        stats: {
          ...item.stats,
          seasons: formatSeasonRange(item.stats.seasons),
        },
      };

      return configs;
    },
    { ...LEAGUE_CONFIGS },
  );
};

export const fetchLeagueConfigs = async (): Promise<Record<League, LeagueConfig>> => {
  const response = await goApi.get('leagues/config').json<LeagueConfigsResponse>();
  return mergeLeagueConfigStats(response.data);
};
