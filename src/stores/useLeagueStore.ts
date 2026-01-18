'use client';

import { League } from '@/types/league';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LeagueStore {
  lastLeague: League | null;
  setLastLeague: (league: League) => void;
  clearLastLeague: () => void;
}

export const useLeagueStore = create<LeagueStore>()(
  persist(
    (set) => ({
      lastLeague: null,
      setLastLeague: (league) => set({ lastLeague: league }),
      clearLastLeague: () => set({ lastLeague: null }),
    }),
    {
      name: 'boundary-bytes-league',
      version: 1,
    },
  ),
);
