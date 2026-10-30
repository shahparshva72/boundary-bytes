'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_SCOPE } from '@/lib/league-scope';
import { LeagueScope } from '@/types/league';

interface ScopeStore {
  scope: LeagueScope;
  setScope: (scope: LeagueScope) => void;
}

// The scope for the current visit. Links between pages don't carry the
// query string, so this restores it; sessionStorage means a new visit starts
// again from every men's league.
export const useScopeStore = create<ScopeStore>()(
  persist(
    (set) => ({
      scope: DEFAULT_SCOPE,
      setScope: (scope) => set({ scope }),
    }),
    {
      name: 'boundary-bytes-scope',
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      // Rehydrated by LeagueProvider after mount, so the server render and
      // the first client render agree.
      skipHydration: true,
    },
  ),
);
