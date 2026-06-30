import { buildDailyDraftBrief } from './brief';
import { solveOptimalLineup } from './optimal';
import {
  buildBatterPricingContext,
  buildBowlerPricingContext,
  priceBatter,
  priceBowler,
} from './pricing';
import { getThemeById } from './themes';
import { draftPlayerId, type DailyDraftPool, type DraftPoolInput, type DraftPlayer } from './types';

export function buildDailyDraftPool({ pool, league, date }: DraftPoolInput): DailyDraftPool {
  const brief = buildDailyDraftBrief(league, date);
  const theme = getThemeById(brief.themeId);
  const batterPricing = buildBatterPricingContext(pool.batters);
  const bowlerPricing = buildBowlerPricingContext(pool.bowlers);

  const batters: DraftPlayer[] = pool.batters.map((p) => {
    const { price, stats } = priceBatter(p, batterPricing);
    const role = 'batter' as const;
    return {
      id: draftPlayerId(role, p.player),
      name: p.player,
      role,
      price,
      stats,
      fantasyPoints: Math.round(theme.score(stats, role) * 10) / 10,
    };
  });

  const bowlers: DraftPlayer[] = pool.bowlers.map((p) => {
    const { price, stats } = priceBowler(p, bowlerPricing);
    const role = 'bowler' as const;
    return {
      id: draftPlayerId(role, p.player),
      name: p.player,
      role,
      price,
      stats,
      fantasyPoints: Math.round(theme.score(stats, role) * 10) / 10,
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
export { draftPlayerId } from './types';
export type * from './types';
