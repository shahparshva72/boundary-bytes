import 'dotenv/config';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SupportedLeague = 'WPL' | 'IPL' | 'BBL';

interface LeagueConfig {
  league: SupportedLeague;
  csvDirectory: string;
}

const LEAGUE_CONFIGS: LeagueConfig[] = [
  { league: 'WPL', csvDirectory: path.join(process.cwd(), 'wpl_csv2') },
  { league: 'IPL', csvDirectory: path.join(process.cwd(), 'ipl_csv2') },
  { league: 'BBL', csvDirectory: path.join(process.cwd(), 'bbl_csv2') },
];

interface DeliveryRow {
  match_id: string;
  season: string;
  start_date: string;
  venue: string;
  innings: string;
  ball: string;
  batting_team: string;
  bowling_team: string;
  striker: string;
  non_striker: string;
  bowler: string;
  runs_off_bat: string;
  extras: string;
  wides: string;
  noballs: string;
  byes: string;
  legbyes: string;
  penalty: string;
  wicket_type: string | null;
  player_dismissed: string | null;
  other_wicket_type: string | null;
  other_player_dismissed: string | null;
}

async function main() {
  const args = process.argv.slice(2);
  const targetLeague = (args[0] as SupportedLeague | undefined) ?? undefined;

  if (targetLeague && !['WPL', 'IPL', 'BBL'].includes(targetLeague)) {
    console.error('Invalid league. Use: WPL or IPL or BBL');
    process.exit(1);
  }

  const configsToProcess = targetLeague
    ? LEAGUE_CONFIGS.filter((c) => c.league === targetLeague)
    : LEAGUE_CONFIGS;

  console.log('🔎 Starting backfill for missing matches...');
  for (const config of configsToProcess) {
    await backfillLeague(config);
  }
  console.log('✅ Backfill completed.');
}

async function backfillLeague(config: LeagueConfig) {
  if (!fs.existsSync(config.csvDirectory)) {
    console.warn(`Directory ${config.csvDirectory} does not exist, skipping ${config.league}`);
    return;
  }

  // Build set of all matchIds from CSVs for this league
  const files = fs.readdirSync(config.csvDirectory).filter((f) => f.endsWith('.csv'));
  const matchIdRegex = /^(\d+)\.csv$/;
  const infoRegex = /^(\d+)_info\.csv$/;

  const csvMatchIds = new Set<number>();
  const infoFilesByMatchId = new Map<number, string>();
  const dataFilesByMatchId = new Map<number, string>();

  for (const file of files) {
    const full = path.join(config.csvDirectory, file);
    const info = infoRegex.exec(file);
    if (info?.[1]) {
      infoFilesByMatchId.set(parseInt(info[1], 10), full);
      continue;
    }
    const match = matchIdRegex.exec(file);
    if (match?.[1]) {
      const id = parseInt(match[1], 10);
      csvMatchIds.add(id);
      dataFilesByMatchId.set(id, full);
    }
  }

  // Query existing IDs from DB for this league
  const existing = await prisma.wplMatch.findMany({
    where: { league: config.league },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((m) => m.id));

  // Determine missing
  const missing = [...csvMatchIds].filter((id) => !existingIds.has(id));
  console.log(`\n${config.league}: ${missing.length} missing of ${csvMatchIds.size} CSV matches.`);
  if (missing.length === 0) return;

  // Backfill each missing match
  for (const matchId of missing) {
    const dataFile = dataFilesByMatchId.get(matchId);
    if (!dataFile) {
      console.warn(`${config.league} match ${matchId}: data CSV not found, skipping`);
      continue;
    }

    try {
      // Parse deliveries CSV
      const dataContent = fs.readFileSync(dataFile, 'utf-8');
      const dataRows = parse(dataContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as DeliveryRow[];

      if (dataRows.length === 0) {
        console.warn(`${config.league} match ${matchId}: empty data, skipping`);
        continue;
      }

      const first = dataRows[0];
      const match = {
        id: matchId,
        league: config.league,
        season: first.season,
        startDate: new Date(first.start_date),
        venue: first.venue.replace(/^"(.+)"$/, '$1'),
      } as const;

      // Upsert match
      await prisma.wplMatch.upsert({ where: { id: matchId }, update: match, create: match });

      // Upsert info if available
      const infoFile = infoFilesByMatchId.get(matchId);
      if (infoFile) {
        await upsertInfo(matchId, infoFile, config.league);
      }

      // Insert deliveries (skip duplicates)
      const deliveries = dataRows.map((row) => ({
        matchId,
        innings: parseInt(row.innings, 10),
        ball: row.ball,
        battingTeam: row.batting_team,
        bowlingTeam: row.bowling_team,
        striker: row.striker,
        nonStriker: row.non_striker,
        bowler: row.bowler,
        runsOffBat: parseInt(row.runs_off_bat, 10) || 0,
        extras: parseInt(row.extras, 10) || 0,
        wides: parseInt(row.wides, 10) || 0,
        noballs: parseInt(row.noballs, 10) || 0,
        byes: parseInt(row.byes, 10) || 0,
        legbyes: parseInt(row.legbyes, 10) || 0,
        penalty: parseInt(row.penalty, 10) || 0,
        wicketType: row.wicket_type ?? null,
        playerDismissed: row.player_dismissed ?? null,
        otherWicketType: row.other_wicket_type ?? null,
        otherPlayerDismissed: row.other_player_dismissed ?? null,
      }));

      if (deliveries.length > 0) {
        await prisma.wplDelivery.createMany({ data: deliveries, skipDuplicates: true });
      }

      console.log(
        `Backfilled ${config.league} match ${matchId} with ${deliveries.length} deliveries`,
      );
    } catch (err) {
      console.error(`Error backfilling ${config.league} match ${matchId}:`, err);
    }
  }
}

async function upsertInfo(matchId: number, infoFile: string, league: SupportedLeague) {
  const infoContent = fs.readFileSync(infoFile, 'utf-8');
  const rows = parse(infoContent, {
    columns: false,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as string[][];

  const matchInfo = parseMatchInfo(rows);

  await prisma.wplMatchInfo.upsert({
    where: { id: matchId },
    update: {
      league,
      version: matchInfo.version,
      ballsPerOver: matchInfo.ballsPerOver,
      gender: matchInfo.gender,
      season: matchInfo.season,
      date: new Date(matchInfo.date),
      event: matchInfo.event,
      matchNumber: matchInfo.matchNumber,
      venue: matchInfo.venue,
      city: matchInfo.city,
      tossWinner: matchInfo.tossWinner,
      tossDecision: matchInfo.tossDecision,
      playerOfMatch: matchInfo.playerOfMatch,
      winner: matchInfo.winner,
      winnerRuns: matchInfo.winnerRuns,
      winnerWickets: matchInfo.winnerWickets,
    },
    create: {
      id: matchId,
      league,
      version: matchInfo.version,
      ballsPerOver: matchInfo.ballsPerOver,
      gender: matchInfo.gender,
      season: matchInfo.season,
      date: new Date(matchInfo.date),
      event: matchInfo.event,
      matchNumber: matchInfo.matchNumber,
      venue: matchInfo.venue,
      city: matchInfo.city,
      tossWinner: matchInfo.tossWinner,
      tossDecision: matchInfo.tossDecision,
      playerOfMatch: matchInfo.playerOfMatch,
      winner: matchInfo.winner,
      winnerRuns: matchInfo.winnerRuns,
      winnerWickets: matchInfo.winnerWickets,
    },
  });

  // Refresh related tables (replace existing to avoid dupes)
  await prisma.wplTeam.deleteMany({ where: { matchId } });
  await prisma.wplPlayer.deleteMany({ where: { matchId } });
  await prisma.wplOfficial.deleteMany({ where: { matchId } });
  await prisma.wplPersonRegistry.deleteMany({ where: { matchId } });

  if (matchInfo.teams.length > 0) {
    await prisma.wplTeam.createMany({
      data: matchInfo.teams.map((team) => ({ matchId, teamName: team })),
    });
  }

  if (matchInfo.players.length > 0) {
    await prisma.wplPlayer.createMany({
      data: matchInfo.players.map((p) => ({ matchId, teamName: p.team, playerName: p.player })),
    });
  }

  if (matchInfo.officials.length > 0) {
    await prisma.wplOfficial.createMany({
      data: matchInfo.officials.map((o) => ({
        matchId,
        officialType: o.type,
        officialName: o.name,
      })),
    });
  }

  if (matchInfo.peopleRegistry.length > 0) {
    await prisma.wplPersonRegistry.createMany({
      data: matchInfo.peopleRegistry.map((r) => ({
        matchId,
        personName: r.name,
        registryId: r.id,
      })),
    });
  }
}

interface MatchInfo {
  version: string;
  ballsPerOver: number;
  teams: string[];
  gender: string;
  season: string;
  date: string;
  event: string;
  matchNumber: number;
  venue: string;
  city: string;
  tossWinner: string;
  tossDecision: string;
  playerOfMatch?: string;
  winner?: string;
  winnerRuns?: number;
  winnerWickets?: number;
  players: Array<{ team: string; player: string }>;
  officials: Array<{ type: string; name: string }>;
  peopleRegistry: Array<{ name: string; id: string }>;
}

function parseMatchInfo(rows: string[][]): MatchInfo {
  const matchInfo: MatchInfo = {
    version: '',
    ballsPerOver: 6,
    teams: [],
    gender: '',
    season: '',
    date: '',
    event: '',
    matchNumber: 0,
    venue: '',
    city: '',
    tossWinner: '',
    tossDecision: '',
    players: [],
    officials: [],
    peopleRegistry: [],
  };

  for (const row of rows) {
    if (row.length < 2) continue;
    const [type, key, value, extra] = row;
    if (type === 'version') {
      matchInfo.version = key;
    } else if (type === 'info') {
      switch (key) {
        case 'balls_per_over':
          matchInfo.ballsPerOver = parseInt(value, 10);
          break;
        case 'team':
          matchInfo.teams.push(value);
          break;
        case 'gender':
          matchInfo.gender = value;
          break;
        case 'season':
          matchInfo.season = value;
          break;
        case 'date':
          matchInfo.date = value;
          break;
        case 'event':
          matchInfo.event = value;
          break;
        case 'match_number':
          matchInfo.matchNumber = parseInt(value, 10);
          break;
        case 'venue':
          matchInfo.venue = value.replace(/^"(.+)"$/, '$1');
          break;
        case 'city':
          matchInfo.city = value;
          break;
        case 'toss_winner':
          matchInfo.tossWinner = value;
          break;
        case 'toss_decision':
          matchInfo.tossDecision = value;
          break;
        case 'player_of_match':
          matchInfo.playerOfMatch = value;
          break;
        case 'winner':
          matchInfo.winner = value;
          break;
        case 'winner_runs':
          matchInfo.winnerRuns = parseInt(value, 10);
          break;
        case 'winner_wickets':
          matchInfo.winnerWickets = parseInt(value, 10);
          break;
        case 'umpire':
        case 'reserve_umpire':
        case 'tv_umpire':
        case 'match_referee':
          matchInfo.officials.push({ type: key, name: value });
          break;
        case 'player':
          if (extra) matchInfo.players.push({ team: value, player: extra });
          break;
        case 'registry':
          if (value === 'people' && extra && row[4]) {
            matchInfo.peopleRegistry.push({ name: extra, id: row[4] });
          }
          break;
      }
    }
  }
  return matchInfo;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during backfill:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
