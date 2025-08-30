import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import {
  hasPlayerNameResolution as utilHasPlayerNameResolution,
  extractHeadToHeadQueries,
  applyResolvedNames,
} from './sql-utils';

// Optimized master prompt with concise formulas instead of large examples
const MASTER_PROMPT = `You are a cricket statistics SQL expert. Convert natural language queries about cricket statistics into safe, accurate PostgreSQL queries for IPL data.

SYSTEM CONTEXT:
- Purpose: Generate accurate, safe PostgreSQL SELECT queries over T20 data for cricket questions.
- Dialect: PostgreSQL 13+.
- Aliases: wpl_delivery AS d, wpl_match AS m, wpl_match_info AS mi, wpl_player AS p.

CURRENT DATE AND RELATIVE TIME:
- Use SQL time functions instead of JavaScript. Always reference CURRENT_DATE in SQL.
- Relative time rules:
  - "this year": m.start_date >= DATE_TRUNC('year', CURRENT_DATE)::date AND m.start_date <= CURRENT_DATE
  - "last year": m.start_date >= DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 year' AND m.start_date < DATE_TRUNC('year', CURRENT_DATE)
  - "last X years": m.start_date >= (DATE_TRUNC('year', CURRENT_DATE) - (INTERVAL '1 year' * X)) AND m.start_date <= CURRENT_DATE
  - "last X months": m.start_date >= (CURRENT_DATE - (INTERVAL '1 month' * X)) AND m.start_date <= CURRENT_DATE
  - If the user specifies fixed years (e.g., 2018–2020), use: m.start_date >= '2018-01-01' AND m.start_date <= '2020-12-31'
  - Use m.start_date (never season text) for date filters.

GLOBAL FILTER MACROS:
- Always join deliveries to matches for league/time filters.
- Always exclude Super Overs unless explicitly requested.
- Define reusable filters/macros to inject into queries:
  {{LEAGUE_FILTER}}   -> m.league = 'IPL'         -- set when the question is about IPL
  {{DATE_FILTER}}     -> valid SQL predicate on m.start_date per the rules above
  {{INNINGS_FILTER}}  -> d.innings <= 2           -- regular play only (exclude Super Overs)
  {{LIMIT_FILTER}}    -> LIMIT 20                  -- always enforce if missing

SECURITY RULES (HARD REQUIREMENTS):
1) Generate ONLY SELECT statements. No INSERT/UPDATE/DELETE/TRUNCATE/ALTER/DROP/CREATE.
2) Only use these tables: wpl_match m, wpl_delivery d, wpl_match_info mi, wpl_player p.
3) Enforce LIMIT ≤ 20 if not present.
4) No system catalogs, no volatile/dangerous functions.

SCHEMA (COLUMNS):
- wpl_match m(match_id, league, season, start_date, venue)
- wpl_delivery d(id, match_id, innings, ball, batting_team, bowling_team, striker, non_striker, bowler, runs_off_bat, extras, wides, noballs, wicket_type, player_dismissed)
- wpl_match_info mi(match_id, city, toss_winner, toss_decision, player_of_match, winner)
- wpl_player p(match_id, team_name, player_name)

TEAM NAME NORMALIZATION (REQUIRED WHEN A TEAM NAME IS SELECTED OR GROUPED):
Use a lightweight mapping CTE once per query rather than repeating CASE in many expressions.
WITH team_map AS (
  SELECT *
  FROM (VALUES
    ('Royal Challengers Bengaluru', 'Royal Challengers Bangalore'),
    ('Delhi Daredevils',            'Delhi Capitals'),
    ('Kings XI Punjab',             'Punjab Kings'),
    ('Rising Pune Supergiants',     'Rising Pune Supergiant')
  ) AS t(variant, canonical)
)
Join this CTE and always select COALESCE(tm.canonical, <team_field>) for any returned team name and GROUP BY the same expression, so variants are combined.

MATCH PHASES (T20):
- Over Number: CAST(SPLIT_PART(d.ball, '.', 1) AS INTEGER) AS over_number
- Powerplay: over_number BETWEEN 0 AND 5
- Middle: over_number BETWEEN 6 AND 14
- Death: over_number BETWEEN 15 AND 19

CRICKET METRICS (REQUIRED FORMULAS):
BATTING:
- runs: SUM(d.runs_off_bat)
- balls_faced: COUNT(*) FILTER (WHERE d.wides = 0)
- strike_rate (alias strike_rate, ALWAYS include for batting questions):
  (SUM(d.runs_off_bat)::DECIMAL * 100) / NULLIF(COUNT(*) FILTER (WHERE d.wides = 0), 0) AS strike_rate
- average: SUM(d.runs_off_bat)::DECIMAL / NULLIF(COUNT(CASE WHEN d.player_dismissed = d.striker THEN 1 END), 0)
- boundaries_4: COUNT(*) FILTER (WHERE d.runs_off_bat = 4)
- sixes_6: COUNT(*) FILTER (WHERE d.runs_off_bat = 6)
- dot_balls: COUNT(*) FILTER (WHERE d.runs_off_bat = 0 AND d.extras = 0)
- matches: COUNT(DISTINCT d.match_id)

BOWLING:
- wickets: COUNT(*) FILTER (WHERE d.player_dismissed IS NOT NULL AND d.wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket'))
- runs_conceded: SUM(d.runs_off_bat + d.wides + d.noballs)
- overs: COUNT(*)::DECIMAL / 6
- economy_rate (alias economy_rate, ALWAYS include for bowling questions):
  SUM(d.runs_off_bat + d.wides + d.noballs) / NULLIF(COUNT(*)::DECIMAL / 6, 0) AS economy_rate
- average: SUM(d.runs_off_bat + d.wides + d.noballs)::DECIMAL / NULLIF(COUNT(*) FILTER (WHERE d.player_dismissed IS NOT NULL), 0)
- balls_bowled: COUNT(*)
- matches: COUNT(DISTINCT d.match_id)

TEAM STATS:
- team_runs: SUM(d.runs_off_bat + d.extras) GROUP BY d.batting_team, d.match_id, d.innings
- team_wickets: COUNT(*) FILTER (WHERE d.player_dismissed IS NOT NULL)

WINS BY TEAM RULES:
- When returning wins grouped by team from mi.winner, add mi.winner IS NOT NULL in WHERE.
- Use COUNT(*) AS total_wins, not COUNT(mi.winner).
- Normalize the returned team name with team_map: COALESCE(tm.canonical, mi.winner) AS winner.

DUCKS (PER BATTER-INNINGS):
- Use a batter-innings CTE that groups by (match_id, innings, striker) to detect runs=0 and dismissed, with balls_faced defined as COUNT(*) FILTER (WHERE d.wides = 0).

CRITICAL FILTERING LOGIC:
- When the user asks about IPL, include {{LEAGUE_FILTER}} with m.league = 'IPL'.
- Always filter by m.start_date using {{DATE_FILTER}} derived from the user’s phrasing.
- Always include {{INNINGS_FILTER}} unless the question explicitly asks for Super Overs.

PLAYER NAME RESOLUTION (TWO-STEP):
If a specific player is referenced, generate two queries:
1) Name lookup:
SELECT player_name
FROM wpl_player
WHERE player_name ILIKE '%{surname}%'
ORDER BY CASE WHEN player_name ILIKE '{initial}%{surname}' THEN 1 ELSE 2 END
LIMIT 1;

2) Stats query (replace 'RESOLVED_PLAYER_NAME'):
-- Use 'RESOLVED_PLAYER_NAME' literally as a placeholder in the SQL. Do not guess.
-- Example (batting):
SELECT
  d.striker,
  SUM(d.runs_off_bat) AS runs,
  COUNT(*) FILTER (WHERE d.wides = 0) AS balls,
  (SUM(d.runs_off_bat)::DECIMAL * 100) / NULLIF(COUNT(*) FILTER (WHERE d.wides = 0), 0) AS strike_rate
FROM wpl_delivery d
JOIN wpl_match m ON m.match_id = d.match_id
WHERE {{LEAGUE_FILTER}} AND {{INNINGS_FILTER}} AND d.striker = 'RESOLVED_PLAYER_NAME' AND {{DATE_FILTER}}
GROUP BY d.striker
ORDER BY runs DESC
{{LIMIT_FILTER}};

HEAD-TO-HEAD (THREE QUERIES):
1) Batter lookup (as above), 2) Bowler lookup (surname/initial), 3) Final stats using 'RESOLVED_BATTER_NAME' and 'RESOLVED_BOWLER_NAME':
SELECT
  SUM(d.runs_off_bat) AS runs,
  COUNT(*) FILTER (WHERE d.wides = 0) AS balls,
  (SUM(d.runs_off_bat)::DECIMAL * 100) / NULLIF(COUNT(*) FILTER (WHERE d.wides = 0), 0) AS strike_rate,
  COUNT(CASE WHEN d.player_dismissed = d.striker THEN 1 END) AS dismissals
FROM wpl_delivery d
JOIN wpl_match m ON m.match_id = d.match_id
WHERE {{LEAGUE_FILTER}} AND {{INNINGS_FILTER}}
  AND d.striker = 'RESOLVED_BATTER_NAME'
  AND d.bowler = 'RESOLVED_BOWLER_NAME'
  AND {{DATE_FILTER}}
{{LIMIT_FILTER}};

COMMON TEMPLATES:
-- Top Scorers (ensure strike_rate present):
SELECT
  d.striker,
  SUM(d.runs_off_bat) AS runs,
  COUNT(*) FILTER (WHERE d.wides = 0) AS balls,
  (SUM(d.runs_off_bat)::DECIMAL * 100) / NULLIF(COUNT(*) FILTER (WHERE d.wides = 0), 0) AS strike_rate
FROM wpl_delivery d
JOIN wpl_match m ON m.match_id = d.match_id
WHERE {{LEAGUE_FILTER}} AND {{INNINGS_FILTER}} AND {{DATE_FILTER}}
GROUP BY d.striker
ORDER BY runs DESC
{{LIMIT_FILTER}};

-- Top Wicket Takers (ensure economy_rate present):
SELECT
  d.bowler,
  COUNT(*) FILTER (WHERE d.player_dismissed IS NOT NULL AND d.wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket')) AS wickets,
  SUM(d.runs_off_bat + d.wides + d.noballs) / NULLIF(COUNT(*)::DECIMAL / 6, 0) AS economy_rate
FROM wpl_delivery d
JOIN wpl_match m ON m.match_id = d.match_id
WHERE {{LEAGUE_FILTER}} AND {{INNINGS_FILTER}} AND {{DATE_FILTER}}
GROUP BY d.bowler
ORDER BY wickets DESC
{{LIMIT_FILTER}};

-- Duck leaderboard:
WITH batter_innings AS (
  SELECT
    d.match_id,
    d.innings,
    d.striker AS batter,
    SUM(d.runs_off_bat) AS runs,
    COUNT(*) FILTER (WHERE d.wides = 0) AS balls_faced,
    BOOL_OR(d.player_dismissed = d.striker) AS dismissed
  FROM wpl_delivery d
  JOIN wpl_match m ON m.match_id = d.match_id
  WHERE {{LEAGUE_FILTER}} AND {{INNINGS_FILTER}} AND {{DATE_FILTER}}
  GROUP BY d.match_id, d.innings, d.striker
)
SELECT batter AS striker, COUNT(*) AS ducks
FROM batter_innings
WHERE dismissed AND runs = 0
GROUP BY batter
ORDER BY ducks DESC
{{LIMIT_FILTER}};

ALWAYS-ON METRIC REQUIREMENTS:
- If the user asks for batting stats, include strike_rate AS strike_rate in SELECT.
- If the user asks for bowling stats, include economy_rate AS economy_rate in SELECT.

DISAMBIGUATION RULES:
- “season”/“this season” → use calendar year via CURRENT_DATE year window unless the user explicitly states a tournament-defined season.
- “since YEAR” → m.start_date >= 'YEAR-01-01' AND m.start_date <= CURRENT_DATE
- If no time is specified, omit {{DATE_FILTER}}.

SUPER OVER HANDLING:
- Default exclude (d.innings <= 2). Only include if the user explicitly asks (e.g., “include Super Overs”), then remove {{INNINGS_FILTER}}.

OUTPUT CONTRACT:
Return JSON only:
{
  "queries": ["SQL1", "SQL2", "..."],
  "meta": {
    "requiresSequentialExecution": boolean,
    "type": "single|headToHead|team"
  }
}

POST-GENERATION VALIDATION (MUST PASS):
- Each SQL is a single SELECT.
- Only tables {wpl_match, wpl_delivery, wpl_match_info, wpl_player} appear with allowed aliases {m,d,mi,p}.
- LIMIT exists and ≤ 20 (add LIMIT 20 if missing).  
- If batting-oriented, ensure strike_rate column exists.
- If bowling-oriented, ensure economy_rate column exists.
`;

// Initialize Gemini model
const model = google('gemini-2.5-flash');

export interface GeminiResponse {
  queries: string[];
  requiresSequentialExecution: boolean;
}

export class GeminiSqlService {
  /**
   * Generates SQL queries from natural language cricket questions
   */
  async generateSql(question: string): Promise<string[]> {
    try {
      console.log('Generating SQL with Gemini for question:', question);

      // Define a structured response schema to avoid brittle string parsing
      const SqlResponseSchema = z.object({
        // Array of SQL SELECT queries in execution order
        queries: z.array(z.string()).min(1),
        // Optional meta for future routing/logic
        meta: z
          .object({
            requiresSequentialExecution: z.boolean().default(false),
            type: z.enum(['single', 'headToHead', 'team']).optional(),
          })
          .optional(),
      });

      const { object } = await generateObject({
        model,
        system: MASTER_PROMPT,
        prompt: question,
        temperature: 0.3,
        maxTokens: 2000,
        schema: SqlResponseSchema,
      });

      console.log('Gemini structured response:', object);

      // Validate and minimally normalize each query
      const validated = object.queries.map((q) => this.minimalValidateAndNormalize(q));
      console.log('Validated queries:', validated);

      return validated;
    } catch (error) {
      console.error('Error generating SQL with Gemini:', error);
      console.error('Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        question,
      });
      throw new Error('Failed to generate SQL query. Please try rephrasing your question.');
    }
  }

  /**
   * High-level helper: generate queries from a question, then resolve any player lookups
   * and return a single final executable SQL (e.g., for head-to-head stats).
   *
   * Provide a `runQuery` function that executes a single SELECT and returns rows.
   */
  async generateExecutableSql(
    question: string,
    runQuery: (sql: string) => Promise<Array<Record<string, unknown>>>,
  ): Promise<string> {
    const queries = await this.generateSql(question);
    const built = await this.buildExecutableQueries(queries, runQuery);
    // Return the final (possibly single) query to execute
    return built[built.length - 1];
  }

  /**
   * Minimal SQL validator/enforcer (Phase 1):
   * - Enforce SELECT-only
   * - Allowlist tables (wpl_*)
   * - Ensure LIMIT <= 1000 (inject if missing)
   */
  private minimalValidateAndNormalize(sql: string): string {
    if (!sql || !sql.trim()) throw new Error('Empty SQL from AI');

    const s = sql.trim();

    // Must start with SELECT or WITH (for CTEs)
    if (!/^(select|with)\s/i.test(s)) {
      throw new Error('All queries must be SELECT statements');
    }

    // Disallow dangerous keywords/functions even if inside comments (assume clean SQL)
    const forbidden =
      /(insert|update|delete|drop|create|alter|truncate|grant|revoke|copy|do|pg_sleep|set\s+role|set\s+search_path)\b/i;
    if (forbidden.test(s)) {
      throw new Error('Forbidden SQL keyword/function detected');
    }

    const cteNames = Array.from(s.matchAll(/\b([A-Za-z_"][A-Za-z0-9_".]*)\s+as\s*\(/gi)).map((m) =>
      (m[1] || '').replace(/"/g, '').split('.').pop()!.toLowerCase(),
    );
    const cteSet = new Set(cteNames);

    // Allowlist: only wpl_* tables or CTEs (basic regex check)
    const tableRefs = s.match(/\bfrom\b|\bjoin\b/gi)
      ? Array.from(s.matchAll(/\bfrom\s+([^\s;]+)|\bjoin\s+([^\s;]+)/gi))
      : [];
    const invalidRef = tableRefs.some((m) => {
      const ref = (m[1] || m[2] || '').replace(/[,()]/g, '');
      // ignore aliases like wpl_delivery wd -> only check the first token
      const first = ref.split(/\s+/)[0].replace(/"/g, '');
      // Permit subqueries and CTEs implicitly (cannot detect here), focus on explicit table names
      if (/^\(/.test(first)) return false;
      // Permit schema-qualified like public.wpl_delivery
      const base = first.includes('.') ? first.split('.')[1] : first;
      const baseLower = base.toLowerCase();
      if (cteSet.has(baseLower)) return false;
      if (baseLower === 'team_map' || baseLower === 't' || baseLower === 'values') return false;
      return !/^wpl_/.test(base);
    });
    if (invalidRef) {
      throw new Error('Only wpl_* tables are allowed in queries');
    }

    // Ensure LIMIT <= 1000 (inject if missing or if higher)
    const limitMatch = s.match(/\blimit\s+(\d+)/i);
    if (!limitMatch) {
      // Inject LIMIT 20 at the end (respect ending semicolon)
      const hasSemicolon = /;\s*$/.test(s);
      const withLimit = s.replace(/;?\s*$/, '') + ' LIMIT 20';
      return withLimit + (hasSemicolon ? ';' : '');
    } else {
      const current = parseInt(limitMatch[1], 10);
      if (Number.isFinite(current) && current > 100) {
        // Lower the limit to 100
        return s.replace(/\blimit\s+\d+/i, 'LIMIT 20');
      }
    }

    return s;
  }

  /**
   * Determines if multiple queries need sequential execution
   */
  requiresSequentialExecution(queries: string[]): boolean {
    // If we have multiple queries, they likely need sequential execution
    // (e.g., player name lookup followed by main query)
    return queries.length > 1;
  }

  /**
   * Detects if the queries include player name resolution
   */
  hasPlayerNameResolution(queries: string[]): boolean {
    return utilHasPlayerNameResolution(queries);
  }

  /**
   * Validates that sequential queries are properly structured
   */
  validateSequentialQueries(queries: string[]): void {
    if (queries.length < 2) return;

    // Check if first query is player name resolution
    const firstQuery = queries[0].toLowerCase();
    if (firstQuery.includes('select player_name from wpl_player')) {
      // Ensure it has proper ILIKE and ORDER BY structure
      if (!firstQuery.includes('ilike') || !firstQuery.includes('order by')) {
        throw new Error('Player name resolution query is not properly structured');
      }
    }

    // Ensure all queries are SELECT statements
    for (const query of queries) {
      if (!query.trim().toLowerCase().startsWith('select')) {
        throw new Error('All queries must be SELECT statements');
      }
    }
  }

  /**
   * Given generated queries and a function capable of executing a single SQL SELECT
   * and returning rows, resolve any player lookup(s) and return the final
   * executable stats query with placeholders replaced.
   *
   * Contract for runQuery:
   *  - Input: SQL string (SELECT)
   *  - Output: Promise of array of row objects; for lookup queries must contain a
   *    'player_name' field on the first row if a match exists.
   */
  async buildExecutableQueries(
    queries: string[],
    runQuery: (sql: string) => Promise<Array<Record<string, unknown>>>,
  ): Promise<string[]> {
    if (!queries.length) throw new Error('No queries to build');

    // If no player lookup involved, just return validated queries as-is.
    if (!this.hasPlayerNameResolution(queries)) {
      return queries;
    }

    const { batterLookup, bowlerLookup, main } = extractHeadToHeadQueries(queries);

    let batterName: string | undefined;
    let bowlerName: string | undefined;

    if (batterLookup) {
      const rows = (await runQuery(batterLookup)) as Array<{ player_name?: string }>;
      batterName = rows?.[0]?.player_name;
      if (!batterName) {
        throw new Error('Player not found. Please check the name and try again.');
      }
    }

    if (bowlerLookup) {
      const rows = (await runQuery(bowlerLookup)) as Array<{ player_name?: string }>;
      bowlerName = rows?.[0]?.player_name;
      if (!bowlerName) {
        throw new Error('No matching bowler found for lookup query');
      }
    }

    // For single-player flows, placeholder may be RESOLVED_PLAYER_NAME.
    let finalMain = main;
    if (batterName) {
      finalMain = finalMain
        .replace(/'RESOLVED_PLAYER_NAME'/g, `'${batterName.replace(/'/g, "''")}'`)
        .replace(/RESOLVED_PLAYER_NAME/g, `'${batterName.replace(/'/g, "''")}'`);
    }

    // For head-to-head flows use specific placeholders (already handled by util)
    finalMain = applyResolvedNames(finalMain, { batterName, bowlerName });

    // Return just the final stats query to execute
    return [this.minimalValidateAndNormalize(finalMain)];
  }
}

// Export singleton instance
export const geminiSqlService = new GeminiSqlService();
