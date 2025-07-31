import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// League configuration
interface LeagueConfig {
  league: 'WPL' | 'IPL';
  csvDirectory: string;
  defaultValues: {
    league: string;
  };
}

const LEAGUE_CONFIGS: LeagueConfig[] = [
  {
    league: 'WPL',
    csvDirectory: path.join(process.cwd(), 'wpl_csv2'),
    defaultValues: {
      league: 'WPL',
    },
  },
  {
    league: 'IPL',
    csvDirectory: path.join(process.cwd(), 'ipl_csv2'),
    defaultValues: {
      league: 'IPL',
    },
  },
];

// Type definitions (same as existing seed.ts)
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

interface InfoRow {
  type: string;
  key: string;
  value: string;
  extra?: string;
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

async function main() {
  const args = process.argv.slice(2);
  const targetLeague = args[0] as 'WPL' | 'IPL' | undefined;

  if (targetLeague && !['WPL', 'IPL'].includes(targetLeague)) {
    console.error('Invalid league. Use: WPL or IPL');
    process.exit(1);
  }

  const configsToProcess = targetLeague
    ? LEAGUE_CONFIGS.filter((config) => config.league === targetLeague)
    : LEAGUE_CONFIGS;

  console.log('🌱 Starting multi-league seed process...');

  for (const config of configsToProcess) {
    console.log(`\n📊 Processing ${config.league} data from ${config.csvDirectory}`);
    await processLeague(config);
  }

  console.log('\n✅ Multi-league seed completed successfully!');
}

async function processLeague(config: LeagueConfig) {
  if (!fs.existsSync(config.csvDirectory)) {
    console.warn(`Directory ${config.csvDirectory} does not exist, skipping ${config.league}`);
    return;
  }

  // Get all CSV files in the directory
  const files = fs.readdirSync(config.csvDirectory);

  // Filter for only the main ball-by-ball files (ignore the _info files)
  const matchFiles: string[] = [];
  const infoFiles: string[] = [];

  files.forEach((file) => {
    if (!file.endsWith('.csv')) return;
    if (file.includes('_info')) {
      infoFiles.push(path.join(config.csvDirectory, file));
    } else {
      matchFiles.push(path.join(config.csvDirectory, file));
    }
  });

  console.log(
    `Found ${matchFiles.length} matches and ${infoFiles.length} info files for ${config.league}`,
  );

  // Process info files first
  await processInfoFiles(infoFiles, config);

  // Process each match
  let processedMatches = 0;
  let processedDeliveries = 0;

  for (const matchFile of matchFiles) {
    try {
      // Extract match ID from filename
      const filename = path.basename(matchFile);
      const matchIdRegex = /^(\d+)\.csv$/;
      const matchIdMatch = matchIdRegex.exec(filename);

      if (!matchIdMatch?.at(1)) {
        console.warn(`Could not extract match ID from ${filename}, skipping`);
        continue;
      }

      const matchId = parseInt(matchIdMatch[1]!, 10);

      // Read and parse match data
      const dataContent = fs.readFileSync(matchFile, 'utf-8');
      const dataRows = parse(dataContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as DeliveryRow[];

      if (dataRows.length === 0) {
        console.warn(`No data rows for match ${matchId}, skipping`);
        continue;
      }

      // Extract match details from the first row of data
      const firstRow = dataRows[0];
      if (!firstRow) {
        console.warn(`First row is undefined for match ${matchId}, skipping`);
        continue;
      }

      const match = {
        id: matchId,
        league: config.defaultValues.league,
        season: firstRow.season,
        startDate: new Date(firstRow.start_date),
        venue: firstRow.venue.replace(/^"(.+)"$/, '$1'), // Remove surrounding quotes if present
      };

      // Create or update match
      await prisma.wplMatch.upsert({
        where: { id: match.id },
        update: match,
        create: match,
      });

      processedMatches++;

      // Process deliveries for this match
      const deliveries = [];

      for (const row of dataRows) {
        const delivery = {
          matchId: matchId,
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
        };

        deliveries.push(delivery);
      }

      // Use createMany for better performance with large datasets
      if (deliveries.length > 0) {
        await prisma.wplDelivery.createMany({
          data: deliveries,
          skipDuplicates: true, // Skip duplicates based on the model's unique constraints
        });

        processedDeliveries += deliveries.length;
      }

      console.log(`Processed ${config.league} match ${matchId}: ${deliveries.length} deliveries`);
    } catch (error) {
      console.error(`Error processing ${config.league} match file ${matchFile}:`, error);
    }
  }

  console.log(
    `✅ ${config.league} seed completed: ${processedMatches} matches and ${processedDeliveries} deliveries processed`,
  );
}

async function processInfoFiles(infoFiles: string[], config: LeagueConfig) {
  console.log(`Processing ${config.league} match info files...`);

  for (const infoFile of infoFiles) {
    try {
      // Extract match ID from filename
      const filename = path.basename(infoFile);
      const matchIdRegex = /^(\d+)_info\.csv$/;
      const matchIdMatch = matchIdRegex.exec(filename);

      if (!matchIdMatch?.at(1)) {
        console.warn(`Could not extract match ID from ${filename}, skipping`);
        continue;
      }

      const matchId = parseInt(matchIdMatch[1]!, 10);

      // Read and parse info data
      const infoContent = fs.readFileSync(infoFile, 'utf-8');
      const infoRows = parse(infoContent, {
        columns: false,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      }) as string[][];

      // Parse the info data
      const matchInfo = parseMatchInfo(infoRows);

      // Create or update match info
      await prisma.wplMatchInfo.upsert({
        where: { id: matchId },
        update: {
          league: config.defaultValues.league,
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
          league: config.defaultValues.league,
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

      // Delete existing related data to avoid duplicates
      await prisma.wplTeam.deleteMany({ where: { matchId } });
      await prisma.wplPlayer.deleteMany({ where: { matchId } });
      await prisma.wplOfficial.deleteMany({ where: { matchId } });
      await prisma.wplPersonRegistry.deleteMany({ where: { matchId } });

      // Insert teams
      if (matchInfo.teams.length > 0) {
        await prisma.wplTeam.createMany({
          data: matchInfo.teams.map((team) => ({
            matchId,
            teamName: team,
          })),
        });
      }

      // Insert players
      if (matchInfo.players.length > 0) {
        await prisma.wplPlayer.createMany({
          data: matchInfo.players.map((player) => ({
            matchId,
            teamName: player.team,
            playerName: player.player,
          })),
        });
      }

      // Insert officials
      if (matchInfo.officials.length > 0) {
        await prisma.wplOfficial.createMany({
          data: matchInfo.officials.map((official) => ({
            matchId,
            officialType: official.type,
            officialName: official.name,
          })),
        });
      }

      // Insert people registry
      if (matchInfo.peopleRegistry.length > 0) {
        await prisma.wplPersonRegistry.createMany({
          data: matchInfo.peopleRegistry.map((person) => ({
            matchId,
            personName: person.name,
            registryId: person.id,
          })),
        });
      }

      console.log(`Processed ${config.league} info for match ${matchId}`);
    } catch (error) {
      console.error(`Error processing ${config.league} info file ${infoFile}:`, error);
    }
  }
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
          if (extra) {
            matchInfo.players.push({ team: value, player: extra });
          }
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
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
