import { League, LeagueConfig } from '@/types/league';

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
    stats: {
      teams: 5,
      matches: 66,
      players: 108,
      seasons: ['2023', '2024', '2025'],
    },
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
    stats: {
      teams: 15,
      matches: 1169,
      players: 704,
      seasons: ['2008-2025'],
    },
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
    stats: {
      teams: 8,
      matches: 618,
      players: 512,
      seasons: ['2011-2025'],
    },
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
    stats: {
      teams: 8,
      matches: 502,
      players: 275,
      seasons: ['2015/16-2025/26'],
    },
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
    stats: {
      teams: 6,
      matches: 99,
      players: 184,
      seasons: ['2022/23-2024/25'],
    },
    icon: '🏏',
  },
};

export const VALID_LEAGUES: League[] = ['WPL', 'IPL', 'BBL', 'WBBL', 'SA20'];

export const getLeagueConfig = (league: League): LeagueConfig => {
  return LEAGUE_CONFIGS[league];
};
