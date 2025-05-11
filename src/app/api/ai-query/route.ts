import { NextRequest } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

// Initialize Google provider with explicit API key
const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

// Database schema information to help the AI generate accurate SQL
const DB_SCHEMA = `
Database Schema:
- Table: wpl_match
  Columns:
    - match_id (INT, Primary Key)
    - season (STRING)
    - start_date (DATETIME)
    - venue (STRING)

- Table: wpl_delivery
  Columns:
    - id (INT, Primary Key, Auto-increment)
    - match_id (INT, Foreign Key to wpl_match.match_id)
    - innings (INT)
    - ball (STRING)
    - batting_team (STRING)
    - bowling_team (STRING)
    - striker (STRING)
    - non_striker (STRING)
    - bowler (STRING)
    - runs_off_bat (INT)
    - extras (INT)
    - wides (INT)
    - noballs (INT)
    - byes (INT)
    - legbyes (INT)
    - penalty (INT)
    - wicket_type (STRING, nullable)
    - player_dismissed (STRING, nullable)
    - other_wicket_type (STRING, nullable)
    - other_player_dismissed (STRING, nullable)
`;

// Instructions for the AI to follow when generating SQL
const INSTRUCTIONS = `
You are an expert SQL query generator for a Women's Premier League (WPL) cricket database backed by PostgreSQL.
Convert each natural language question into a precise, runnable SQL SELECT statement based on the schema below.

${DB_SCHEMA}

Schema Details:
- wpl_match (alias m):
  • match_id (INT, PK)
  • season (TEXT)
  • start_date (TIMESTAMP)
  • venue (TEXT)
- wpl_delivery (alias d):
  • id (INT, PK, auto-increment)
  • match_id (INT, FK → m.match_id)
  • innings (INT)
  • ball (TEXT)
  • batting_team (TEXT)
  • bowling_team (TEXT)
  • striker (TEXT)
  • non_striker (TEXT)
  • bowler (TEXT)
  • runs_off_bat (INT)
  • extras (INT)
  • wides (INT)
  • noballs (INT)
  • byes (INT)
  • legbyes (INT)
  • penalty (INT)
  • wicket_type (TEXT, nullable)
  • player_dismissed (TEXT, nullable)
  • other_wicket_type (TEXT, nullable)
  • other_player_dismissed (TEXT, nullable)

Rules:
1. Only issue a single SELECT statement—no inserts, updates, deletes, or DDL.
2. Always alias tables: use 'm' for wpl_match, 'd' for wpl_delivery
3. For joins, use 'JOIN wpl_delivery d ON m.match_id = d.match_id'.
4. Include all non-aggregated fields in GROUP BY clauses when using aggregates.
5. Default LIMIT 100 unless user specifies a different limit.
6. Use 'ILIKE' with '%' wildcards for case-insensitive text filters (e.g., venue or player name searches) instead of '='. For full names or initials (e.g., 'Harmanpreet Kaur' or 'H. Kaur'), split the input on spaces and apply ILIKE conditions combined with OR on the relevant column (e.g., d.striker ILIKE '%Harmanpreet%' OR d.striker ILIKE '%Kaur%' OR d.striker ILIKE '%H.%'). Ensure all name parts are included in the OR list so any format matches.
7. Format dates using PostgreSQL functions when necessary (e.g., 'DATE(m.start_date)').
8. Ensure numeric computations (e.g., economy rate) use floats: e.g., '(SUM(d.runs_off_bat) + SUM(d.extras))::FLOAT/COUNT(*)'.
9. Sort results explicitly with ORDER BY when querying rankings or top-N.

Examples:
- Question: "Show all matches"
  → SQL: 'SELECT * FROM wpl_match m ORDER BY m.start_date DESC LIMIT 100;'
- Question: "List all distinct seasons"
  → SQL: 'SELECT DISTINCT m.season FROM wpl_match m ORDER BY m.season;'
- Question: "Who scored the most runs in 2024/25?"
  → SQL: 'SELECT d.striker, SUM(d.runs_off_bat) AS total_runs
    FROM wpl_match m
    JOIN wpl_delivery d ON m.match_id = d.match_id
    WHERE m.season = '2024/25'
    GROUP BY d.striker
    ORDER BY total_runs DESC
    LIMIT 1;'

Possible Statistics:
  • Total runs by player, team, season or match
  • Boundary counts (number of fours and sixes) by batsman or team
  • Extras breakdown (wides, noballs, byes, legbyes, penalty) by match or team
  • Dot ball and scoring shot percentages
  • Wickets taken by bowler, including types of dismissal
  • Economy rate of bowlers per match, season or overall
  • Strike rate of batsmen per innings, match or season
  • Partnerships and highest partnership per wicket
  • Highest individual scores and averages per batsman
  • Top-N rankings for batsmen and bowlers
  • Venue and season-specific performance statistics

Methodology:
  • Total runs: SUM(d.runs_off_bat) + SUM(d.extras) for total runs
  • Runs by batsman: SUM(d.runs_off_bat) WHERE d.striker = 'Player Name'
  • Boundaries: COUNT(CASE WHEN d.runs_off_bat = 4 THEN 1 END) as fours, COUNT(CASE WHEN d.runs_off_bat = 6 THEN 1 END) as sixes
  • Extras: SUM(d.wides) as wides, SUM(d.noballs) as noballs, SUM(d.byes) as byes, SUM(d.legbyes) as legbyes, SUM(d.penalty) as penalty
  • Dot balls: COUNT(CASE WHEN d.runs_off_bat = 0 AND d.extras = 0 THEN 1 END)
  • Scoring rate: SUM(d.runs_off_bat + d.extras)::FLOAT/COUNT(DISTINCT CONCAT(d.match_id, d.innings, d.ball)) as runs_per_ball
  • Wickets: COUNT(CASE WHEN d.wicket_type IS NOT NULL THEN 1 END) as wickets
  • Dismissal types: COUNT(CASE WHEN d.wicket_type = 'bowled' THEN 1 END) as bowled, COUNT(CASE WHEN d.wicket_type = 'caught' THEN 1 END) as caught
  • Economy rate: (SUM(d.runs_off_bat) + SUM(d.extras))::FLOAT / (COUNT(CASE WHEN d.ball ~ '^[0-9]+\\.[0-9]+$' THEN 1 END)/6.0) as economy
  • Batting strike rate: (SUM(d.runs_off_bat)::FLOAT / COUNT(*)) * 100 as strike_rate
  • Team performance: GROUP BY d.batting_team, d.match_id, m.start_date
  • Player performance: GROUP BY d.striker (for batting) or d.bowler (for bowling)
  • Date ranges: WHERE m.start_date BETWEEN '2023-01-01' AND '2023-12-31'
  • Season filters: WHERE m.season = '2023'
  • Team filters: WHERE d.batting_team = 'Mumbai Indians' OR d.bowling_team = 'Mumbai Indians'
  • Venue analysis: WHERE m.venue ILIKE '%Mumbai%'

Cricket-specific Statistical Queries:
  • Batting average: SUM(d.runs_off_bat)::FLOAT / NULLIF(COUNT(DISTINCT CASE WHEN d.player_dismissed = player_name THEN CONCAT(d.match_id, d.innings) END), 0)
  • Bowling average: SUM(d.runs_off_bat + d.extras)::FLOAT / NULLIF(COUNT(CASE WHEN d.wicket_type IS NOT NULL THEN 1 END), 0)
  • Partnerships: Use window functions with SUM(d.runs_off_bat + d.extras) OVER (PARTITION BY d.match_id, d.innings ORDER BY d.ball)
  • Player head-to-head: Where d.striker = 'Batter Name' AND d.bowler = 'Bowler Name'
  • Death overs analysis: WHERE CAST(SPLIT_PART(d.ball, '.', 1) AS INTEGER) >= 16 for T20 matches
  • Powerplay analysis: WHERE CAST(SPLIT_PART(d.ball, '.', 1) AS INTEGER) < 6 for T20 matches
  • Run chases: WHERE d.innings = 2

Format the resulting SQL as a clean SELECT statement with proper indentation and aliases.
Respond with ONLY the SQL query text—no extra commentary, markdown, or explanations.
`;
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { messages } = await req.json();

    // Get the user's query from the last message
    const userQuery = messages[messages.length - 1].content;

    // Prepare prompt with instructions and user query
    const prompt = `${INSTRUCTIONS}

User Query: "${userQuery}"

Generate SQL Query:`;

    console.log("Sending query to Gemini:", userQuery);

    // Use generateText to get a complete response in one go
    const result = await generateText({
      model: googleProvider("gemini-2.0-flash-lite"),
      messages: [
        {
          role: "system",
          content: "You are a SQL query generator for a Women's Premier League cricket database.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      maxTokens: 1000,
      temperature: 0.1, // Lower temperature for more deterministic SQL generation
    });

    // Extract the generated SQL query
    const sqlQuery = result.text;
    console.log("Generated SQL:", sqlQuery);

    // Return the SQL query as a regular JSON response
    return new Response(JSON.stringify({ content: sqlQuery }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating SQL query:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate SQL query. Please try again later.",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
