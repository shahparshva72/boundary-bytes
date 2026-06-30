import type { DraftPlayerStats, DraftThemeId } from './types';

export interface DraftThemeConfig {
  id: DraftThemeId;
  label: string;
  description: string;
  score: (stats: DraftPlayerStats, role: 'batter' | 'bowler') => number;
}

function bowlerBase(stats: DraftPlayerStats): number {
  return stats.wickets !== undefined ? stats.wickets * 8 : 0;
}

export const DRAFT_THEMES: DraftThemeConfig[] = [
  {
    id: 'power_hitter',
    label: 'Six Machine',
    description: 'Sixes score triple. Pick the big hitters.',
    score: (stats, role) => {
      if (role === 'batter') {
        return (stats.sixes ?? 0) * 3 + (stats.runs ?? 0) * 0.04;
      }
      return bowlerBase(stats) + (stats.wickets ?? 0) * 12;
    },
  },
  {
    id: 'boundary_king',
    label: 'Boundary King',
    description: 'Fours are doubled. Boundary hunters win.',
    score: (stats, role) => {
      if (role === 'batter') {
        return (stats.fours ?? 0) * 2 + (stats.runs ?? 0) * 0.03;
      }
      return bowlerBase(stats) + (stats.wickets ?? 0) * 12;
    },
  },
  {
    id: 'run_machine',
    label: 'Run Machine',
    description: 'Total runs are king. Volume batters shine.',
    score: (stats, role) => {
      if (role === 'batter') {
        return (stats.runs ?? 0) * 0.15 + (stats.fours ?? 0) * 0.5;
      }
      return bowlerBase(stats) + (stats.wickets ?? 0) * 14;
    },
  },
  {
    id: 'strike_master',
    label: 'Strike Master',
    description: 'Strike rate is weighted heavily. Go aggressive.',
    score: (stats, role) => {
      if (role === 'batter') {
        return (stats.strikeRate ?? 0) * 0.35 + (stats.runs ?? 0) * 0.05;
      }
      return bowlerBase(stats) + (stats.wickets ?? 0) * 12;
    },
  },
  {
    id: 'wicket_hunter',
    label: 'Wicket Hunter',
    description: 'Wickets score double. Pick strike bowlers.',
    score: (stats, role) => {
      if (role === 'bowler') {
        return (stats.wickets ?? 0) * 2 + Math.max(0, 12 - (stats.economy ?? 12)) * 3;
      }
      return (stats.runs ?? 0) * 0.04 + (stats.sixes ?? 0) * 0.5;
    },
  },
  {
    id: 'economy_expert',
    label: 'Economy Expert',
    description: 'Tight bowlers earn big. Lower economy wins.',
    score: (stats, role) => {
      if (role === 'bowler') {
        const eco = stats.economy ?? 10;
        return Math.max(0, 14 - eco) * 8 + (stats.wickets ?? 0) * 0.8;
      }
      return (stats.runs ?? 0) * 0.04 + (stats.strikeRate ?? 0) * 0.08;
    },
  },
];

export function getThemeById(id: DraftThemeId): DraftThemeConfig {
  return DRAFT_THEMES.find((t) => t.id === id) ?? DRAFT_THEMES[0]!;
}
