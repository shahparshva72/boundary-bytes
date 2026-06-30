import type { GamePoolPlayer } from '@/lib/games/types';
import type { DraftPlayerStats } from './types';

interface BatterPricingContext {
  runVals: number[];
  srVals: number[];
  sixVals: number[];
  fourVals: number[];
}

interface BowlerPricingContext {
  wicketVals: number[];
  ecoVals: number[];
}

function normalize(values: number[], value: number): number {
  if (values.length === 0) {
    return 0;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) {
    return 50;
  }
  return ((value - min) / (max - min)) * 100;
}

function roundPrice(raw: number): number {
  return Math.max(80, Math.min(350, Math.round(raw)));
}

export function buildBatterPricingContext(pool: GamePoolPlayer[]): BatterPricingContext {
  return {
    runVals: pool.map((p) => p.runs ?? 0),
    srVals: pool.map((p) => p.strikeRate ?? 0),
    sixVals: pool.map((p) => p.sixes ?? 0),
    fourVals: pool.map((p) => p.fours ?? 0),
  };
}

export function buildBowlerPricingContext(pool: GamePoolPlayer[]): BowlerPricingContext {
  return {
    wicketVals: pool.map((p) => p.wickets ?? 0),
    ecoVals: pool.map((p) => p.economy ?? 10),
  };
}

export function priceBatter(
  player: GamePoolPlayer,
  context: BatterPricingContext,
): { price: number; stats: DraftPlayerStats } {
  const runs = player.runs ?? 0;
  const strikeRate = player.strikeRate ?? 0;
  const sixes = player.sixes ?? 0;
  const fours = player.fours ?? 0;

  const score =
    normalize(context.runVals, runs) * 0.35 +
    normalize(context.srVals, strikeRate) * 0.2 +
    normalize(context.sixVals, sixes) * 0.25 +
    normalize(context.fourVals, fours) * 0.2;

  return {
    price: roundPrice(80 + score * 2.2),
    stats: { runs, strikeRate, sixes, fours },
  };
}

export function priceBowler(
  player: GamePoolPlayer,
  context: BowlerPricingContext,
): { price: number; stats: DraftPlayerStats } {
  const wickets = player.wickets ?? 0;
  const economy = player.economy ?? 10;

  const ecoNorm = normalize(context.ecoVals, economy);
  const score = normalize(context.wicketVals, wickets) * 0.65 + (100 - ecoNorm) * 0.35;

  return {
    price: roundPrice(80 + score * 2.2),
    stats: { wickets, economy },
  };
}
