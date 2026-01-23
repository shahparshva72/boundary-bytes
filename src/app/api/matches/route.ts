import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { League, VALID_LEAGUES, validateLeague } from '@/lib/validation/league';
import { NextResponse } from 'next/server';

interface MatchResult {
  match_id: number;
  league: string;
  season: string;
  start_date: Date;
  venue: string;
  winner: string | null;
  winner_runs: number | null;
  winner_wickets: number | null;
  team1: string | null;
  team2: string | null;
  innings1_score: bigint;
  innings2_score: bigint;
  innings1_wickets: bigint;
  innings2_wickets: bigint;
  total_count: bigint;
}

interface MetadataResult {
  season: string;
}

async function getMatchesAndMetadata(
  league: League,
  season: string | null,
  page: number,
  limit: number,
) {
  const offset = (page - 1) * limit;

  const seasonFilter = season ? Prisma.sql`AND season = ${season}` : Prisma.empty;

  const [matches, seasons] = await Promise.all([
    prisma.$queryRaw<MatchResult[]>`
      WITH paginated_matches AS (
        SELECT match_id, league, season, date, venue, winner, winner_runs, winner_wickets
        FROM wpl_match_info
        WHERE league = ${league} ${seasonFilter}
        ORDER BY date ASC
        LIMIT ${limit} OFFSET ${offset}
      ),
      match_scores AS (
        SELECT 
          d.match_id,
          MAX(CASE WHEN d.innings = 1 THEN d.batting_team END) as team1,
          MAX(CASE WHEN d.innings = 1 THEN d.bowling_team END) as team2,
          COALESCE(SUM(CASE WHEN d.innings = 1 THEN d.runs_off_bat + d.extras ELSE 0 END), 0) as innings1_score,
          COALESCE(SUM(CASE WHEN d.innings = 2 THEN d.runs_off_bat + d.extras ELSE 0 END), 0) as innings2_score,
          (COUNT(CASE WHEN d.innings = 1 AND d.player_dismissed IS NOT NULL THEN 1 END) +
           COUNT(CASE WHEN d.innings = 1 AND d.other_player_dismissed IS NOT NULL THEN 1 END)) as innings1_wickets,
          (COUNT(CASE WHEN d.innings = 2 AND d.player_dismissed IS NOT NULL THEN 1 END) +
           COUNT(CASE WHEN d.innings = 2 AND d.other_player_dismissed IS NOT NULL THEN 1 END)) as innings2_wickets
        FROM wpl_delivery d
        WHERE d.match_id IN (SELECT match_id FROM paginated_matches)
        GROUP BY d.match_id
      ),
      total AS (
        SELECT COUNT(*) as cnt FROM wpl_match_info WHERE league = ${league} ${seasonFilter}
      )
      SELECT 
        pm.match_id,
        pm.league,
        pm.season,
        pm.date as start_date,
        pm.venue,
        pm.winner,
        pm.winner_runs,
        pm.winner_wickets,
        ms.team1,
        ms.team2,
        COALESCE(ms.innings1_score, 0) as innings1_score,
        COALESCE(ms.innings2_score, 0) as innings2_score,
        COALESCE(ms.innings1_wickets, 0) as innings1_wickets,
        COALESCE(ms.innings2_wickets, 0) as innings2_wickets,
        (SELECT cnt FROM total) as total_count
      FROM paginated_matches pm
      LEFT JOIN match_scores ms ON pm.match_id = ms.match_id
      ORDER BY pm.date ASC
    `,
    prisma.$queryRaw<MetadataResult[]>`
      SELECT DISTINCT season FROM wpl_match_info WHERE league = ${league} ORDER BY season DESC
    `,
  ]);

  const totalCount = matches.length > 0 ? Number(matches[0].total_count) : 0;

  return {
    matches: matches.map((row) => ({
      match_id: row.match_id,
      league: row.league,
      season: row.season,
      start_date: row.start_date,
      venue: row.venue,
      winner: row.winner,
      winner_runs: row.winner_runs,
      winner_wickets: row.winner_wickets,
      team1: row.team1,
      team2: row.team2,
      innings1_score: Number(row.innings1_score),
      innings2_score: Number(row.innings2_score),
      innings1_wickets: Number(row.innings1_wickets),
      innings2_wickets: Number(row.innings2_wickets),
    })),
    totalCount,
    seasons: seasons.map((s) => s.season),
  };
}

function formatMatchResult(row: {
  winner: string | null;
  winner_runs: number | null;
  winner_wickets: number | null;
  team1: string | null;
  team2: string | null;
  innings1_score: number;
  innings2_score: number;
  innings2_wickets: number;
}): string {
  if (row.winner) {
    if (row.winner_runs && row.winner_runs > 0) {
      return `${row.winner} won by ${row.winner_runs} runs`;
    }
    if (row.winner_wickets && row.winner_wickets > 0) {
      return `${row.winner} won by ${row.winner_wickets} wickets`;
    }
    return `${row.winner} won`;
  }

  if (row.innings1_score === row.innings2_score) {
    return 'Match Tied';
  }

  if (row.innings1_score > row.innings2_score) {
    return `${row.team1} won by ${row.innings1_score - row.innings2_score} runs`;
  }
  return `${row.team2} won by ${10 - row.innings2_wickets} wickets`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const season = searchParams.get('season');
    const league = validateLeague(searchParams.get('league'));

    const {
      matches: matchData,
      totalCount,
      seasons,
    } = await getMatchesAndMetadata(league, season, page, limit);

    const matches = matchData.map((row) => ({
      id: row.match_id,
      league: row.league,
      season: row.season,
      startDate: row.start_date,
      venue: row.venue,
      team1: row.team1,
      team2: row.team2,
      innings1Score: `${row.innings1_score}/${row.innings1_wickets}`,
      innings2Score: `${row.innings2_score}/${row.innings2_wickets}`,
      result: formatMatchResult(row),
    }));

    return NextResponse.json({
      matches,
      league,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      },
      seasons,
      metadata: {
        availableLeagues: VALID_LEAGUES,
        totalRecords: totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching matches:', error);

    if (error instanceof Error && error.message.includes('Invalid league')) {
      return NextResponse.json(
        {
          error: error.message,
          code: 'INVALID_LEAGUE',
          availableLeagues: VALID_LEAGUES,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
