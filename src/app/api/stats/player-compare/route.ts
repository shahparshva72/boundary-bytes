import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const VALID_LEAGUES = ['WPL', 'IPL', 'BBL', 'WBBL', 'SA20'] as const;
const VALID_STAT_TYPES = ['batting', 'bowling', 'both'] as const;
type League = (typeof VALID_LEAGUES)[number];
type StatType = (typeof VALID_STAT_TYPES)[number];

function validateLeague(league: string | null): League {
  if (!league) return 'WPL';
  if (VALID_LEAGUES.includes(league as League)) {
    return league as League;
  }
  throw new Error(`Invalid league: ${league}. Valid leagues are: ${VALID_LEAGUES.join(', ')}`);
}

function validateStatType(statType: string | null): StatType {
  if (!statType) return 'both';
  if (VALID_STAT_TYPES.includes(statType as StatType)) {
    return statType as StatType;
  }
  throw new Error(`Invalid statType: ${statType}. Valid types are: ${VALID_STAT_TYPES.join(', ')}`);
}

type BattingRow = {
  striker: string;
  runs: bigint;
  balls_faced: bigint;
  innings: bigint;
  not_outs: bigint;
  highest_score: bigint;
  fours: bigint;
  sixes: bigint;
  fifties: bigint;
  hundreds: bigint;
};

type BowlingRow = {
  bowler: string;
  wickets: bigint;
  balls_bowled: bigint;
  runs_conceded: bigint;
  innings: bigint;
  four_wickets: bigint;
  five_wickets: bigint;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playersParam = searchParams.get('players');
    const seasonsParam = searchParams.get('seasons');
    const seasons = seasonsParam ? seasonsParam.split(',').map((s) => s.trim()) : [];
    const team = searchParams.get('team');
    const statType = validateStatType(searchParams.get('statType'));
    const league = validateLeague(searchParams.get('league'));

    if (!playersParam) {
      return NextResponse.json({ error: 'Players parameter is required' }, { status: 400 });
    }

    const players = playersParam
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    const uniquePlayers = [...new Set(players)];

    if (uniquePlayers.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 players are required for comparison' },
        { status: 400 },
      );
    }

    if (uniquePlayers.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 players can be compared' }, { status: 400 });
    }

    if (seasons.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 seasons can be filtered' }, { status: 400 });
    }

    type PlayerData = {
      name: string;
      batting?: {
        runs: number;
        ballsFaced: number;
        innings: number;
        notOuts: number;
        highestScore: number;
        strikeRate: number;
        average: number;
        fours: number;
        sixes: number;
        fifties: number;
        hundreds: number;
      };
      bowling?: {
        wickets: number;
        ballsBowled: number;
        runsConceded: number;
        innings: number;
        economy: number;
        average: number;
        strikeRate: number;
        fourWickets: number;
        fiveWickets: number;
      };
    };

    const playerDataMap = new Map<string, PlayerData>();
    uniquePlayers.forEach((p) => playerDataMap.set(p, { name: p }));

    const seasonFilter =
      seasons.length > 0 ? Prisma.sql`AND m.season = ANY(${seasons}::text[])` : Prisma.empty;
    const teamFilterBatting = team ? Prisma.sql`AND d.batting_team = ${team}` : Prisma.empty;
    const teamFilterBowling = team ? Prisma.sql`AND d.bowling_team = ${team}` : Prisma.empty;

    if (statType === 'batting' || statType === 'both') {
      const battingStats = await prisma.$queryRaw<BattingRow[]>`
        WITH innings_data AS (
          SELECT
            d.striker,
            d.match_id,
            d.innings,
            SUM(d.runs_off_bat) as innings_runs,
            MAX(CASE WHEN d.player_dismissed = d.striker THEN 1 ELSE 0 END) as was_out
          FROM wpl_delivery d
          JOIN wpl_match m ON d.match_id = m.match_id
          WHERE d.striker = ANY(${uniquePlayers}::text[]) 
            AND m.league = ${league} 
            AND d.innings <= 2
            ${seasonFilter}
            ${teamFilterBatting}
          GROUP BY d.striker, d.match_id, d.innings
        ),
        innings_agg AS (
          SELECT
            striker,
            COUNT(*) as innings,
            COUNT(*) FILTER (WHERE was_out = 0) as not_outs,
            MAX(innings_runs) as highest_score,
            COUNT(*) FILTER (WHERE innings_runs >= 50 AND innings_runs < 100) as fifties,
            COUNT(*) FILTER (WHERE innings_runs >= 100) as hundreds
          FROM innings_data
          GROUP BY striker
        )
        SELECT
          d.striker,
          COALESCE(SUM(d.runs_off_bat), 0) as runs,
          COUNT(*) FILTER (WHERE d.wides = 0) as balls_faced,
          COALESCE(ia.innings, 0) as innings,
          COALESCE(ia.not_outs, 0) as not_outs,
          COALESCE(ia.highest_score, 0) as highest_score,
          COUNT(*) FILTER (WHERE d.runs_off_bat = 4) as fours,
          COUNT(*) FILTER (WHERE d.runs_off_bat = 6) as sixes,
          COALESCE(ia.fifties, 0) as fifties,
          COALESCE(ia.hundreds, 0) as hundreds
        FROM wpl_delivery d
        JOIN wpl_match m ON d.match_id = m.match_id
        LEFT JOIN innings_agg ia ON d.striker = ia.striker
        WHERE d.striker = ANY(${uniquePlayers}::text[]) 
          AND m.league = ${league} 
          AND d.innings <= 2
          ${seasonFilter}
          ${teamFilterBatting}
        GROUP BY d.striker, ia.innings, ia.not_outs, ia.highest_score, ia.fifties, ia.hundreds
      `;

      for (const b of battingStats) {
        const runs = Number(b.runs);
        const ballsFaced = Number(b.balls_faced);
        const innings = Number(b.innings);
        const notOuts = Number(b.not_outs);
        const dismissals = innings - notOuts;

        const playerData = playerDataMap.get(b.striker);
        if (playerData) {
          playerData.batting = {
            runs,
            ballsFaced,
            innings,
            notOuts,
            highestScore: Number(b.highest_score),
            strikeRate: ballsFaced > 0 ? parseFloat(((runs / ballsFaced) * 100).toFixed(2)) : 0,
            average: dismissals > 0 ? parseFloat((runs / dismissals).toFixed(2)) : runs,
            fours: Number(b.fours),
            sixes: Number(b.sixes),
            fifties: Number(b.fifties),
            hundreds: Number(b.hundreds),
          };
        }
      }
    }

    if (statType === 'bowling' || statType === 'both') {
      const bowlingStats = await prisma.$queryRaw<BowlingRow[]>`
        WITH bowling_innings AS (
          SELECT
            d.bowler,
            d.match_id,
            d.innings,
            COUNT(*) FILTER (
              WHERE d.player_dismissed IS NOT NULL 
              AND d.wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket')
            ) as wickets_in_innings
          FROM wpl_delivery d
          JOIN wpl_match m ON d.match_id = m.match_id
          WHERE d.bowler = ANY(${uniquePlayers}::text[]) 
            AND m.league = ${league} 
            AND d.innings <= 2
            ${seasonFilter}
            ${teamFilterBowling}
          GROUP BY d.bowler, d.match_id, d.innings
        ),
        innings_agg AS (
          SELECT
            bowler,
            COUNT(*) as innings,
            COUNT(*) FILTER (WHERE wickets_in_innings >= 4 AND wickets_in_innings < 5) as four_wickets,
            COUNT(*) FILTER (WHERE wickets_in_innings >= 5) as five_wickets
          FROM bowling_innings
          GROUP BY bowler
        )
        SELECT
          d.bowler,
          COUNT(*) FILTER (
            WHERE d.player_dismissed IS NOT NULL 
            AND d.wicket_type IN ('caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket')
          ) as wickets,
          COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0) as balls_bowled,
          COALESCE(SUM(d.runs_off_bat + d.wides + d.noballs), 0) as runs_conceded,
          COALESCE(ia.innings, 0) as innings,
          COALESCE(ia.four_wickets, 0) as four_wickets,
          COALESCE(ia.five_wickets, 0) as five_wickets
        FROM wpl_delivery d
        JOIN wpl_match m ON d.match_id = m.match_id
        LEFT JOIN innings_agg ia ON d.bowler = ia.bowler
        WHERE d.bowler = ANY(${uniquePlayers}::text[]) 
          AND m.league = ${league} 
          AND d.innings <= 2
          ${seasonFilter}
          ${teamFilterBowling}
        GROUP BY d.bowler, ia.innings, ia.four_wickets, ia.five_wickets
      `;

      for (const bw of bowlingStats) {
        const wickets = Number(bw.wickets);
        const ballsBowled = Number(bw.balls_bowled);
        const runsConceded = Number(bw.runs_conceded);
        const overs = ballsBowled / 6;

        const playerData = playerDataMap.get(bw.bowler);
        if (playerData) {
          playerData.bowling = {
            wickets,
            ballsBowled,
            runsConceded,
            innings: Number(bw.innings),
            economy: overs > 0 ? parseFloat((runsConceded / overs).toFixed(2)) : 0,
            average: wickets > 0 ? parseFloat((runsConceded / wickets).toFixed(2)) : 0,
            strikeRate: wickets > 0 ? parseFloat((ballsBowled / wickets).toFixed(2)) : 0,
            fourWickets: Number(bw.four_wickets),
            fiveWickets: Number(bw.five_wickets),
          };
        }
      }
    }

    const comparedPlayers = uniquePlayers.map((p) => playerDataMap.get(p)!);

    return NextResponse.json({
      data: {
        players: comparedPlayers,
        filters: {
          seasons: seasons.length > 0 ? seasons : null,
          team: team || null,
          statType,
        },
      },
      league,
      metadata: {
        availableLeagues: VALID_LEAGUES,
        playerCount: uniquePlayers.length,
      },
    });
  } catch (error) {
    console.error('Error fetching player comparison:', error);

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

    if (error instanceof Error && error.message.includes('Invalid statType')) {
      return NextResponse.json(
        {
          error: error.message,
          code: 'INVALID_STAT_TYPE',
          availableStatTypes: VALID_STAT_TYPES,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
