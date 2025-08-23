/**
 * Utilities for handling sequential Text-to-SQL flows like player name resolution
 * and applying resolved values into final head-to-head matchup queries.
 */

/** True if the generated queries include player name resolution steps. */
export function hasPlayerNameResolution(queries: string[]): boolean {
  return queries.some((q) => /select\s+player_name\s+from\s+wpl_player/i.test(q));
}

/**
 * Extract batter/bowler lookup queries and the final stats query from an array of queries.
 * Supports either 2-step (single player + main) or 3-step (batter, bowler, main) flows.
 */
export function extractHeadToHeadQueries(queries: string[]): {
  batterLookup?: string;
  bowlerLookup?: string;
  main: string;
} {
  if (!queries.length) throw new Error('No queries provided');

  // Heuristic: final query is the last one
  const main = queries[queries.length - 1];

  // Identify lookup queries by shape
  const lookups = queries.slice(0, -1).filter((q) => /select\s+player_name\s+from\s+wpl_player/i.test(q));

  if (lookups.length === 0) {
    return { main };
  }
  if (lookups.length === 1) {
    return { batterLookup: lookups[0], main };
  }
  // Assume 2 lookup queries: batter first, bowler second
  return { batterLookup: lookups[0], bowlerLookup: lookups[1], main };
}

/** Safely quote a SQL string literal by doubling single quotes. */
export function sqlQuoteLiteral(value: string): string {
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * Apply resolved batter and bowler names into the main head-to-head SQL query.
 * Replaces any occurrences of RESOLVED_BATTER_NAME / RESOLVED_BOWLER_NAME (with or without quotes)
 * with properly quoted SQL string literals.
 */
export function applyResolvedNames(
  mainQuery: string,
  names: { batterName?: string; bowlerName?: string }
): string {
  let sql = mainQuery;
  if (names.batterName) {
    const q = sqlQuoteLiteral(names.batterName);
    sql = sql
      .replace(/'RESOLVED_BATTER_NAME'/g, q)
      .replace(/RESOLVED_BATTER_NAME/g, q);
  }
  if (names.bowlerName) {
    const q = sqlQuoteLiteral(names.bowlerName);
    sql = sql
      .replace(/'RESOLVED_BOWLER_NAME'/g, q)
      .replace(/RESOLVED_BOWLER_NAME/g, q);
  }
  return sql;
}

/**
 * Convenience: Given all generated queries and resolved names, return the final SQL to execute.
 */
export function buildFinalHeadToHeadSql(
  queries: string[],
  names: { batterName?: string; bowlerName?: string }
): string {
  const { main } = extractHeadToHeadQueries(queries);
  return applyResolvedNames(main, names);
}
