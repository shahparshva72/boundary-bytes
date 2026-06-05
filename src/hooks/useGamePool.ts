'use client';

import { useMemo } from 'react';
import { useRunScorers, useWicketTakers } from '@/hooks/useStatsAPI';
import type { GamePool } from '@/lib/games/types';

const POOL_LIMIT = 50;

export function useGamePool() {
  const {
    data: runScorersData,
    isLoading: runScorersLoading,
    isError: runScorersError,
  } = useRunScorers(1, [], POOL_LIMIT);
  const {
    data: wicketTakersData,
    isLoading: wicketTakersLoading,
    isError: wicketTakersError,
  } = useWicketTakers(1, POOL_LIMIT);

  const pool: GamePool | null = useMemo(() => {
    const batters = runScorersData?.data;
    const bowlers = wicketTakersData?.data;
    if (!batters?.length || !bowlers?.length) {
      return null;
    }

    return {
      batters: batters.map(
        (p: {
          player: string;
          runs: number;
          strikeRate: number;
          sixes: number;
          fours: number;
        }) => ({
          player: p.player,
          runs: p.runs,
          strikeRate: p.strikeRate,
          sixes: p.sixes,
          fours: p.fours,
        }),
      ),
      bowlers: bowlers.map((p: { player: string; wickets: number; economy: number }) => ({
        player: p.player,
        wickets: p.wickets,
        economy: p.economy,
      })),
    };
  }, [runScorersData, wicketTakersData]);

  return {
    pool,
    isLoading: runScorersLoading || wicketTakersLoading,
    isError: runScorersError || wicketTakersError,
  };
}
