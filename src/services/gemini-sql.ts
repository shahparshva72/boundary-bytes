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

CURRENT DATE: ${new Date().toISOString().split('T')[0]} (Today's date for calculating relative time periods)

RELATIVE DATE CALCULATIONS:
- "last X years": Calculate from (current_year - X) to current_year
- "last 3 years": start_date >= '${new Date().getFullYear() - 3}-01-01' AND start_date <= '${new Date().toISOString().split('T')[0]}'
- "this year": start_date >= '${new Date().getFullYear()}-01-01' AND start_date <= '${new Date().toISOString().split('T')[0]}'
- "last year": start_date >= '${new Date().getFullYear() - 1}-01-01' AND start_date < '${new Date().getFullYear()}-01-01'
- "recent/last X months": Calculate backwards from current date
- Always use current date as the end point, not future dates

SECURITY RULES:
1. ONLY SELECT statements - no DDL/DML
2. ONLY wpl_* tables allowed
3. LIMIT ≤ 1000 rows (add if missing)
4. No system tables or dangerous functions

SCHEMA:
wpl_match: match_id, league, season, start_date, venue
wpl_delivery: id, match_id, innings, ball, batting_team, bowling_team, striker, non_striker, bowler, runs_off_bat, extras, wides, noballs, wicket_type, player_dismissed
wpl_match_info: match_id, city, toss_winner, toss_decision, player_of_match, winner
wpl_player: match_id, team_name, player_name

CRITICAL FILTERING:
- League: wm.league = 'IPL' (always use for IPL queries)
- Date: Use start_date column, not season text
- Regular play only: d.innings <= 2 (exclude Super Overs unless requested)

PLAYER NAME RESOLUTION:
For specific players, generate TWO queries:
1. Name lookup: SELECT player_name FROM wpl_player WHERE player_name ILIKE '%{surname}%' ORDER BY CASE WHEN player_name ILIKE '{initial}%{surname}' THEN 1 ELSE 2 END LIMIT 1;
2. Stats query using 'RESOLVED_PLAYER_NAME' placeholder

HEAD-TO-HEAD QUERIES:
Generate THREE queries:
1. Batter lookup
2. Bowler lookup  
3. Stats query using 'RESOLVED_BATTER_NAME' and 'RESOLVED_BOWLER_NAME' placeholders

CRICKET STATISTICS FORMULAS:

BATTING:
- Runs: SUM(runs_off_bat)
- Balls Faced: COUNT(*) FILTER (WHERE wides = 0)
- Strike Rate: (SUM(runs_off_bat)::DECIMAL * 100) / NULLIF(COUNT(*) FILTER (WHERE wides = 0), 0)
- Average: SUM(runs_off_bat)::DECIMAL / NULLIF(COUNT(CASE WHEN player_dismissed = striker THEN 1 END), 0)
- Boundaries (4s): COUNT(*) FILTER (WHERE runs_off_bat = 4)
- Sixes: COUNT(*) FILTER (WHERE runs_off_bat = 6)
- Dot Balls: COUNT(*) FILTER (WHERE runs_off_bat = 0 AND extras = 0)
- Matches: COUNT(DISTINCT match_id)

DUCKS AND SPECIAL DISMISSALS (PER BATTER-INNINGS):
- Balls Faced: COUNT(*) FILTER (WHERE striker = batter AND wides = 0)
- Dismissed: BOOL_OR(player_dismissed = striker)
- Duck: For each (match_id, innings, striker as batter) group, WHERE dismissed AND SUM(runs_off_bat) = 0
- Golden Duck: Duck AND Balls Faced = 1
- Diamond Duck: Dismissed AND Balls Faced = 0 (often run out without facing; may require checking player_dismissed not appearing as striker)

BOWLING:
- Wickets: COUNT(*) FILTER (WHERE player_dismissed IS NOT NULL AND wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket'))
- Runs Conceded: SUM(runs_off_bat + wides + noballs)
- Overs: COUNT(*)::DECIMAL / 6
- Economy: (SUM(runs_off_bat + wides + noballs)) / (COUNT(*)::DECIMAL / 6)
- Average: SUM(runs_off_bat + wides + noballs)::DECIMAL / NULLIF(COUNT(*) FILTER (WHERE player_dismissed IS NOT NULL), 0)
- Balls Bowled: COUNT(*)
- Matches: COUNT(DISTINCT match_id)

TEAM STATS:
- Team Runs: SUM(runs_off_bat + extras) GROUP BY batting_team, match_id, innings
- Team Wickets: COUNT(*) FILTER (WHERE player_dismissed IS NOT NULL)
- Win/Loss: Compare team totals per match

MATCH PHASES (T20):
- Over Number: CAST(SPLIT_PART(ball, '.', 1) AS INTEGER)
- Powerplay: overs 0-5
- Middle: overs 6-14  
- Death: overs 15-19

TEAM NAME NORMALIZATION:
Use CASE statements for team name variations:
- 'Royal Challengers Bengaluru' → 'Royal Challengers Bangalore'
- 'Delhi Daredevils' → 'Delhi Capitals'
- 'Kings XI Punjab' → 'Punjab Kings'
- 'Rising Pune Supergiants' → 'Rising Pune Supergiant'

COMMON QUERY PATTERNS:

Top Scorers:
SELECT striker, SUM(runs_off_bat) as runs, COUNT(*) FILTER (WHERE wides = 0) as balls
FROM wpl_delivery d JOIN wpl_match m ON d.match_id = m.match_id
WHERE m.league = 'IPL' AND d.innings <= 2
GROUP BY striker ORDER BY runs DESC LIMIT 10;

Top Wicket Takers:
SELECT bowler, COUNT(*) FILTER (WHERE wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket')) as wickets
FROM wpl_delivery d JOIN wpl_match m ON d.match_id = m.match_id  
WHERE m.league = 'IPL' AND d.innings <= 2
GROUP BY bowler ORDER BY wickets DESC LIMIT 10;

Player vs Bowler:
SELECT SUM(runs_off_bat) as runs, COUNT(*) FILTER (WHERE wides = 0) as balls, COUNT(CASE WHEN player_dismissed = striker THEN 1 END) as dismissals
FROM wpl_delivery d WHERE striker = 'RESOLVED_BATTER_NAME' AND bowler = 'RESOLVED_BOWLER_NAME' AND innings <= 2;
  
Duck Leaderboard (correct per match/innings counting):
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
  WHERE m.league = 'IPL' AND d.innings <= 2
  GROUP BY d.match_id, d.innings, d.striker
)
SELECT batter AS striker, COUNT(*) AS ducks
FROM batter_innings
WHERE dismissed AND runs = 0
GROUP BY batter
ORDER BY ducks DESC
LIMIT 10;
  
CRICKET TERMINOLOGY:
- Duck: A batsman dismissed without scoring (0).
- Golden Duck: Dismissed on the first ball faced.
- Diamond Duck: Dismissed without facing a ball (e.g., run out first ball).
- Pair: Dismissed twice without scoring in the match.
- Maiden Over: An over with no runs conceded (runs_off_bat + extras = 0).
- Hat-trick: Three wickets in three consecutive deliveries.
- Fifer: A bowler taking five wickets in an innings.
- Byes/Legbyes: Runs awarded to the batting team not credited to the batsman.
- Net Run Rate: (Total runs scored/total overs faced) - (Total runs conceded/total overs bowled).
- Required Run Rate: Runs needed per over to reach a target.
- Synonyms: 4s (Boundaries), 6s (Sixes).

RESPONSE FORMAT:
Return JSON only: {"queries": ["SQL1", "SQL2"], "meta": {"requiresSequentialExecution": boolean, "type": "single|headToHead|team"}}`;

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

    const cteNames = Array.from(s.matchAll(/\b([A-Za-z_"][A-Za-z0-9_".]*)\s+as\s*\(/gi)).map((m) => (m[1] || '').replace(/"/g, '').split('.').pop()!.toLowerCase());
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
      if (cteSet.has(base.toLowerCase())) return false;
      return !/^wpl_/.test(base);
    });
    if (invalidRef) {
      throw new Error('Only wpl_* tables are allowed in queries');
    }

    // Ensure LIMIT <= 1000 (inject if missing or if higher)
    const limitMatch = s.match(/\blimit\s+(\d+)/i);
    if (!limitMatch) {
      // Inject LIMIT 100 at the end (respect ending semicolon)
      const hasSemicolon = /;\s*$/.test(s);
      const withLimit = s.replace(/;?\s*$/, '') + ' LIMIT 100';
      return withLimit + (hasSemicolon ? ';' : '');
    } else {
      const current = parseInt(limitMatch[1], 10);
      if (Number.isFinite(current) && current > 100) {
        // Lower the limit to 100
        return s.replace(/\blimit\s+\d+/i, 'LIMIT 100');
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
