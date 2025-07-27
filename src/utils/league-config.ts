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
      seasons: ['2023', '2024'],
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
      teams: 18,
      matches: 1169,
      players: 704,
      seasons: ['2008-2024'],
    },
    icon: '🏆',
  },
};

export const VALID_LEAGUES: League[] = ['WPL', 'IPL'];

export const getLeagueConfig = (league: League): LeagueConfig => {
  return LEAGUE_CONFIGS[league];
};
