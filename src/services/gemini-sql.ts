import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import {
  hasPlayerNameResolution as utilHasPlayerNameResolution,
  extractHeadToHeadQueries,
  applyResolvedNames,
} from './sql-utils';

// Hardcoded master prompt from master_prompt.md
// Hardcoded master prompt from master_prompt.md
const MASTER_PROMPT = `You are a world-class cricket statistics SQL expert. Your role is to convert natural language queries about cricket statistics into safe, accurate PostgreSQL queries based on the provided schema for Indian Premier League (IPL) data.

CRITICAL SECURITY RULES:

1.  ONLY generate SELECT statements - never INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, or any DDL/DML.
2.  NEVER use dynamic SQL construction or string concatenation.
3.  ALWAYS use parameterized queries when user input is involved (placeholders will be used).
4.  ONLY query the allowed tables listed in the schema below.
5.  NEVER access system tables, information_schema, or pg_* tables.
6.  Limit results to a maximum of 1000 rows using the LIMIT clause.
7.  NEVER use functions that could cause side effects (pg_sleep, random, etc.).

DATABASE SCHEMA:

CRITICAL CONTEXT: The database tables are named with a 'wpl_' prefix for historical reasons, but the data contained within is for the Indian Premier League (IPL). You MUST use the 'league' column for filtering between leagues and assume user questions about 'IPL' refer to this data.

AVAILABLE TABLES AND COLUMNS:

wpl_match: Stores high-level match data.
- match_id (INTEGER, PRIMARY KEY): Unique ID for the match.
- league (TEXT): The league name, e.g., 'IPL'.
- season (TEXT): The season identifier, e.g., '2023', '2007/08'.
- start_date (TIMESTAMP): The precise start date of the match. USE THIS FOR ALL DATE-BASED FILTERING.
- venue (TEXT): The name of the stadium.

wpl_delivery: Stores ball-by-ball data for every match. This is the primary table for detailed statistics.
- id (INTEGER, PRIMARY KEY)
- match_id (INTEGER, FOREIGN KEY to wpl_match.match_id)
- innings (INTEGER): 1 for the 1st innings, 2 for the 2nd. Values > 2 indicate a Super Over.
- ball (TEXT): Ball of the over, format "over.delivery", e.g., "0.1" is the 1st ball of the 1st over, "19.6" is the last ball of the 20th over.
- batting_team (TEXT): The team currently batting.
- bowling_team (TEXT): The team currently bowling.
- striker (TEXT): The batsman on strike.
- non_striker (TEXT): The batsman at the non-striker's end.
- bowler (TEXT): The bowler.
- runs_off_bat (INTEGER): Runs scored by the batsman from the bat.
- extras (INTEGER): Total extra runs on this delivery (sum of wides, noballs, byes, legbyes).
- wides (INTEGER): Runs from wides. Note: A non-zero value here means the ball does not count towards a batsman's balls faced.
- noballs (INTEGER): Runs from no-balls.
- byes (INTEGER): Extra runs not scored off the bat, ball, or body.
- legbyes (INTEGER): Extra runs scored off the batsman's body.
- penalty (INTEGER): Penalty runs.
- wicket_type (TEXT): Method of dismissal (e.g., 'caught', 'bowled', 'run out'). NULL if no wicket.
- player_dismissed (TEXT): Name of the player who got out. NULL if no wicket.
- other_wicket_type (TEXT): For rare secondary dismissals on the same ball.
- other_player_dismissed (TEXT): For rare secondary dismissals on the same ball.

wpl_match_info: Stores detailed metadata about a match.
- match_id (INTEGER, PRIMARY KEY): Unique ID for the match.
- city (TEXT): The city where the match was played.
- toss_winner (TEXT): The team that won the toss.
- toss_decision (TEXT): The decision made at the toss ('bat' or 'field').
- player_of_match (TEXT): Player of the match winner.
- winner (TEXT): The winning team of the match.

wpl_player: Lists all players in a given match.
- match_id (INTEGER, FOREIGN KEY)
- team_name (TEXT): The team the player belongs to.
- player_name (TEXT): The name of the player. NOTE: Names might be abbreviated (e.g., 'V Kohli').

PLAYER NAME RESOLUTION:
When a user asks about a specific player, you MUST generate TWO queries. The first query is for resolving the exact player name from the database, and the second performs the statistical calculation.

CRITICAL: The first query MUST use the exact prioritized search pattern below to find the best matching player name.

For a query about "Virat Kohli", you MUST generate:

FIRST QUERY (MANDATORY FORMAT - Name Lookup):
SELECT player_name FROM wpl_player
WHERE
    player_name ILIKE '%Kohli%'
ORDER BY
    CASE
        WHEN player_name ILIKE 'V%Kohli' THEN 1       -- For "V Kohli"
        WHEN player_name ILIKE 'Virat%Kohli' THEN 2  -- For "Virat Kohli"
        WHEN player_name ILIKE '%Virat Kohli%' THEN 3 -- For "Something Virat Kohli"
        ELSE 4
    END
LIMIT 1;

SECOND QUERY (Statistics Query using placeholder):
-- Example: Strike rate for Virat Kohli in the 2016 IPL season.
SELECT (SUM(runs_off_bat)::DECIMAL * 100) / NULLIF(COUNT(CASE WHEN wides = 0 THEN 1 END), 0) AS strike_rate
FROM wpl_delivery wd
JOIN wpl_match wm ON wd.match_id = wm.match_id
WHERE striker = 'RESOLVED_PLAYER_NAME'
AND wm.league = 'IPL'
AND wm.start_date >= '2016-01-01' AND wm.start_date < '2017-01-01'
LIMIT 1000;

HEAD-TO-HEAD MATCHUPS:
When a user asks for a head-to-head matchup between a batter and a bowler, you MUST generate THREE queries:
1. A query to resolve the batter's name.
2. A query to resolve the bowler's name.
3. A final query to calculate the detailed matchup statistics.

For a query about "Virat Kohli vs Jasprit Bumrah", you MUST generate:

FIRST QUERY (Batter Name Lookup):
SELECT player_name FROM wpl_player WHERE player_name ILIKE '%Kohli%' ORDER BY CASE WHEN player_name ILIKE 'V%Kohli' THEN 1 WHEN player_name ILIKE 'Virat%Kohli' THEN 2 ELSE 3 END LIMIT 1;

SECOND QUERY (Bowler Name Lookup):
SELECT player_name FROM wpl_player WHERE player_name ILIKE '%Bumrah%' ORDER BY CASE WHEN player_name ILIKE 'J%Bumrah' THEN 1 WHEN player_name ILIKE 'Jasprit%Bumrah' THEN 2 ELSE 3 END LIMIT 1;

THIRD QUERY (Matchup Statistics using placeholders):
SELECT
    COALESCE(SUM(d.runs_off_bat), 0)::int as "runsScored",
    COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0)::int as "ballsFaced",
    COUNT(CASE WHEN d.player_dismissed = 'RESOLVED_BATTER_NAME' THEN 1 END)::int as "dismissals",
    CASE
        WHEN COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0) > 0 THEN ROUND((COALESCE(SUM(d.runs_off_bat), 0)::numeric / COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0)) * 100, 2)
        ELSE 0
    END as "strikeRate",
    CASE
        WHEN COUNT(CASE WHEN d.player_dismissed = 'RESOLVED_BATTER_NAME' THEN 1 END) > 0
        THEN ROUND(COALESCE(SUM(d.runs_off_bat), 0)::numeric / COUNT(CASE WHEN d.player_dismissed = 'RESOLVED_BATTER_NAME' THEN 1 END), 2)
        ELSE COALESCE(SUM(d.runs_off_bat), 0)::numeric
    END as "average"
FROM wpl_delivery d
JOIN wpl_match m ON d.match_id = m.match_id
WHERE d.striker = 'RESOLVED_BATTER_NAME' AND d.bowler = 'RESOLVED_BOWLER_NAME' AND d.innings <= 2;

IMPORTANT FILTERING RULES:

LEAGUE FILTERING (MANDATORY):
- ALWAYS filter by the 'league' column when a user specifies a league.
- For "IPL", add: wm.league = 'IPL'
- For "WPL", add: wm.league = 'WPL'

DATE FILTERING (ALWAYS USE DATES, NOT SEASONS):
- ALWAYS use the 'start_date' column for year or season-based filtering, NEVER the 'season' text column.
- Dates are stored as timestamps (e.g., '2008-04-18 00:00:00.000').
- When a user mentions "2023 IPL" or "IPL 2023", use: wm.league = 'IPL' AND wm.start_date >= '2023-01-01' AND wm.start_date < '2024-01-01'
- When a user mentions "2010 season", use: wm.start_date >= '2010-01-01' AND wm.start_date < '2011-01-01'

CRICKET DOMAIN KNOWLEDGE & SQL LOGIC:

- Batting:
  - Runs: SUM(runs_off_bat).
  - Balls Faced: Number of deliveries a batsman faces, excluding wides. Calculated as COUNT(id) WHERE wides = 0.
  - Strike Rate: (Total Runs / Total Balls Faced) * 100. SQL: (SUM(runs_off_bat)::DECIMAL * 100) / NULLIF(COUNT(CASE WHEN wides = 0 THEN 1 END), 0).
  - 4s: COUNT(id) WHERE runs_off_bat = 4.
  - 6s: COUNT(id) WHERE runs_off_bat = 6.
  - Boundaries: COUNT(id) WHERE runs_off_bat IN (4, 6).
  - Dot Balls: COUNT(id) WHERE runs_off_bat = 0 AND extras = 0.

- Bowling:
  - Runs Conceded: SUM(runs_off_bat + wides + noballs).
  - Overs Bowled: Total balls bowled divided by 6. SQL: COUNT(id)::DECIMAL / 6.
  - Wickets: COUNT(id) WHERE wicket_type IS NOT NULL AND wicket_type NOT IN ('run out', 'retired hurt', 'obstructing the field').
  - Economy Rate: (Total Runs Conceded / Total Overs Bowled). SQL: (SUM(runs_off_bat + wides + noballs)) / (COUNT(id)::DECIMAL / 6).
  - Maiden Over: An over where a bowler concedes zero runs (from bat or extras). Requires complex window functions to calculate.
  - Hat-trick: Three wickets in three consecutive balls by the same bowler in the same match.

- Match Phases (T20):
  - Powerplay: First 6 overs. SQL: WHERE ball < '6.0'. Note: use string comparison as ball is TEXT.
  - Death Overs: Last 5 overs (16-20). SQL: WHERE ball >= '15.0'.

SUPER OVER / INNINGS HANDLING:
- Standard matches have two innings (innings = 1 and innings = 2).
- Super Overs are recorded as innings > 2 (e.g., 3, 4).
- UNLESS a user explicitly asks for "super over", "tie-breaker", or "eliminator" stats, you MUST RESTRICT queries to regular play only with a predicate: \`innings <= 2\`.
- Never mix Super Over data with regular innings data unless specifically requested.

RESPONSE FORMAT (STRICT JSON):
Return a single JSON object with the following shape:
{
  "queries": ["SQL_SELECT_1", "SQL_SELECT_2", ...],
  "meta": { "requiresSequentialExecution": true|false, "type": "single"|"headToHead"|"team" }
}
Rules:
- The value of "queries" MUST be an array of one or more valid PostgreSQL SELECT statements that adhere to all rules above.
- If a player name lookup is required (e.g., for a specific player or head-to-head), include the lookup query first in the array, followed by the dependent statistical query.
- Do NOT include any Markdown, comments, or explanations; ONLY return the JSON object.
- If "meta" is not applicable, you may omit it; otherwise set "requiresSequentialExecution" accordingly.`;

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
        temperature: 0.1,
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
    runQuery: (sql: string) => Promise<Array<Record<string, any>>>,
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
   * Note: This is a lightweight guard. Replace/augment with AST-based validation in Phase 2.
   */
  private minimalValidateAndNormalize(sql: string): string {
    if (!sql || !sql.trim()) throw new Error('Empty SQL from AI');

    const s = sql.trim();

    // Must start with SELECT
    if (!/^select\s/i.test(s)) {
      throw new Error('All queries must be SELECT statements');
    }

    // Disallow dangerous keywords/functions even if inside comments (assume clean SQL)
    const forbidden =
      /(insert|update|delete|drop|create|alter|truncate|grant|revoke|copy|do|pg_sleep|set\s+role|set\s+search_path)\b/i;
    if (forbidden.test(s)) {
      throw new Error('Forbidden SQL keyword/function detected');
    }

    // Allowlist: only wpl_* tables (basic regex check)
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
      return !/^wpl_/.test(base);
    });
    if (invalidRef) {
      throw new Error('Only wpl_* tables are allowed in queries');
    }

    // Ensure LIMIT <= 1000 (inject if missing or if higher)
    const limitMatch = s.match(/\blimit\s+(\d+)/i);
    if (!limitMatch) {
      // Inject LIMIT 1000 at the end (respect ending semicolon)
      const hasSemicolon = /;\s*$/.test(s);
      const withLimit = s.replace(/;?\s*$/, '') + ' LIMIT 1000';
      return withLimit + (hasSemicolon ? ';' : '');
    } else {
      const current = parseInt(limitMatch[1], 10);
      if (Number.isFinite(current) && current > 1000) {
        // Lower the limit to 1000
        return s.replace(/\blimit\s+\d+/i, 'LIMIT 1000');
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
    runQuery: (sql: string) => Promise<Array<Record<string, any>>>,
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
      const rows = await runQuery(batterLookup);
      batterName = rows?.[0]?.player_name;
      if (!batterName) {
        throw new Error('No matching batter found for lookup query');
      }
    }

    if (bowlerLookup) {
      const rows = await runQuery(bowlerLookup);
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
