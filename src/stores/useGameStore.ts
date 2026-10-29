'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyProgress } from '@/lib/games/types';
import { FALLBACK_LEAGUE_CONFIGS } from '@/lib/league-config';
import { scopeKey } from '@/lib/league-scope';

// Records are kept per league scope (the context's scopeKey, e.g. 'male' or
// 'male:IPL').
type ScopeRecord = Record<string, number>;

interface GameStore {
  statGuesserBestStreak: ScopeRecord;
  matchupBestScore: ScopeRecord;
  dailyProgress: DailyProgress | null;
  dailyStreak: number;
  lastDailyDate: string | null;
  setStatGuesserBestStreak: (scopeKey: string, streak: number) => void;
  setMatchupBestScore: (scopeKey: string, score: number) => void;
  setDailyProgress: (progress: DailyProgress) => void;
  clearDailyProgressIfNewDay: (today: string, scopeKey: string) => void;
  updateDailyStreak: (today: string, completed: boolean) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      statGuesserBestStreak: {},
      matchupBestScore: {},
      dailyProgress: null,
      dailyStreak: 0,
      lastDailyDate: null,
      setStatGuesserBestStreak: (league, streak) =>
        set((state) => ({
          statGuesserBestStreak: {
            ...state.statGuesserBestStreak,
            [league]: Math.max(state.statGuesserBestStreak[league] ?? 0, streak),
          },
        })),
      setMatchupBestScore: (league, score) =>
        set((state) => ({
          matchupBestScore: {
            ...state.matchupBestScore,
            [league]: Math.max(state.matchupBestScore[league] ?? 0, score),
          },
        })),
      setDailyProgress: (progress) => set({ dailyProgress: progress }),
      clearDailyProgressIfNewDay: (today, league) => {
        const { dailyProgress } = get();
        if (dailyProgress && (dailyProgress.date !== today || dailyProgress.league !== league)) {
          set({ dailyProgress: null });
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
    }),
    {
      name: 'boundary-bytes-games',
      version: 2,
      // v1 kept records per league code ('IPL'); v2 per scope ('male:IPL').
      migrate: (persisted, version) => {
        const state = persisted as Partial<GameStore>;
        if (version < 2) {
          const toScopeKey = (league: string) => {
            const gender = FALLBACK_LEAGUE_CONFIGS[league]?.gender ?? 'male';
            return scopeKey({ gender, leagues: [league] });
          };
          const rekey = (record: ScopeRecord = {}) =>
            Object.fromEntries(
              Object.entries(record)
                .filter(([, value]) => value > 0)
                .map(([league, value]) => [toScopeKey(league), value]),
            );
          state.statGuesserBestStreak = rekey(state.statGuesserBestStreak);
          state.matchupBestScore = rekey(state.matchupBestScore);
          if (state.dailyProgress) {
            state.dailyProgress = {
              ...state.dailyProgress,
              league: toScopeKey(state.dailyProgress.league),
            };
          }
        }
        return state as GameStore;
      },
    },
  ),
);
