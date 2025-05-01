import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// Path to the CSV directory
const CSV_DIR = path.join(process.cwd(), 'wpl_csv2');

// Type definition for a row in the CSV file
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
  console.log('🌱 Starting seed process...');
  
  // Get all CSV files in the directory
  const files = fs.readdirSync(CSV_DIR);
  
  // Filter for only the main ball-by-ball files (ignore the _info files)
  const matchFiles: string[] = [];
  
  files.forEach(file => {
    if (!file.endsWith('.csv') || file.includes('_info')) return;
    matchFiles.push(path.join(CSV_DIR, file));
  });
  
  console.log(`Found ${matchFiles.length} matches to process`);
  
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
        trim: true 
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
      
      console.log(`Processed match ${matchId}: ${deliveries.length} deliveries`);
    } catch (error) {
      console.error(`Error processing match file ${matchFile}:`, error);
    }
  }
  
  console.log(`✅ Seed completed: ${processedMatches} matches and ${processedDeliveries} deliveries processed`);
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
