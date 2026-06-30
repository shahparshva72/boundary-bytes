import { createSeededRandom } from '@/lib/games/seededRandom';
import type { League } from '@/types/league';
import { DRAFT_THEMES } from './themes';
import type { DailyDraftBrief, SquadShape } from './types';

const SQUAD_SHAPES: SquadShape[] = [
  { batters: 4, bowlers: 2 },
  { batters: 3, bowlers: 3 },
  { batters: 5, bowlers: 1 },
  { batters: 4, bowlers: 3 },
];

const BUDGET_OPTIONS = [900, 1000, 1100, 1200];

export function buildDailyDraftSeed(league: League, date: string): string {
  return `${league}-${date}-draft`;
}

export function buildDailyDraftBrief(league: League, date: string): DailyDraftBrief {
  const seed = buildDailyDraftSeed(league, date);
  const rng = createSeededRandom(seed);

  const squadShape = rng.pick(SQUAD_SHAPES);
  const budget = rng.pick(BUDGET_OPTIONS);
  const theme = rng.pick(DRAFT_THEMES);

  return {
    date,
    league,
    seed,
    budget,
    squadShape,
    themeId: theme.id,
    themeLabel: theme.label,
    themeDescription: theme.description,
  };
}
