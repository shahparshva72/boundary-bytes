import { useEffect } from 'react';
import type { DailyDraftProgress } from '@/lib/games/dailyDraft/types';
import type { DailyProgress } from '@/lib/games/types';
import { useGameStore } from '@/stores/useGameStore';
import type { League } from '@/types/league';

interface DailyGameProgressResult<T> {
  progress: T | null;
  streak: number;
  isCompletedToday: boolean;
  sessionKey: string;
}

export function useDailyGameProgress(
  kind: 'draft',
  today: string,
  league: League | null,
): DailyGameProgressResult<DailyDraftProgress>;
export function useDailyGameProgress(
  kind: 'challenge',
  today: string,
  league: League | null,
): DailyGameProgressResult<DailyProgress>;
export function useDailyGameProgress(
  kind: 'draft' | 'challenge',
  today: string,
  league: League | null,
): DailyGameProgressResult<DailyDraftProgress | DailyProgress> {
  const progress = useGameStore((s) => (kind === 'draft' ? s.draftProgress : s.dailyProgress));
  const streak = useGameStore((s) => (kind === 'draft' ? s.draftStreak : s.dailyStreak));
  const clearIfNewDay = useGameStore((s) =>
    kind === 'draft' ? s.clearDraftProgressIfNewDay : s.clearDailyProgressIfNewDay,
  );

  useEffect(() => {
    if (league) {
      clearIfNewDay(today, league);
    }
  }, [today, league, clearIfNewDay]);

  const isCompletedToday =
    progress?.completed === true && progress.date === today && progress.league === league;

  return {
    progress,
    streak,
    isCompletedToday,
    sessionKey: `${league ?? ''}-${today}`,
  };
}
