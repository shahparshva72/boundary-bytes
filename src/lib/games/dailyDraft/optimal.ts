import type { DraftPlayer, SquadShape } from './types';

interface DpState {
  score: number;
  lineup: string[];
}

function stateKey(battersLeft: number, bowlersLeft: number, budgetLeft: number): string {
  return `${battersLeft}-${bowlersLeft}-${budgetLeft}`;
}

export function solveOptimalLineup(
  players: DraftPlayer[],
  budget: number,
  squadShape: SquadShape,
): { score: number; lineup: string[] } {
  const battersNeeded = squadShape.batters;
  const bowlersNeeded = squadShape.bowlers;

  let dp = new Map<string, DpState>();
  dp.set(stateKey(battersNeeded, bowlersNeeded, budget), { score: 0, lineup: [] });

  for (const player of players) {
    const next = new Map<string, DpState>();

    for (const [key, state] of dp) {
      const [bStr, bowStr, budgetStr] = key.split('-');
      const battersLeft = Number(bStr);
      const bowlersLeft = Number(bowStr);
      const budgetLeft = Number(budgetStr);

      const keepExisting = next.get(key);
      if (!keepExisting || state.score > keepExisting.score) {
        next.set(key, state);
      }

      if (player.price > budgetLeft) {
        continue;
      }

      const roleNeed =
        player.role === 'batter' ? battersLeft > 0 : player.role === 'bowler' && bowlersLeft > 0;
      if (!roleNeed) {
        continue;
      }

      const newBatters = player.role === 'batter' ? battersLeft - 1 : battersLeft;
      const newBowlers = player.role === 'bowler' ? bowlersLeft - 1 : bowlersLeft;
      const newBudget = budgetLeft - player.price;
      const newKey = stateKey(newBatters, newBowlers, newBudget);

      if (state.lineup.includes(player.id)) {
        continue;
      }

      const candidate: DpState = {
        score: state.score + player.fantasyPoints,
        lineup: [...state.lineup, player.id],
      };

      const existing = next.get(newKey);
      if (!existing || candidate.score > existing.score) {
        next.set(newKey, candidate);
      }
    }

    dp = next;
  }

  const totalNeeded = battersNeeded + bowlersNeeded;
  let best: DpState = { score: 0, lineup: [] };

  for (const [key, state] of dp) {
    const parts = key.split('-');
    const battersLeft = Number(parts[0]);
    const bowlersLeft = Number(parts[1]);
    if (
      battersLeft === 0 &&
      bowlersLeft === 0 &&
      state.lineup.length === totalNeeded &&
      state.score > best.score
    ) {
      best = state;
    }
  }

  return best;
}

export function scoreLineup(players: DraftPlayer[], selectedIds: string[]): number {
  const byId = new Map(players.map((p) => [p.id, p]));
  return selectedIds.reduce((sum, id) => sum + (byId.get(id)?.fantasyPoints ?? 0), 0);
}

export function lineupCost(players: DraftPlayer[], selectedIds: string[]): number {
  const byId = new Map(players.map((p) => [p.id, p]));
  return selectedIds.reduce((sum, id) => sum + (byId.get(id)?.price ?? 0), 0);
}

export function efficiencyPct(score: number, optimalScore: number): number {
  if (optimalScore <= 0) {
    return score > 0 ? 100 : 0;
  }
  return Math.min(100, Math.round((score / optimalScore) * 100));
}
