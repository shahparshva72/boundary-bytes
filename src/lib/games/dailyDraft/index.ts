import { buildDailyDraftBrief } from './brief';
import { solveOptimalLineup } from './optimal';
import { priceBatter, priceBowler } from './pricing';
import { getThemeById } from './themes';
import type { DailyDraftPool, DraftPoolInput, DraftPlayer } from './types';

export function buildDailyDraftPool({ pool, league, date }: DraftPoolInput): DailyDraftPool {
  const brief = buildDailyDraftBrief(league, date);
  const theme = getThemeById(brief.themeId);

  const batters: DraftPlayer[] = pool.batters.map((p) => {
    const { price, stats } = priceBatter(p, pool.batters);
    return {
      name: p.player,
      role: 'batter' as const,
      price,
      stats,
      fantasyPoints: Math.round(theme.score(stats, 'batter') * 10) / 10,
    };
  });

  const bowlers: DraftPlayer[] = pool.bowlers.map((p) => {
    const { price, stats } = priceBowler(p, pool.bowlers);
    return {
      name: p.player,
      role: 'bowler' as const,
      price,
      stats,
      fantasyPoints: Math.round(theme.score(stats, 'bowler') * 10) / 10,
    };
  });

  const players = [...batters, ...bowlers];
  const { score: optimalScore, lineup: optimalLineup } = solveOptimalLineup(
    players,
    brief.budget,
    brief.squadShape,
  );

  return {
    brief,
    players,
    optimalScore: Math.round(optimalScore * 10) / 10,
    optimalLineup,
  };
}

export { buildDailyDraftBrief, buildDailyDraftSeed } from './brief';
export { scoreLineup, lineupCost, efficiencyPct, solveOptimalLineup } from './optimal';
export { getThemeById, DRAFT_THEMES } from './themes';
export type * from './types';
