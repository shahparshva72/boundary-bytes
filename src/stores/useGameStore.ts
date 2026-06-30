'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyDraftProgress } from '@/lib/games/dailyDraft/types';
import type { DailyProgress } from '@/lib/games/types';
import { VALID_LEAGUES } from '@/lib/league-config';
import type { League } from '@/types/league';

function emptyLeagueRecord(): Record<League, number> {
  return VALID_LEAGUES.reduce(
    (acc, league) => {
      acc[league] = 0;
      return acc;
    },
    {} as Record<League, number>,
  );
}

interface GameStore {
  statGuesserBestStreak: Record<League, number>;
  matchupBestScore: Record<League, number>;
  dailyProgress: DailyProgress | null;
  dailyStreak: number;
  lastDailyDate: string | null;
  draftProgress: DailyDraftProgress | null;
  draftStreak: number;
  lastDraftDate: string | null;
  setStatGuesserBestStreak: (league: League, streak: number) => void;
  setMatchupBestScore: (league: League, score: number) => void;
  setDailyProgress: (progress: DailyProgress) => void;
  setDraftProgress: (progress: DailyDraftProgress) => void;
  clearDailyProgressIfNewDay: (today: string, league: League) => void;
  clearDraftProgressIfNewDay: (today: string, league: League) => void;
  updateDailyStreak: (today: string, completed: boolean) => void;
  updateDraftStreak: (today: string, completed: boolean) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      statGuesserBestStreak: emptyLeagueRecord(),
      matchupBestScore: emptyLeagueRecord(),
      dailyProgress: null,
      dailyStreak: 0,
      lastDailyDate: null,
      draftProgress: null,
      draftStreak: 0,
      lastDraftDate: null,
      setStatGuesserBestStreak: (league, streak) =>
        set((state) => ({
          statGuesserBestStreak: {
            ...state.statGuesserBestStreak,
            [league]: Math.max(state.statGuesserBestStreak[league], streak),
          },
        })),
      setMatchupBestScore: (league, score) =>
        set((state) => ({
          matchupBestScore: {
            ...state.matchupBestScore,
            [league]: Math.max(state.matchupBestScore[league], score),
          },
        })),
      setDailyProgress: (progress) => set({ dailyProgress: progress }),
      setDraftProgress: (progress) => set({ draftProgress: progress }),
      clearDailyProgressIfNewDay: (today, league) => {
        const { dailyProgress } = get();
        if (dailyProgress && (dailyProgress.date !== today || dailyProgress.league !== league)) {
          set({ dailyProgress: null });
        }
      },
      clearDraftProgressIfNewDay: (today, league) => {
        const { draftProgress } = get();
        if (draftProgress && (draftProgress.date !== today || draftProgress.league !== league)) {
          set({ draftProgress: null });
        }
      },
      updateDailyStreak: (today, completed) => {
        if (!completed) {
          return;
        }
        const { lastDailyDate, dailyStreak } = get();
        if (lastDailyDate === today) {
          return;
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayISO = yesterday.toISOString().slice(0, 10);

        const nextStreak = lastDailyDate === yesterdayISO ? dailyStreak + 1 : 1;
        set({ dailyStreak: nextStreak, lastDailyDate: today });
      },
      updateDraftStreak: (today, completed) => {
        if (!completed) {
          return;
        }
        const { lastDraftDate, draftStreak } = get();
        if (lastDraftDate === today) {
          return;
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayISO = yesterday.toISOString().slice(0, 10);

        const nextStreak = lastDraftDate === yesterdayISO ? draftStreak + 1 : 1;
        set({ draftStreak: nextStreak, lastDraftDate: today });
      },
    }),
    {
      name: 'boundary-bytes-games',
      version: 2,
      migrate: (persistedState, version) => {
        if (version < 2) {
          const state = persistedState as Partial<GameStore>;
          return {
            ...state,
            draftProgress: state.draftProgress ?? null,
            draftStreak: state.draftStreak ?? 0,
            lastDraftDate: state.lastDraftDate ?? null,
          };
        }
        return persistedState as GameStore;
      },
    },
  ),
);
