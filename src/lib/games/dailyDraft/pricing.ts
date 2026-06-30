import type { GamePoolPlayer } from '@/lib/games/types';
import type { DraftPlayerStats } from './types';

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

export function priceBatter(
  player: GamePoolPlayer,
  pool: GamePoolPlayer[],
): { price: number; stats: DraftPlayerStats } {
  const runs = player.runs ?? 0;
  const strikeRate = player.strikeRate ?? 0;
  const sixes = player.sixes ?? 0;
  const fours = player.fours ?? 0;

  const runVals = pool.map((p) => p.runs ?? 0);
  const srVals = pool.map((p) => p.strikeRate ?? 0);
  const sixVals = pool.map((p) => p.sixes ?? 0);
  const fourVals = pool.map((p) => p.fours ?? 0);

  const score =
    normalize(runVals, runs) * 0.35 +
    normalize(srVals, strikeRate) * 0.2 +
    normalize(sixVals, sixes) * 0.25 +
    normalize(fourVals, fours) * 0.2;

  return {
    price: roundPrice(80 + score * 2.2),
    stats: { runs, strikeRate, sixes, fours },
  };
}

export function priceBowler(
  player: GamePoolPlayer,
  pool: GamePoolPlayer[],
): { price: number; stats: DraftPlayerStats } {
  const wickets = player.wickets ?? 0;
  const economy = player.economy ?? 10;

  const wicketVals = pool.map((p) => p.wickets ?? 0);
  const ecoVals = pool.map((p) => p.economy ?? 10);

  const ecoNorm = normalize(ecoVals, economy);
  const score = normalize(wicketVals, wickets) * 0.65 + (100 - ecoNorm) * 0.35;

  return {
    price: roundPrice(80 + score * 2.2),
    stats: { wickets, economy },
  };
}
