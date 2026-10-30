import { Gender, League, LeagueConfig, LeagueScope } from '@/types/league';

export const DEFAULT_SCOPE: LeagueScope = { gender: 'male', leagues: [] };

const genderWord: Record<Gender, string> = { male: "men's", female: "women's" };

export const isDefaultScope = (scope: LeagueScope): boolean =>
  scope.gender === DEFAULT_SCOPE.gender && scope.leagues.length === 0;

// sanitizeScope keeps only known leagues of the scope's gender, deduplicated
// and sorted, so equal scopes always produce the same key.
export const sanitizeScope = (
  scope: LeagueScope,
  configs: Record<League, LeagueConfig>,
): LeagueScope => {
  const leagues = [...new Set(scope.leagues)]
    .filter((code) => configs[code]?.gender === scope.gender)
    .sort();
  return { gender: scope.gender, leagues };
};

export const scopeKey = (scope: LeagueScope): string =>
  scope.leagues.length > 0 ? `${scope.gender}:${scope.leagues.join(',')}` : scope.gender;

// scopeParams are the API query parameters for a scope.
export const scopeParams = (scope: LeagueScope): Record<string, string> =>
  scope.leagues.length > 0 ? { leagues: scope.leagues.join(',') } : { gender: scope.gender };

const joinWithAnd = (items: string[]): string =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;

export const scopeLabel = (scope: LeagueScope): string => {
  const count = scope.leagues.length;
  if (count === 0) {
    return `All ${genderWord[scope.gender]} leagues`;
  }
  if (count <= 3) {
    return scope.leagues.join(', ');
  }
  return `${count} ${genderWord[scope.gender]} leagues`;
};

export const scopeDescription = (scope: LeagueScope): string => {
  const count = scope.leagues.length;
  if (count === 0) {
    return `all ${genderWord[scope.gender]} leagues`;
  }
  if (count <= 3) {
    return `the ${joinWithAnd(scope.leagues)}`;
  }
  return `${count} ${genderWord[scope.gender]} leagues`;
};

// genderOfLeagues returns the gender of the first known league, used to read
// links such as ?league=WPL that carry no gender.
export const genderOfLeagues = (
  leagues: League[],
  configs: Record<League, LeagueConfig>,
): Gender | undefined => leagues.map((code) => configs[code]?.gender).find(Boolean);

// scopeSearchParams are this app's own URL parameters for a scope, for links
// that should open with it (the default scope needs none).
export const scopeSearchParams = (scope: LeagueScope): URLSearchParams => {
  const params = new URLSearchParams();
  if (!isDefaultScope(scope)) {
    params.set('gender', scope.gender);
  }
  if (scope.leagues.length > 0) {
    params.set('leagues', scope.leagues.join(','));
  }
  return params;
};
