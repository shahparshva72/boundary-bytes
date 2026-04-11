import { prisma } from '@/lib/prisma';
import { STANDARDIZED_BATTING_TEAM_SQL } from '@/lib/team-standardization';
import type { StatExplorerReportType } from './contracts';
import { ALLOWED_DIMENSIONS, ALLOWED_METRICS } from './registry';

export async function getFilterOptions(league: string, reportType: StatExplorerReportType) {
  const [teams, seasons, venues, cities, tossWinners] = await Promise.all([
    prisma.$queryRaw<Array<{ team: string }>>`
      SELECT DISTINCT ${STANDARDIZED_BATTING_TEAM_SQL} AS team
      FROM wpl_delivery d
      JOIN wpl_match m ON d.match_id = m.match_id
      WHERE m.league = ${league}
      ORDER BY team
    `,
    prisma.$queryRaw<Array<{ season: string }>>`
      SELECT DISTINCT season
      FROM wpl_match
      WHERE league = ${league}
      ORDER BY season DESC
    `,
    prisma.$queryRaw<Array<{ venue: string }>>`
      SELECT DISTINCT venue
      FROM wpl_match
      WHERE league = ${league}
      ORDER BY venue
    `,
    prisma.$queryRaw<Array<{ city: string }>>`
      SELECT DISTINCT city
      FROM wpl_match_info
      WHERE league = ${league}
      ORDER BY city
    `,
    prisma.$queryRaw<Array<{ tossWinner: string }>>`
      SELECT DISTINCT toss_winner AS "tossWinner"
      FROM wpl_match_info
      WHERE league = ${league}
      ORDER BY toss_winner
    `,
  ]);

  return {
    teams: teams.map((r) => r.team),
    opposition: teams.map((r) => r.team),
    seasons: seasons.map((r) => r.season),
    venues: venues.map((r) => r.venue),
    cities: cities.map((r) => r.city),
    tossWinners: tossWinners.map((r) => r.tossWinner),
    tossDecisions: ['bat', 'field'] as const,
    innings: [1, 2] as const,
    availableMetrics: ALLOWED_METRICS[reportType],
    availableDimensions: ALLOWED_DIMENSIONS[reportType],
    // Player style filter options (static enums from ESPNcricinfo data)
    battingHands: ['right', 'left'],
    bowlingTypes: ['pace', 'spin'],
    bowlingSubTypes: [
      'fast',
      'fast-medium',
      'medium-fast',
      'medium',
      'offbreak',
      'legbreak',
      'left-arm-orthodox',
      'left-arm-wrist-spin',
      'slow',
    ],
    playingRoles: ['batter', 'bowler', 'allrounder', 'wicketkeeper'],
    playingRoleDetails: [
      'opening_batter',
      'top_order_batter',
      'middle_order_batter',
      'batter',
      'batting_allrounder',
      'bowling_allrounder',
      'allrounder',
      'bowler',
      'wicketkeeper_batter',
      'wicketkeeper',
    ],
  };
}
