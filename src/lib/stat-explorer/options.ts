import { CACHE_TTL, getCached } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import type { StatExplorerReportType } from './contracts';
import { ALLOWED_DIMENSIONS, ALLOWED_METRICS } from './registry';

export async function getFilterOptions(league: string, reportType: StatExplorerReportType) {
  // Cache filter options for 5 minutes — these change only when new match data is ingested.
  // The teams query was scanning the entire wpl_delivery table; now it uses wpl_team instead.
  return getCached(`stat-explorer-options:${league}:${reportType}`, CACHE_TTL.SHORT, async () => {
    const [teams, seasons, venues, cities, tossWinners] = await Promise.all([
      // Use wpl_team (small table) instead of scanning wpl_delivery (huge table)
      prisma.$queryRaw<Array<{ team: string }>>`
        SELECT DISTINCT
          CASE
            WHEN t.team_name = 'Royal Challengers Bengaluru' THEN 'Royal Challengers Bangalore'
            WHEN t.team_name = 'Delhi Daredevils' THEN 'Delhi Capitals'
            WHEN t.team_name = 'Kings XI Punjab' THEN 'Punjab Kings'
            WHEN t.team_name = 'Rising Pune Supergiants' THEN 'Rising Pune Supergiant'
            ELSE t.team_name
          END AS team
        FROM wpl_team t
        JOIN wpl_match_info mi ON t.match_id = mi.match_id
        WHERE mi.league = ${league}
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
    };
  });
}
