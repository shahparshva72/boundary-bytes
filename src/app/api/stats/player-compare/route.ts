import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const VALID_LEAGUES = ['WPL', 'IPL', 'BBL', 'WBBL', 'SA20'] as const;
type League = (typeof VALID_LEAGUES)[number];

function validateLeague(league: string | null): League {
  if (!league) return 'WPL';
  if (VALID_LEAGUES.includes(league as League)) {
    return league as League;
  }
  throw new Error(`Invalid league: ${league}. Valid leagues are: ${VALID_LEAGUES.join(', ')}`);
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
    const statType = searchParams.get('statType') || 'both';
    const league = validateLeague(searchParams.get('league'));

    if (!playersParam) {
      return NextResponse.json({ error: 'Players parameter is required' }, { status: 400 });
    }

    const players = playersParam.split(',').map((p) => p.trim());

    if (players.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 players are required for comparison' },
        { status: 400 },
      );
    }

    if (players.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 players can be compared' }, { status: 400 });
    }

    const comparedPlayers = [];

    for (const player of players) {
      const playerData: {
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
      } = { name: player };

      if (statType === 'batting' || statType === 'both') {
        const battingParams: (string | string[])[] = [player, league];
        let paramIndex = 3;

        let seasonFilter = '';
        if (seasons.length > 0) {
          seasonFilter = ` AND m.season = ANY($${paramIndex}::text[])`;
          battingParams.push(seasons);
          paramIndex++;
        }

        let teamFilter = '';
        if (team) {
          teamFilter = ` AND d.batting_team = $${paramIndex}`;
          battingParams.push(team);
        }

        const battingQuery = `
          WITH innings_data AS (
            SELECT
              d.match_id,
              d.innings,
              SUM(d.runs_off_bat) as innings_runs,
              MAX(CASE WHEN d.player_dismissed = d.striker THEN 1 ELSE 0 END) as was_out
            FROM wpl_delivery d
            JOIN wpl_match m ON d.match_id = m.match_id
            WHERE d.striker = $1 AND m.league = $2 AND d.innings <= 2${seasonFilter}${teamFilter}
            GROUP BY d.match_id, d.innings
          )
          SELECT
            $1 as striker,
            COALESCE(SUM(d.runs_off_bat), 0) as runs,
            COUNT(*) FILTER (WHERE d.wides = 0) as balls_faced,
            (SELECT COUNT(*) FROM innings_data) as innings,
            (SELECT COUNT(*) FROM innings_data WHERE was_out = 0) as not_outs,
            COALESCE((SELECT MAX(innings_runs) FROM innings_data), 0) as highest_score,
            COUNT(*) FILTER (WHERE d.runs_off_bat = 4) as fours,
            COUNT(*) FILTER (WHERE d.runs_off_bat = 6) as sixes,
            (SELECT COUNT(*) FROM innings_data WHERE innings_runs >= 50 AND innings_runs < 100) as fifties,
            (SELECT COUNT(*) FROM innings_data WHERE innings_runs >= 100) as hundreds
          FROM wpl_delivery d
          JOIN wpl_match m ON d.match_id = m.match_id
          WHERE d.striker = $1 AND m.league = $2 AND d.innings <= 2${seasonFilter}${teamFilter}
        `;

        const battingStats = await prisma.$queryRawUnsafe<BattingRow[]>(
          battingQuery,
          ...battingParams,
        );

        if (battingStats.length > 0) {
          const b = battingStats[0];
          const runs = Number(b.runs);
          const ballsFaced = Number(b.balls_faced);
          const innings = Number(b.innings);
          const notOuts = Number(b.not_outs);
          const dismissals = innings - notOuts;

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

      if (statType === 'bowling' || statType === 'both') {
        const bowlingParams: (string | string[])[] = [player, league];
        let paramIndex = 3;

        let seasonFilter = '';
        if (seasons.length > 0) {
          seasonFilter = ` AND m.season = ANY($${paramIndex}::text[])`;
          bowlingParams.push(seasons);
          paramIndex++;
        }

        let teamFilter = '';
        if (team) {
          teamFilter = ` AND d.bowling_team = $${paramIndex}`;
          bowlingParams.push(team);
        }

        const bowlingQuery = `
          WITH bowling_innings AS (
            SELECT
              d.match_id,
              d.innings,
              COUNT(*) FILTER (WHERE d.player_dismissed IS NOT NULL AND d.player_dismissed != '') as wickets_in_innings
            FROM wpl_delivery d
            JOIN wpl_match m ON d.match_id = m.match_id
            WHERE d.bowler = $1 AND m.league = $2 AND d.innings <= 2${seasonFilter}${teamFilter}
            GROUP BY d.match_id, d.innings
          )
          SELECT
            $1 as bowler,
            COUNT(*) FILTER (WHERE d.player_dismissed IS NOT NULL AND d.player_dismissed != '') as wickets,
            COUNT(*) FILTER (WHERE d.wides = 0 AND d.noballs = 0) as balls_bowled,
            COALESCE(SUM(d.runs_off_bat + d.wides + d.noballs), 0) as runs_conceded,
            (SELECT COUNT(*) FROM bowling_innings) as innings,
            (SELECT COUNT(*) FROM bowling_innings WHERE wickets_in_innings >= 4 AND wickets_in_innings < 5) as four_wickets,
            (SELECT COUNT(*) FROM bowling_innings WHERE wickets_in_innings >= 5) as five_wickets
          FROM wpl_delivery d
          JOIN wpl_match m ON d.match_id = m.match_id
          WHERE d.bowler = $1 AND m.league = $2 AND d.innings <= 2${seasonFilter}${teamFilter}
        `;

        const bowlingStats = await prisma.$queryRawUnsafe<BowlingRow[]>(
          bowlingQuery,
          ...bowlingParams,
        );

        if (bowlingStats.length > 0) {
          const bw = bowlingStats[0];
          const wickets = Number(bw.wickets);
          const ballsBowled = Number(bw.balls_bowled);
          const runsConceded = Number(bw.runs_conceded);
          const overs = ballsBowled / 6;

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

      comparedPlayers.push(playerData);
    }

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
        playerCount: players.length,
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

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
