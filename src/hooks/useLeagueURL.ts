'use client';

import { useLeagueStore } from '@/stores/useLeagueStore';
import { League } from '@/types/league';
import { VALID_LEAGUES } from '@/utils/league-config';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useCallback, useEffect, useState } from 'react';

// Parser that validates league values from URL
const leagueParser = parseAsStringLiteral(VALID_LEAGUES);

export function useLeagueURL() {
  const [urlLeague, setUrlLeague] = useQueryState('league', leagueParser);
  const { lastLeague, setLastLeague, clearLastLeague } = useLeagueStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for zustand hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Sync URL to zustand when URL has a league
  useEffect(() => {
    if (urlLeague) {
      setLastLeague(urlLeague as League);
    }
  }, [urlLeague, setLastLeague]);

  // Restore from zustand if URL is empty (after hydration)
  useEffect(() => {
    if (isHydrated && !urlLeague && lastLeague) {
      setUrlLeague(lastLeague);
    }
  }, [isHydrated, urlLeague, lastLeague, setUrlLeague]);

  const selectedLeague = (urlLeague as League | null) ?? lastLeague;

  const selectLeague = useCallback(
    async (league: League) => {
      await setUrlLeague(league);
      setLastLeague(league);
    },
    [setUrlLeague, setLastLeague],
  );

  const resetLeagueSelection = useCallback(() => {
    setUrlLeague(null);
    clearLastLeague();
  }, [setUrlLeague, clearLastLeague]);

  // First visit = no URL league AND no stored league (after hydration)
  const isFirstVisit = isHydrated && !urlLeague && !lastLeague;

  return {
    selectedLeague,
    selectLeague,
    resetLeagueSelection,
    isFirstVisit,
    isHydrated,
  };
}
