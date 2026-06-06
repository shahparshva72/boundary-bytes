'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  setStatGuesserBestStreak: (league: League, streak: number) => void;
  setMatchupBestScore: (league: League, score: number) => void;
  setDailyProgress: (progress: DailyProgress) => void;
  clearDailyProgressIfNewDay: (today: string, league: League) => void;
  updateDailyStreak: (today: string, completed: boolean) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      statGuesserBestStreak: emptyLeagueRecord(),
      matchupBestScore: emptyLeagueRecord(),
      dailyProgress: null,
      dailyStreak: 0,
      lastDailyDate: null,
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
      version: 1,
    },
  ),
);
