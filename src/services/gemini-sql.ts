import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

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

RESPONSE FORMAT:
Return ONLY valid PostgreSQL SQL.
CRITICAL: Your entire response must be ONLY raw SQL text. Do NOT include any Markdown, explanations, or code fences like \`\`\`sql ... \`\`\`. Your output will be executed directly and must not contain any non-SQL characters.
If a query requires a player name lookup, return the lookup query first, followed by the main query on a new line.`;

// Initialize Gemini model
const model = google('gemini-2.5-pro');

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

      const { text } = await generateText({
        model: model,
        system: MASTER_PROMPT,
        prompt: question,
        temperature: 0.1, // Low temperature for consistent, deterministic responses
      });

      console.log('Gemini AI response:', text);

      // Parse the response to extract SQL queries
      const queries = this.parseAiResponse(text);
      console.log('Parsed queries:', queries);

      return queries;
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
   * Parses AI response to extract SQL queries
   */
  private parseAiResponse(response: string): string[] {
    if (!response || response.trim().length === 0) {
      throw new Error('Empty response from AI model');
    }

    // Split by lines and filter out empty lines and comments
    const lines = response
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('--') && !line.startsWith('/*'));

    // Join lines that are part of the same query
    const queries: string[] = [];
    let currentQuery = '';

    for (const line of lines) {
      currentQuery += line + ' ';

      // If line ends with semicolon, it's the end of a query
      if (line.endsWith(';')) {
        queries.push(currentQuery.trim());
        currentQuery = '';
      }
    }

    // Add any remaining query (in case it doesn't end with semicolon)
    if (currentQuery.trim().length > 0) {
      queries.push(currentQuery.trim());
    }

    if (queries.length === 0) {
      throw new Error('No valid SQL queries found in AI response');
    }

    return queries;
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
    return queries.some(
      (query) =>
        query.toLowerCase().includes('select player_name from wpl_player') &&
        query.toLowerCase().includes('ilike'),
    );
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
}

// Export singleton instance
export const geminiSqlService = new GeminiSqlService();
