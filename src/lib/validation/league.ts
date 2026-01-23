export const VALID_LEAGUES = ['WPL', 'IPL', 'BBL', 'WBBL', 'SA20'] as const;
export type League = (typeof VALID_LEAGUES)[number];

export function validateLeague(league: string | null): League {
  if (!league) {
    return 'WPL';
  }
  if (VALID_LEAGUES.includes(league as League)) {
    return league as League;
  }

  throw new Error(`Invalid league: ${league}. Valid leagues are: ${VALID_LEAGUES.join(', ')}`);
}
