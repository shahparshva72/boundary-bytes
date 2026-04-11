import { Prisma } from '@/generated/prisma/client';
import { STANDARDIZED_BATTING_TEAM_SQL } from '@/lib/team-standardization';
import type {
  StatExplorerDimension,
  StatExplorerMetric,
  StatExplorerReportType,
  StatExplorerRunRequest,
} from './contracts';
import { ALLOWED_DIMENSIONS, ALLOWED_METRICS, PHASE_OVER_RANGES } from './registry';

function standardizeTeam(team: string): string {
  const map: Record<string, string> = {
    'Royal Challengers Bengaluru': 'Royal Challengers Bangalore',
    'Delhi Daredevils': 'Delhi Capitals',
    'Kings XI Punjab': 'Punjab Kings',
    'Rising Pune Supergiants': 'Rising Pune Supergiant',
  };
  return map[team] || team;
}

const NON_SORTABLE_COLUMN_KEYS = new Set(['player', 'team']);

function buildOrderByClause(
  sort: StatExplorerRunRequest['sort'],
  allowedSortColumns: string[],
  defaultOrderBy: Prisma.Sql,
): Prisma.Sql {
  if (!sort) {
    return defaultOrderBy;
  }

  const normalizedSortKey = sort.key.toLowerCase();
  if (NON_SORTABLE_COLUMN_KEYS.has(normalizedSortKey)) {
    return defaultOrderBy;
  }

  let matchedSortKey: string | null = null;
  for (const column of allowedSortColumns) {
    if (column.toLowerCase() === normalizedSortKey) {
      matchedSortKey = column;
      break;
    }
  }

  if (!matchedSortKey) {
    return defaultOrderBy;
  }

  return Prisma.sql`ORDER BY ${Prisma.raw(matchedSortKey)} ${Prisma.raw(sort.direction === 'asc' ? 'ASC' : 'DESC')}`;
}

function buildWhereClause(
  reportType: StatExplorerReportType,
  filters: StatExplorerRunRequest['filters'],
  league: string,
): Prisma.Sql {
  const conditions: Prisma.Sql[] = [Prisma.sql`m.league = ${league}`];

  conditions.push(Prisma.sql`d.innings <= 2`);

  if (filters.teams && filters.teams.length > 0) {
    const stdTeams = filters.teams.map(standardizeTeam);
    if (reportType === 'bowling') {
      conditions.push(Prisma.sql`d.bowling_team = ANY(${stdTeams}::text[])`);
    } else {
      conditions.push(Prisma.sql`${STANDARDIZED_BATTING_TEAM_SQL} = ANY(${stdTeams}::text[])`);
    }
  }

  if (filters.opposition && filters.opposition.length > 0) {
    const stdOpp = filters.opposition.map(standardizeTeam);
    if (reportType === 'bowling') {
      conditions.push(Prisma.sql`${STANDARDIZED_BATTING_TEAM_SQL} = ANY(${stdOpp}::text[])`);
    } else {
      conditions.push(Prisma.sql`d.bowling_team = ANY(${stdOpp}::text[])`);
    }
  }

  if (filters.seasons && filters.seasons.length > 0) {
    conditions.push(Prisma.sql`m.season = ANY(${filters.seasons}::text[])`);
  }

  if (filters.dateFrom) {
    conditions.push(Prisma.sql`m.start_date >= ${new Date(filters.dateFrom)}`);
  }

  if (filters.dateTo) {
    conditions.push(Prisma.sql`m.start_date <= ${new Date(filters.dateTo)}`);
  }

  if (filters.venues && filters.venues.length > 0) {
    conditions.push(Prisma.sql`m.venue = ANY(${filters.venues}::text[])`);
  }

  if (filters.cities && filters.cities.length > 0) {
    conditions.push(Prisma.sql`mi.city = ANY(${filters.cities}::text[])`);
  }

  if (filters.tossWinners && filters.tossWinners.length > 0) {
    const stdTW = filters.tossWinners.map(standardizeTeam);
    conditions.push(Prisma.sql`mi.toss_winner = ANY(${stdTW}::text[])`);
  }

  if (filters.tossDecisions && filters.tossDecisions.length > 0) {
    conditions.push(Prisma.sql`mi.toss_decision = ANY(${filters.tossDecisions}::text[])`);
  }

  if (filters.innings && filters.innings.length > 0) {
    conditions.push(Prisma.sql`d.innings = ANY(${filters.innings}::int[])`);
  }

  if (filters.overFrom !== undefined && filters.overTo !== undefined) {
    conditions.push(
      Prisma.sql`CAST(SPLIT_PART(d.ball, '.', 1) AS int) BETWEEN ${filters.overFrom} AND ${filters.overTo}`,
    );
  } else if (filters.overFrom !== undefined) {
    conditions.push(Prisma.sql`CAST(SPLIT_PART(d.ball, '.', 1) AS int) >= ${filters.overFrom}`);
  } else if (filters.overTo !== undefined) {
    conditions.push(Prisma.sql`CAST(SPLIT_PART(d.ball, '.', 1) AS int) <= ${filters.overTo}`);
  }

  if (filters.phase && filters.phase !== 'overall') {
    const [from, to] = PHASE_OVER_RANGES[filters.phase];
    conditions.push(Prisma.sql`CAST(SPLIT_PART(d.ball, '.', 1) AS int) BETWEEN ${from} AND ${to}`);
  }

  if (filters.resultFilter) {
    const teamSql =
      reportType === 'bowling'
        ? Prisma.sql`d.bowling_team`
        : Prisma.sql`${STANDARDIZED_BATTING_TEAM_SQL}`;

    if (filters.resultFilter === 'won') {
      conditions.push(Prisma.sql`mi.winner IS NOT NULL AND ${teamSql} = mi.winner`);
    } else if (filters.resultFilter === 'lost') {
      conditions.push(Prisma.sql`mi.winner IS NOT NULL AND ${teamSql} != mi.winner`);
    } else if (filters.resultFilter === 'noresult') {
      conditions.push(Prisma.sql`mi.winner IS NULL`);
    }
  }

  if (conditions.length === 0) {
    return Prisma.sql`1=1`;
  }

  let result = conditions[0];
  for (let i = 1; i < conditions.length; i++) {
    result = Prisma.sql`${result} AND ${conditions[i]}`;
  }
  return result;
}

function metricToSql(metric: StatExplorerMetric, isBowling: boolean): string {
  if (isBowling) {
    const map: Record<string, string> = {
      wickets: 'SUM(stats.wickets)',
      ballsBowled: 'SUM(stats.balls_bowled)',
      runsConceded: 'SUM(stats.runs_conceded)',
      innings: 'COUNT(stats.match_id)',
      economyRate:
        'CASE WHEN SUM(stats.balls_bowled) > 0 THEN ROUND((SUM(stats.runs_conceded)::numeric / (SUM(stats.balls_bowled)::numeric / 6)), 2) ELSE 0 END',
      bowlingAverage:
        'CASE WHEN SUM(stats.wickets) > 0 THEN ROUND(SUM(stats.runs_conceded)::numeric / SUM(stats.wickets), 2) ELSE 0 END',
      bowlingStrikeRate:
        'CASE WHEN SUM(stats.wickets) > 0 THEN ROUND(SUM(stats.balls_bowled)::numeric / SUM(stats.wickets), 2) ELSE 0 END',
      fourWickets: 'COUNT(*) FILTER (WHERE stats.wickets >= 4 AND stats.wickets < 5)',
      fiveWickets: 'COUNT(*) FILTER (WHERE stats.wickets >= 5)',
      dotBalls: 'SUM(stats.dot_balls)',
      matchesPlayed: 'COUNT(DISTINCT stats.match_id)',
      matches: 'COUNT(DISTINCT stats.match_id)',
    };
    return map[metric as string] || '0';
  } else {
    const map: Record<string, string> = {
      runs: 'SUM(stats.runs)',
      ballsFaced: 'SUM(stats.balls_faced)',
      innings: 'COUNT(stats.match_id)',
      notOuts: 'SUM(1 - stats.is_dismissed)',
      highestScore: 'MAX(stats.runs)',
      fours: 'SUM(stats.fours)',
      sixes: 'SUM(stats.sixes)',
      fifties: 'COUNT(*) FILTER (WHERE stats.runs >= 50 AND stats.runs < 100)',
      hundreds: 'COUNT(*) FILTER (WHERE stats.runs >= 100)',
      strikeRate:
        'CASE WHEN SUM(stats.balls_faced) > 0 THEN ROUND((SUM(stats.runs)::numeric / SUM(stats.balls_faced)) * 100, 2) ELSE 0 END',
      average:
        'CASE WHEN SUM(stats.is_dismissed) > 0 THEN ROUND(SUM(stats.runs)::numeric / SUM(stats.is_dismissed), 2) ELSE SUM(stats.runs)::numeric END',
      dismissals: 'SUM(stats.is_dismissed)',
      dotBalls: 'SUM(stats.dot_balls)',
      matchesPlayed: 'COUNT(DISTINCT stats.match_id)',
      matches: 'COUNT(DISTINCT stats.match_id)',
    };
    return map[metric as string] || '0';
  }
}

export function buildStatExplorerQuery(
  request: StatExplorerRunRequest,
  league: string,
): { sql: Prisma.Sql; countSql: Prisma.Sql } {
  const { reportType, dimensions, metrics, filters, sort, pagination } = request;
  const offset = (pagination.page - 1) * pagination.pageSize;

  if (dimensions.length === 0 || metrics.length === 0) {
    throw new Error('At least one dimension and one metric are required');
  }

  if (reportType === 'team') {
    return buildTeamReportQuery(dimensions, metrics, filters, sort, pagination, offset, league);
  }

  if (reportType === 'match') {
    return buildMatchReportQuery(dimensions, metrics, filters, sort, pagination, offset, league);
  }

  return buildBattingBowlingQuery(
    reportType,
    dimensions,
    metrics,
    filters,
    sort,
    pagination,
    offset,
    league,
  );
}

function buildBattingBowlingQuery(
  reportType: StatExplorerReportType,
  dimensions: StatExplorerDimension[],
  metrics: StatExplorerMetric[],
  filters: StatExplorerRunRequest['filters'],
  sort: StatExplorerRunRequest['sort'],
  pagination: StatExplorerRunRequest['pagination'],
  offset: number,
  league: string,
): { sql: Prisma.Sql; countSql: Prisma.Sql } {
  const isBowling = reportType === 'bowling';
  const whereClause = buildWhereClause(reportType, filters, league);

  const groupByParts: string[] = [];
  for (const dim of dimensions) {
    switch (dim) {
      case 'season':
        groupByParts.push('stats.season');
        break;
      case 'player':
        groupByParts.push('stats.player');
        break;
      case 'team':
        groupByParts.push('stats.team');
        break;
      case 'opposition':
        groupByParts.push('stats.opposition');
        break;
      case 'venue':
        groupByParts.push('stats.venue');
        break;
      case 'city':
        groupByParts.push('stats.city');
        break;
      case 'tossWinner':
        groupByParts.push('stats.toss_winner');
        break;
      case 'tossDecision':
        groupByParts.push('stats.toss_decision');
        break;
      case 'result':
        groupByParts.push('stats.match_winner');
        break;
      case 'date':
        groupByParts.push('stats.start_date::date');
        break;
      case 'innings':
        groupByParts.push('stats.innings');
        break;
      case 'battingHand':
        groupByParts.push('stats.batting_hand');
        break;
      case 'bowlingType':
        groupByParts.push('stats.bowling_type');
        break;
      case 'bowlingSubType':
        groupByParts.push('stats.bowling_sub_type');
        break;
      case 'playingRole':
        groupByParts.push('stats.playing_role');
        break;
    }
  }

  const selectDimParts: Prisma.Sql[] = [];
  const dimensionSortColumns: string[] = [];
  for (const dim of dimensions) {
    switch (dim) {
      case 'season':
        selectDimParts.push(Prisma.sql`stats.season AS season`);
        dimensionSortColumns.push('season');
        break;
      case 'player':
        selectDimParts.push(Prisma.sql`stats.player AS player`);
        dimensionSortColumns.push('player');
        break;
      case 'team':
        selectDimParts.push(Prisma.sql`stats.team AS team`);
        dimensionSortColumns.push('team');
        break;
      case 'opposition':
        selectDimParts.push(Prisma.sql`stats.opposition AS opposition`);
        dimensionSortColumns.push('opposition');
        break;
      case 'venue':
        selectDimParts.push(Prisma.sql`stats.venue AS venue`);
        dimensionSortColumns.push('venue');
        break;
      case 'city':
        selectDimParts.push(Prisma.sql`stats.city AS city`);
        dimensionSortColumns.push('city');
        break;
      case 'tossWinner':
        selectDimParts.push(Prisma.sql`stats.toss_winner AS tossWinner`);
        dimensionSortColumns.push('tossWinner');
        break;
      case 'tossDecision':
        selectDimParts.push(Prisma.sql`stats.toss_decision AS tossDecision`);
        dimensionSortColumns.push('tossDecision');
        break;
      case 'result':
        selectDimParts.push(Prisma.sql`stats.match_winner AS result`);
        dimensionSortColumns.push('result');
        break;
      case 'date':
        selectDimParts.push(Prisma.sql`stats.start_date::date AS date_col`);
        dimensionSortColumns.push('date_col');
        break;
      case 'innings':
        selectDimParts.push(Prisma.sql`stats.innings AS innings`);
        dimensionSortColumns.push('innings');
        break;
      case 'battingHand':
        selectDimParts.push(Prisma.sql`stats.batting_hand AS "battingHand"`);
        dimensionSortColumns.push('"battingHand"');
        break;
      case 'bowlingType':
        selectDimParts.push(Prisma.sql`stats.bowling_type AS "bowlingType"`);
        dimensionSortColumns.push('"bowlingType"');
        break;
      case 'bowlingSubType':
        selectDimParts.push(Prisma.sql`stats.bowling_sub_type AS "bowlingSubType"`);
        dimensionSortColumns.push('"bowlingSubType"');
        break;
      case 'playingRole':
        selectDimParts.push(Prisma.sql`stats.playing_role AS "playingRole"`);
        dimensionSortColumns.push('"playingRole"');
        break;
    }
  }

  const selectMetricParts: Prisma.Sql[] = metrics.map((m) => {
    const expr = metricToSql(m, isBowling);
    return Prisma.sql`${Prisma.raw(expr)} AS ${Prisma.raw(m)}`;
  });

  const allSelectParts = [...selectDimParts, ...selectMetricParts];

  let groupByClause: Prisma.Sql;
  if (groupByParts.length > 0) {
    groupByClause = Prisma.sql`GROUP BY ${Prisma.raw(groupByParts.join(', '))}`;
  } else {
    groupByClause = Prisma.sql``;
  }

  const allowedSortColumns = [...dimensionSortColumns, ...metrics];
  const defaultOrderBy = Prisma.sql`ORDER BY ${Prisma.raw(metrics[0])} DESC`;
  const orderBy = buildOrderByClause(sort, allowedSortColumns, defaultOrderBy);

  const selectClause = allSelectParts.reduce((acc, part, i) => {
    if (i === 0) {
      return part;
    }
    return Prisma.sql`${acc},\n${part}`;
  }, allSelectParts[0] as Prisma.Sql);

  // Determine if player style join is needed.
  // Player style dimensions/filters applied to the "primary" player:
  //   - batting report: style of the striker (batter)
  //   - bowling report: style of the bowler
  const PLAYER_STYLE_DIMS = new Set<string>([
    'battingHand',
    'bowlingType',
    'bowlingSubType',
    'playingRole',
  ]);
  const hasStyleDim = dimensions.some((d) => PLAYER_STYLE_DIMS.has(d));
  const hasStyleFilter = !!(
    filters.battingHand ||
    filters.bowlingType ||
    filters.bowlingSubType ||
    filters.playingRole ||
    filters.playingRoleDetail
  );
  const needsPlayerStyle = hasStyleDim || hasStyleFilter;

  // Build the player_style_lookup CTE that deduplicates person_name → style attributes
  // via wpl_person_registry.registry_id = player_style.identifier
  const playerStyleLookupCTE = needsPlayerStyle
    ? Prisma.sql`
        player_style_lookup AS (
          SELECT DISTINCT ON (pr.person_name)
            pr.person_name,
            ps.batting_hand,
            ps.bowling_hand,
            ps.bowling_type,
            ps.bowling_sub_type,
            ps.playing_role,
            ps.playing_role_detail
          FROM wpl_person_registry pr
          JOIN player_style ps ON ps.identifier = pr.registry_id
          ORDER BY pr.person_name
        ),
      `
    : Prisma.sql``;

  // Build player style WHERE conditions for inside delivery CTEs
  const playerStyleConditions: Prisma.Sql[] = [];
  if (filters.battingHand) {
    playerStyleConditions.push(Prisma.sql`psl.batting_hand = ${filters.battingHand}`);
  }
  if (filters.bowlingType) {
    playerStyleConditions.push(Prisma.sql`psl.bowling_type = ${filters.bowlingType}`);
  }
  if (filters.bowlingSubType && filters.bowlingSubType.length > 0) {
    playerStyleConditions.push(
      Prisma.sql`psl.bowling_sub_type = ANY(${filters.bowlingSubType}::text[])`,
    );
  }
  if (filters.playingRole) {
    playerStyleConditions.push(Prisma.sql`psl.playing_role = ${filters.playingRole}`);
  }
  if (filters.playingRoleDetail) {
    playerStyleConditions.push(Prisma.sql`psl.playing_role_detail = ${filters.playingRoleDetail}`);
  }
  const playerStyleWhereClause =
    playerStyleConditions.length > 0
      ? playerStyleConditions.reduce((acc, cond) => Prisma.sql`${acc} AND ${cond}`)
      : Prisma.sql``;
  const playerStyleFilterSql =
    playerStyleConditions.length > 0 ? Prisma.sql`AND ${playerStyleWhereClause}` : Prisma.sql``;

  // The player style JOIN target column depends on report type:
  //   batting → join on d.striker (batter's style)
  //   bowling → join on d.bowler (bowler's style)
  const playerStyleJoinSql = needsPlayerStyle
    ? isBowling
      ? Prisma.sql`LEFT JOIN player_style_lookup psl ON psl.person_name = d.bowler`
      : Prisma.sql`LEFT JOIN player_style_lookup psl ON psl.person_name = d.striker`
    : Prisma.sql``;

  // Player style columns to select in the inner CTEs
  const playerStyleSelectSql = needsPlayerStyle
    ? Prisma.sql`,
            MAX(psl.batting_hand) AS batting_hand,
            MAX(psl.bowling_type) AS bowling_type,
            MAX(psl.bowling_sub_type) AS bowling_sub_type,
            MAX(psl.playing_role) AS playing_role`
    : Prisma.sql``;

  const statsCTE = isBowling
    ? Prisma.sql`
        stats AS (
          SELECT
            d.match_id,
            d.innings,
            d.bowler AS player,
            MAX(m.season) AS season,
            MAX(m.start_date) AS start_date,
            MAX(m.venue) AS venue,
            MAX(mi.city) AS city,
            MAX(mi.toss_winner) AS toss_winner,
            MAX(mi.toss_decision) AS toss_decision,
            MAX(mi.winner) AS match_winner,
            MAX(d.bowling_team) AS team,
            MAX(${STANDARDIZED_BATTING_TEAM_SQL}) AS opposition,
            COUNT(*) FILTER (WHERE d.player_dismissed IS NOT NULL AND d.wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket')) AS wickets,
            COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0) AS balls_bowled,
            SUM(d.runs_off_bat + d.wides + d.noballs) AS runs_conceded,
            COUNT(*) FILTER (WHERE d.runs_off_bat = 0 AND d.wides = 0 AND d.noballs = 0) AS dot_balls
            ${playerStyleSelectSql}
          FROM wpl_delivery d
          JOIN wpl_match m ON d.match_id = m.match_id
          LEFT JOIN wpl_match_info mi ON m.match_id = mi.match_id
          ${playerStyleJoinSql}
          WHERE ${whereClause}
            ${playerStyleFilterSql}
          GROUP BY d.match_id, d.innings, d.bowler
        )
      `
    : Prisma.sql`
        batter_stats AS (
          SELECT
            d.match_id,
            d.innings,
            d.striker AS player,
            MAX(m.season) AS season,
            MAX(m.start_date) AS start_date,
            MAX(m.venue) AS venue,
            MAX(mi.city) AS city,
            MAX(mi.toss_winner) AS toss_winner,
            MAX(mi.toss_decision) AS toss_decision,
            MAX(mi.winner) AS match_winner,
            MAX(${STANDARDIZED_BATTING_TEAM_SQL}) AS team,
            MAX(d.bowling_team) AS opposition,
            SUM(d.runs_off_bat) AS runs,
            COUNT(*) FILTER (WHERE d.wides = 0) AS balls_faced,
            COUNT(*) FILTER (WHERE d.runs_off_bat = 4) AS fours,
            COUNT(*) FILTER (WHERE d.runs_off_bat = 6) AS sixes,
            COUNT(*) FILTER (WHERE d.runs_off_bat = 0 AND d.wides = 0 AND d.noballs = 0) AS dot_balls
            ${playerStyleSelectSql}
          FROM wpl_delivery d
          JOIN wpl_match m ON d.match_id = m.match_id
          LEFT JOIN wpl_match_info mi ON m.match_id = mi.match_id
          ${playerStyleJoinSql}
          WHERE ${whereClause}
            ${playerStyleFilterSql}
          GROUP BY d.match_id, d.innings, d.striker
        ),
        batter_dismissals AS (
          SELECT d.match_id, d.innings, d.player_dismissed AS player, 1 AS is_dismissed
          FROM wpl_delivery d
          JOIN wpl_match m ON d.match_id = m.match_id
          LEFT JOIN wpl_match_info mi ON m.match_id = mi.match_id
          WHERE ${whereClause}
            AND d.player_dismissed IS NOT NULL
            AND d.wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket', 'run out', 'retired out', 'obstructing the field', 'hit the ball twice', 'handled the ball', 'timed out')
        ),
        stats AS (
          SELECT
            bs.*,
            COALESCE(bd.is_dismissed, 0) AS is_dismissed
          FROM batter_stats bs
          LEFT JOIN batter_dismissals bd 
            ON bs.match_id = bd.match_id AND bs.innings = bd.innings AND bs.player = bd.player
        )
      `;

  const sql = Prisma.sql`
    WITH ${playerStyleLookupCTE}
    ${statsCTE}
    SELECT ${selectClause}
    FROM stats
    ${groupByClause}
    ${orderBy}
    LIMIT ${pagination.pageSize} OFFSET ${offset}
  `;

  const countSql = Prisma.sql`
    WITH ${playerStyleLookupCTE}
    ${statsCTE}
    SELECT COUNT(*)::int AS total
    FROM (
      SELECT 1
      FROM stats
      ${groupByClause}
    ) grouped
  `;

  return { sql, countSql };
}

function buildTeamReportQuery(
  dimensions: StatExplorerDimension[],
  metrics: StatExplorerMetric[],
  filters: StatExplorerRunRequest['filters'],
  sort: StatExplorerRunRequest['sort'],
  pagination: StatExplorerRunRequest['pagination'],
  offset: number,
  league: string,
): { sql: Prisma.Sql; countSql: Prisma.Sql } {
  const conditions: Prisma.Sql[] = [Prisma.sql`m.league = ${league}`];

  if (filters.seasons && filters.seasons.length > 0) {
    conditions.push(Prisma.sql`m.season = ANY(${filters.seasons}::text[])`);
  }
  if (filters.dateFrom) {
    conditions.push(Prisma.sql`m.start_date >= ${new Date(filters.dateFrom)}`);
  }
  if (filters.dateTo) {
    conditions.push(Prisma.sql`m.start_date <= ${new Date(filters.dateTo)}`);
  }
  if (filters.venues && filters.venues.length > 0) {
    conditions.push(Prisma.sql`m.venue = ANY(${filters.venues}::text[])`);
  }
  if (filters.cities && filters.cities.length > 0) {
    conditions.push(Prisma.sql`mi.city = ANY(${filters.cities}::text[])`);
  }

  const whereClause = conditions.reduce(
    (acc, cond, i) => (i === 0 ? cond : Prisma.sql`${acc} AND ${cond}`),
    Prisma.sql`1=1` as Prisma.Sql,
  );

  const teamDim = dimensions.includes('team');
  const seasonDim = dimensions.includes('season');
  const venueDim = dimensions.includes('venue');
  const cityDim = dimensions.includes('city');

  const groupByCols: string[] = [];
  if (teamDim) {
    groupByCols.push('std_team');
  }
  if (seasonDim) {
    groupByCols.push('m.season');
  }
  if (venueDim) {
    groupByCols.push('m.venue');
  }
  if (cityDim) {
    groupByCols.push('mi.city');
  }

  let groupByClause: Prisma.Sql;
  if (groupByCols.length > 0) {
    groupByClause = Prisma.sql`GROUP BY ${Prisma.raw(groupByCols.join(', '))}`;
  } else {
    groupByClause = Prisma.sql``;
  }

  const allowedSortColumns = [
    ...(teamDim ? ['team'] : []),
    ...(seasonDim ? ['season'] : []),
    ...(venueDim ? ['venue'] : []),
    ...(cityDim ? ['city'] : []),
    'matchesPlayed',
    'wins',
    'losses',
    'winPct',
    'winsBattingFirst',
    'winsBattingSecond',
  ];
  const defaultOrderBy = Prisma.sql`ORDER BY ${Prisma.raw(metrics[0])} DESC`;
  const orderBy = buildOrderByClause(sort, allowedSortColumns, defaultOrderBy);

  const teamSelect = teamDim ? Prisma.sql`t.std_team AS team,` : Prisma.sql``;
  const seasonSelect = seasonDim ? Prisma.sql`m.season AS season,` : Prisma.sql``;
  const venueSelect = venueDim ? Prisma.sql`m.venue AS venue,` : Prisma.sql``;
  const citySelect = cityDim ? Prisma.sql`mi.city AS city,` : Prisma.sql``;

  const sql = Prisma.sql`
    WITH delivery_std AS (
      SELECT
        d.*,
        CASE WHEN d.batting_team = 'Royal Challengers Bengaluru' THEN 'Royal Challengers Bangalore'
             WHEN d.batting_team = 'Delhi Daredevils' THEN 'Delhi Capitals'
             WHEN d.batting_team = 'Kings XI Punjab' THEN 'Punjab Kings'
             WHEN d.batting_team = 'Rising Pune Supergiants' THEN 'Rising Pune Supergiant'
             ELSE d.batting_team
        END AS std_team
      FROM wpl_delivery d
      JOIN wpl_match m ON d.match_id = m.match_id
      LEFT JOIN wpl_match_info mi ON m.match_id = mi.match_id
      WHERE ${whereClause} AND d.innings <= 2
    ),
    runs_per_innings AS (
      SELECT match_id, innings, std_team, SUM(runs_off_bat + extras) AS runs
      FROM delivery_std
      GROUP BY match_id, innings, std_team
    ),
    match_totals AS (
      SELECT r1.match_id, r1.std_team AS team1, r1.runs AS runs1, r2.std_team AS team2, r2.runs AS runs2
      FROM runs_per_innings r1
      JOIN runs_per_innings r2 ON r1.match_id = r2.match_id AND r1.innings = 1 AND r2.innings = 2
    ),
    winners AS (
      SELECT match_id,
        CASE WHEN runs1 > runs2 THEN team1 ELSE team2 END AS winner,
        CASE WHEN runs1 > runs2 THEN team2 ELSE team1 END AS loser,
        CASE WHEN runs1 > runs2 THEN 'batting_first' ELSE 'batting_second' END AS win_type
      FROM match_totals
    ),
    teams AS (
      SELECT match_id, team1 AS std_team FROM match_totals
      UNION ALL
      SELECT match_id, team2 AS std_team FROM match_totals
    )
    SELECT
      ${teamSelect}
      ${seasonSelect}
      ${venueSelect}
      ${citySelect}
      COUNT(DISTINCT t.match_id) AS matchesPlayed,
      COUNT(DISTINCT t.match_id) FILTER (WHERE t.std_team = w.winner) AS wins,
      COUNT(DISTINCT t.match_id) FILTER (WHERE t.std_team != w.winner AND w.winner IS NOT NULL) AS losses,
      CASE WHEN COUNT(DISTINCT t.match_id) FILTER (WHERE w.winner IS NOT NULL) > 0
           THEN ROUND((COUNT(DISTINCT t.match_id) FILTER (WHERE t.std_team = w.winner)::numeric / COUNT(DISTINCT t.match_id) FILTER (WHERE w.winner IS NOT NULL)) * 100, 2)
           ELSE 0 END AS winPct,
      COUNT(DISTINCT t.match_id) FILTER (WHERE t.std_team = w.winner AND w.win_type = 'batting_first') AS winsBattingFirst,
      COUNT(DISTINCT t.match_id) FILTER (WHERE t.std_team = w.winner AND w.win_type = 'batting_second') AS winsBattingSecond
    FROM teams t
    JOIN wpl_match m ON t.match_id = m.match_id
    LEFT JOIN wpl_match_info mi ON t.match_id = mi.match_id
    LEFT JOIN winners w ON t.match_id = w.match_id
    ${groupByClause}
    ${orderBy}
    LIMIT ${pagination.pageSize} OFFSET ${offset}
  `;

  const groupedTeamsSubquery =
    groupByCols.length > 0
      ? Prisma.sql`
          SELECT 1
          FROM teams t
          JOIN wpl_match m ON t.match_id = m.match_id
          LEFT JOIN wpl_match_info mi ON t.match_id = mi.match_id
          LEFT JOIN winners w ON t.match_id = w.match_id
          ${groupByClause}
        `
      : Prisma.sql`
          SELECT 1
          FROM teams t
          LEFT JOIN winners w ON t.match_id = w.match_id
        `;

  const countSql = Prisma.sql`
    WITH delivery_std AS (
      SELECT d.*
      FROM wpl_delivery d
      JOIN wpl_match m ON d.match_id = m.match_id
      LEFT JOIN wpl_match_info mi ON m.match_id = mi.match_id
      WHERE ${whereClause} AND d.innings <= 2
    ),
    runs_per_innings AS (
      SELECT match_id, innings, ${STANDARDIZED_BATTING_TEAM_SQL} AS std_team, SUM(runs_off_bat + extras) AS runs
      FROM delivery_std d
      GROUP BY match_id, innings, ${STANDARDIZED_BATTING_TEAM_SQL}
    ),
    match_totals AS (
      SELECT r1.match_id, r1.std_team AS team1, r1.runs AS runs1, r2.std_team AS team2, r2.runs AS runs2
      FROM runs_per_innings r1
      JOIN runs_per_innings r2 ON r1.match_id = r2.match_id AND r1.innings = 1 AND r2.innings = 2
    ),
    winners AS (
      SELECT match_id,
        CASE WHEN runs1 > runs2 THEN team1 ELSE team2 END AS winner,
        CASE WHEN runs1 > runs2 THEN team2 ELSE team1 END AS loser,
        CASE WHEN runs1 > runs2 THEN 'batting_first' ELSE 'batting_second' END AS win_type
      FROM match_totals
    ),
    teams AS (
      SELECT match_id, team1 AS std_team FROM match_totals
      UNION ALL
      SELECT match_id, team2 AS std_team FROM match_totals
    )
    SELECT COUNT(*)::int AS total
    FROM (${groupedTeamsSubquery}) grouped
  `;

  return { sql, countSql };
}

function buildMatchReportQuery(
  dimensions: StatExplorerDimension[],
  metrics: StatExplorerMetric[],
  filters: StatExplorerRunRequest['filters'],
  sort: StatExplorerRunRequest['sort'],
  pagination: StatExplorerRunRequest['pagination'],
  offset: number,
  league: string,
): { sql: Prisma.Sql; countSql: Prisma.Sql } {
  const conditions: Prisma.Sql[] = [Prisma.sql`m.league = ${league}`];

  if (filters.teams && filters.teams.length > 0) {
    conditions.push(
      Prisma.sql`(d.batting_team = ANY(${filters.teams}::text[]) OR d.bowling_team = ANY(${filters.teams}::text[]))`,
    );
  }
  if (filters.opposition && filters.opposition.length > 0) {
    conditions.push(
      Prisma.sql`(d.batting_team = ANY(${filters.opposition}::text[]) OR d.bowling_team = ANY(${filters.opposition}::text[]))`,
    );
  }
  if (filters.seasons && filters.seasons.length > 0) {
    conditions.push(Prisma.sql`m.season = ANY(${filters.seasons}::text[])`);
  }
  if (filters.dateFrom) {
    conditions.push(Prisma.sql`m.start_date >= ${new Date(filters.dateFrom)}`);
  }
  if (filters.dateTo) {
    conditions.push(Prisma.sql`m.start_date <= ${new Date(filters.dateTo)}`);
  }
  if (filters.venues && filters.venues.length > 0) {
    conditions.push(Prisma.sql`m.venue = ANY(${filters.venues}::text[])`);
  }
  if (filters.cities && filters.cities.length > 0) {
    conditions.push(Prisma.sql`mi.city = ANY(${filters.cities}::text[])`);
  }
  if (filters.tossWinners && filters.tossWinners.length > 0) {
    conditions.push(Prisma.sql`mi.toss_winner = ANY(${filters.tossWinners}::text[])`);
  }
  if (filters.tossDecisions && filters.tossDecisions.length > 0) {
    conditions.push(Prisma.sql`mi.toss_decision = ANY(${filters.tossDecisions}::text[])`);
  }
  if (filters.resultFilter) {
    if (filters.resultFilter === 'won') {
      conditions.push(
        Prisma.sql`mi.winner IS NOT NULL AND mi.winner = ${STANDARDIZED_BATTING_TEAM_SQL}`,
      );
    } else if (filters.resultFilter === 'lost') {
      conditions.push(
        Prisma.sql`mi.winner IS NOT NULL AND mi.winner != ${STANDARDIZED_BATTING_TEAM_SQL}`,
      );
    } else if (filters.resultFilter === 'noresult') {
      conditions.push(Prisma.sql`mi.winner IS NULL`);
    }
  }

  const whereClause = conditions.reduce(
    (acc, cond, i) => (i === 0 ? cond : Prisma.sql`${acc} AND ${cond}`),
    Prisma.sql`1=1` as Prisma.Sql,
  );

  const groupByCols: string[] = ['m.match_id'];
  for (const dim of dimensions) {
    if (dim === 'team') {
      groupByCols.push('d.batting_team');
    } else if (dim === 'season') {
      groupByCols.push('m.season');
    } else if (dim === 'venue') {
      groupByCols.push('m.venue');
    } else if (dim === 'city') {
      groupByCols.push('mi.city');
    } else if (dim === 'tossWinner') {
      groupByCols.push('mi.toss_winner');
    } else if (dim === 'tossDecision') {
      groupByCols.push('mi.toss_decision');
    } else if (dim === 'result') {
      groupByCols.push('mi.winner');
    } else if (dim === 'innings') {
      groupByCols.push('d.innings');
    }
  }

  const selectCols: Prisma.Sql[] = [
    Prisma.sql`m.match_id, m.season, m.start_date::date, m.venue, mi.city, mi.toss_winner, mi.toss_decision, mi.winner`,
  ];

  for (const metric of metrics) {
    switch (metric) {
      case 'matches':
        selectCols.push(Prisma.sql`COUNT(DISTINCT m.match_id) AS matches`);
        break;
      case 'runs':
        selectCols.push(Prisma.sql`SUM(d.runs_off_bat) AS runs`);
        break;
      case 'wickets':
        selectCols.push(
          Prisma.sql`COUNT(*) FILTER (WHERE d.player_dismissed IS NOT NULL) AS wickets`,
        );
        break;
      case 'ballsFaced':
        selectCols.push(Prisma.sql`COUNT(*) FILTER (WHERE d.wides = 0) AS ballsFaced`);
        break;
      case 'ballsBowled':
        selectCols.push(
          Prisma.sql`COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0) AS ballsBowled`,
        );
        break;
      case 'economyRate':
        selectCols.push(
          Prisma.sql`CASE WHEN COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0) > 0 THEN ROUND((SUM(d.runs_off_bat + d.wides + d.noballs)::numeric / (COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0)::numeric / 6)), 2) ELSE 0 END AS economyRate`,
        );
        break;
      case 'strikeRate':
        selectCols.push(
          Prisma.sql`CASE WHEN COUNT(*) FILTER (WHERE d.wides = 0) > 0 THEN ROUND((SUM(d.runs_off_bat)::numeric / COUNT(*) FILTER (WHERE d.wides = 0)) * 100, 2) ELSE 0 END AS strikeRate`,
        );
        break;
      default:
        selectCols.push(Prisma.sql`0 AS ${Prisma.raw(metric)}`);
    }
  }

  const selectClause = selectCols.reduce((acc, part, i) => {
    if (i === 0) {
      return part;
    }
    return Prisma.sql`${acc},\n${part}`;
  }, selectCols[0] as Prisma.Sql);

  const allowedSortColumns = [
    'match_id',
    'season',
    'start_date',
    'venue',
    'city',
    'toss_winner',
    'toss_decision',
    'winner',
    ...metrics,
  ];
  const defaultOrderBy = Prisma.sql`ORDER BY m.start_date DESC`;
  const orderBy = buildOrderByClause(sort, allowedSortColumns, defaultOrderBy);

  const sql = Prisma.sql`
    SELECT ${selectClause}
    FROM wpl_delivery d
    JOIN wpl_match m ON d.match_id = m.match_id
    LEFT JOIN wpl_match_info mi ON m.match_id = mi.match_id
    WHERE ${whereClause}
    GROUP BY ${Prisma.raw(groupByCols.join(', '))}
    ${orderBy}
    LIMIT ${pagination.pageSize} OFFSET ${offset}
  `;

  const countSql = Prisma.sql`
    SELECT COUNT(*)::int AS total
    FROM (
      SELECT 1
      FROM wpl_delivery d
      JOIN wpl_match m ON d.match_id = m.match_id
      LEFT JOIN wpl_match_info mi ON m.match_id = mi.match_id
      WHERE ${whereClause}
      GROUP BY ${Prisma.raw(groupByCols.join(', '))}
    ) grouped
  `;

  return { sql, countSql };
}

export function validateDimensions(
  reportType: StatExplorerReportType,
  dimensions: StatExplorerDimension[],
): void {
  const allowed = ALLOWED_DIMENSIONS[reportType];
  for (const dim of dimensions) {
    if (!allowed.includes(dim)) {
      throw new Error(
        `Dimension '${dim}' is not allowed for report type '${reportType}'. Allowed: ${allowed.join(', ')}`,
      );
    }
  }
}

export function validateMetrics(
  reportType: StatExplorerReportType,
  metrics: StatExplorerMetric[],
): void {
  const allowed = ALLOWED_METRICS[reportType];
  for (const metric of metrics) {
    if (!allowed.includes(metric)) {
      throw new Error(
        `Metric '${metric}' is not allowed for report type '${reportType}'. Allowed: ${allowed.join(', ')}`,
      );
    }
  }
}

export function convertBigIntRows<T extends Record<string, unknown>>(
  rows: T[],
): Record<string, unknown>[] {
  return rows.map((row) => {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'bigint') {
        converted[key] = Number(value);
      } else {
        converted[key] = value;
      }
    }
    return converted;
  });
}
