import type { League } from '@/types/league';
import type { StatCategory, StatMetric } from './types';

export function getMetricLabel(metric: StatMetric, category: StatCategory, league: League): string {
  const leagueName = league;
  const labels: Record<StatMetric, string> = {
    runs: `Who has scored more runs in ${leagueName}?`,
    strikeRate: `Who has the higher strike rate in ${leagueName}?`,
    sixes: `Who has hit more sixes in ${leagueName}?`,
    fours: `Who has hit more fours in ${leagueName}?`,
    wickets: `Who has taken more wickets in ${leagueName}?`,
    economy: `Who has the better economy rate in ${leagueName}?`,
  };
  void category;
  return labels[metric];
}

export function formatStatValue(metric: StatMetric, value: number): string {
  if (metric === 'strikeRate' || metric === 'economy') {
    return value.toFixed(2);
  }
  return String(value);
}

export function getStatsTabLink(category: StatCategory): string {
  const tab = category === 'batting' ? 'Run Scorers' : 'Wicket Takers';
  return `/stats?tab=${encodeURIComponent(tab)}`;
}

export function getMatchupLink(batter: string, bowler: string): string {
  const params = new URLSearchParams({
    tab: 'Batter vs Bowler',
    batter,
    bowler,
  });
  return `/stats?${params.toString()}`;
}
