'use client';

import { useQuery } from '@tanstack/react-query';
import { parseAsArrayOf, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo } from 'react';
import { FALLBACK_LEAGUE_CONFIGS, fetchLeagueConfigs } from '@/lib/league-config';
import {
  DEFAULT_SCOPE,
  genderOfLeagues,
  isDefaultScope,
  sanitizeScope,
  scopeDescription,
  scopeKey,
  scopeLabel,
} from '@/lib/league-scope';
import { useScopeStore } from '@/stores/useScopeStore';
import { Gender, League, LeagueContextType, LeagueScope } from '@/types/league';

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

const scopeQueryParsers = {
  gender: parseAsStringLiteral(['male', 'female'] as const),
  leagues: parseAsArrayOf(parseAsString, ','),
  // ?league=IPL links from before leagues could be combined.
  league: parseAsString,
};

// The old league picker kept its choice here (zustand persist format).
const LEGACY_LEAGUE_STORAGE_KEY = 'boundary-bytes-league';

const readLegacyStoredLeague = (): League | null => {
  try {
    const raw = window.localStorage.getItem(LEGACY_LEAGUE_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    window.localStorage.removeItem(LEGACY_LEAGUE_STORAGE_KEY);
    return (JSON.parse(raw)?.state?.lastLeague as League | null) ?? null;
  } catch {
    return null;
  }
};

interface LeagueProviderProps {
  children: ReactNode;
}

export const LeagueProvider = ({ children }: LeagueProviderProps) => {
  const { data: fetchedConfigs, isFetched } = useQuery({
    queryKey: ['league-configs'],
    queryFn: fetchLeagueConfigs,
    staleTime: 5 * 60 * 1000,
  });
  const leagueConfigs = fetchedConfigs ?? FALLBACK_LEAGUE_CONFIGS;

  const [query, setQuery] = useQueryStates(scopeQueryParsers);
  const storedScope = useScopeStore((s) => s.scope);
  const setStoredScope = useScopeStore((s) => s.setScope);

  const urlScope = useMemo<LeagueScope | null>(() => {
    if (query.league) {
      const gender = genderOfLeagues([query.league], leagueConfigs) ?? DEFAULT_SCOPE.gender;
      return { gender, leagues: [query.league] };
    }
    if (query.gender || query.leagues?.length) {
      const leagues = query.leagues ?? [];
      const gender =
        query.gender ?? genderOfLeagues(leagues, leagueConfigs) ?? DEFAULT_SCOPE.gender;
      return { gender, leagues };
    }
    return null;
  }, [query.league, query.gender, query.leagues, leagueConfigs]);

  // Until the league list has loaded, unknown codes are kept rather than
  // dropped, so a shared ?leagues=PSL link isn't lost on first render.
  const scope = useMemo(() => {
    const raw = urlScope ?? storedScope;
    return isFetched ? sanitizeScope(raw, leagueConfigs) : raw;
  }, [urlScope, storedScope, isFetched, leagueConfigs]);

  const writeScope = useCallback(
    (next: LeagueScope) => {
      setStoredScope(next);
      void setQuery(
        isDefaultScope(next)
          ? { gender: null, leagues: null, league: null }
          : {
              gender: next.gender,
              leagues: next.leagues.length > 0 ? next.leagues : null,
              league: null,
            },
      );
    },
    [setQuery, setStoredScope],
  );

  // Load the visit's scope from sessionStorage. This must run before the
  // effects below read or write the store; sessionStorage is synchronous.
  useEffect(() => {
    void useScopeStore.persist.rehydrate();
  }, []);

  // Rewrite legacy ?league=X links to the new parameters.
  useEffect(() => {
    if (query.league && urlScope) {
      writeScope(urlScope);
    }
  }, [query.league, urlScope, writeScope]);

  // Keep the visit's scope when the URL carries one (shared links, back/forward).
  useEffect(() => {
    if (urlScope && !query.league) {
      setStoredScope(urlScope);
    }
  }, [urlScope, query.league, setStoredScope]);

  // Navigation drops the query string: put the visit's scope back in the URL
  // so the page can be shared as is.
  useEffect(() => {
    if (!urlScope && !isDefaultScope(storedScope)) {
      writeScope(storedScope);
    }
  }, [urlScope, storedScope, writeScope]);

  // Once: carry over a league chosen in the old picker.
  useEffect(() => {
    const legacy = readLegacyStoredLeague();
    if (legacy && !urlScope) {
      const gender = genderOfLeagues([legacy], FALLBACK_LEAGUE_CONFIGS) ?? DEFAULT_SCOPE.gender;
      writeScope({ gender, leagues: [legacy] });
    }
    // Runs on mount only: it reads and deletes the old key.
  }, []);

  const setGender = useCallback(
    (gender: Gender) => writeScope({ gender, leagues: [] }),
    [writeScope],
  );

  const setLeagues = useCallback(
    (leagues: League[]) => {
      const gender = genderOfLeagues(leagues, leagueConfigs) ?? scope.gender;
      writeScope({ gender, leagues: [...new Set(leagues)].sort() });
    },
    [leagueConfigs, scope.gender, writeScope],
  );

  const leaguesFor = useCallback(
    (gender: Gender) =>
      Object.values(leagueConfigs)
        .filter((config) => config.gender === gender)
        .sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [leagueConfigs],
  );

  const contextValue = useMemo<LeagueContextType>(
    () => ({
      scope,
      scopeKey: scopeKey(scope),
      scopeLabel: scopeLabel(scope),
      scopeDescription: scopeDescription(scope),
      singleLeague: scope.leagues.length === 1 ? scope.leagues[0] : null,
      setGender,
      setLeagues,
      leagueConfigs,
      leaguesFor,
    }),
    [scope, setGender, setLeagues, leagueConfigs, leaguesFor],
  );

  return <LeagueContext.Provider value={contextValue}>{children}</LeagueContext.Provider>;
};

export const useLeagueContext = (): LeagueContextType => {
  const context = useContext(LeagueContext);
  if (context === undefined) {
    throw new Error('useLeagueContext must be used within a LeagueProvider');
  }
  return context;
};
