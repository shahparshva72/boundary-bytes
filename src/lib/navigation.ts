import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Bot,
  ChartNoAxesCombined,
  CircleDot,
  Gauge,
  GitCompareArrows,
  Newspaper,
  Search,
  Sparkles,
  Swords,
  Target,
  Trophy,
  UsersRound,
} from 'lucide-react';

export interface NavigationItem {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
}

export interface NavigationGroup {
  label: string;
  description: string;
  items: NavigationItem[];
}

export const primaryNavigation: NavigationItem[] = [
  {
    label: 'Matches',
    href: '/',
    description: 'Scores and results by season',
    icon: CircleDot,
  },
  {
    label: 'Players',
    href: '/players',
    description: 'Profiles and career records',
    icon: UsersRound,
  },
  {
    label: 'Play',
    href: '/play',
    description: 'Cricket games powered by real stats',
    icon: Swords,
  },
  {
    label: 'News',
    href: '/news',
    description: 'The latest stories from ESPN Cricinfo',
    icon: Newspaper,
  },
];

export const featureGroups: NavigationGroup[] = [
  {
    label: 'Matchups & players',
    description: 'Settle player debates with ball-by-ball data.',
    items: [
      {
        label: 'Batter vs Bowler',
        href: '/stats',
        description: 'Explore any head-to-head matchup',
        icon: Target,
      },
      {
        label: 'Multi Matchup',
        href: '/stats?tab=Multi+Matchup',
        description: 'Compare one batter against multiple bowlers',
        icon: UsersRound,
      },
      {
        label: 'Compare Players',
        href: '/stats/compare',
        description: 'Compare batting and bowling records',
        icon: GitCompareArrows,
      },
      {
        label: 'Player Progression',
        href: '/stats/player-progression',
        description: 'Track strike rate through an innings',
        icon: ChartNoAxesCombined,
      },
    ],
  },
  {
    label: 'Leaderboards & teams',
    description: 'Find the players and teams setting the pace.',
    items: [
      {
        label: 'Run Scorers',
        href: '/stats?tab=Run+Scorers',
        description: 'Leading batters by season',
        icon: Trophy,
      },
      {
        label: 'Wicket Takers',
        href: '/stats?tab=Wicket+Takers',
        description: 'Leading bowlers by season',
        icon: Target,
      },
      {
        label: 'Team Records',
        href: '/stats?tab=Team+Wins',
        description: 'Compare team wins by season',
        icon: BarChart3,
      },
      {
        label: 'Team Averages',
        href: '/stats?tab=Team+Averages',
        description: 'Compare team batting averages',
        icon: ChartNoAxesCombined,
      },
      {
        label: 'Team Run Rate',
        href: '/stats?tab=Team+Run+Rate',
        description: 'Track scoring pace through an innings',
        icon: Gauge,
      },
      {
        label: 'Wicket Types',
        href: '/stats?tab=Bowling+Wicket+Types',
        description: 'How each bowler takes their wickets',
        icon: CircleDot,
      },
    ],
  },
  {
    label: 'Build your own analysis',
    description: 'Go deeper when a leaderboard is not enough.',
    items: [
      {
        label: 'Stat Explorer',
        href: '/stat-explorer',
        description: 'Filter, sort, and build a custom table',
        icon: Search,
      },
      {
        label: 'Advanced Stats',
        href: '/stats/advanced',
        description: 'Analyze players by over and match phase',
        icon: Gauge,
      },
      {
        label: 'Ask Boundary Bytes',
        href: '/chat',
        description: 'Ask a cricket question in plain English',
        icon: Bot,
      },
      {
        label: 'Play with Stats',
        href: '/play',
        description: 'Put your cricket knowledge to the test',
        icon: Sparkles,
      },
    ],
  },
];

const explorePathPrefixes = ['/explore', '/stats', '/stat-explorer'];

export function isPathActive(pathname: string, href: string): boolean {
  const path = href.split('?')[0];
  return path === '/' ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);
}

export function isExplorePath(pathname: string): boolean {
  return explorePathPrefixes.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
