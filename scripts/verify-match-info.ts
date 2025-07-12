import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMatchInfo() {
  console.log('🔍 Verifying WPL Match Info Data...\n');

  try {
    // Check total counts
    const matchInfoCount = await prisma.wplMatchInfo.count();
    const teamCount = await prisma.wplTeam.count();
    const playerCount = await prisma.wplPlayer.count();
    const officialCount = await prisma.wplOfficial.count();
    const peopleRegistryCount = await prisma.wplPersonRegistry.count();

    console.log('📊 Data Counts:');
    console.log(`- Match Info: ${matchInfoCount}`);
    console.log(`- Teams: ${teamCount}`);
    console.log(`- Players: ${playerCount}`);
    console.log(`- Officials: ${officialCount}`);
    console.log(`- People Registry: ${peopleRegistryCount}\n`);

    // Get sample match info with related data
    const sampleMatch = await prisma.wplMatchInfo.findFirst({
      include: {
        teams: true,
        players: true,
        officials: true,
        peopleRegistry: true,
      },
    });

    if (sampleMatch) {
      console.log('🏏 Sample Match Info:');
      console.log(`- Match ID: ${sampleMatch.id}`);
      console.log(`- Season: ${sampleMatch.season}`);
      console.log(`- Date: ${sampleMatch.date.toDateString()}`);
      console.log(`- Event: ${sampleMatch.event}`);
      console.log(`- Match Number: ${sampleMatch.matchNumber}`);
      console.log(`- Venue: ${sampleMatch.venue}`);
      console.log(`- City: ${sampleMatch.city}`);
      console.log(`- Toss Winner: ${sampleMatch.tossWinner}`);
      console.log(`- Toss Decision: ${sampleMatch.tossDecision}`);
      console.log(`- Winner: ${sampleMatch.winner || 'N/A'}`);
      console.log(`- Player of Match: ${sampleMatch.playerOfMatch || 'N/A'}\n`);

      console.log('👥 Teams:');
      sampleMatch.teams.forEach((team, index) => {
        console.log(`  ${index + 1}. ${team.teamName}`);
      });

      console.log('\n🏃 Players (first 5):');
      sampleMatch.players.slice(0, 5).forEach((player, index) => {
        console.log(`  ${index + 1}. ${player.playerName} (${player.teamName})`);
      });

      console.log('\n👨‍⚖️ Officials:');
      sampleMatch.officials.forEach((official, index) => {
        console.log(`  ${index + 1}. ${official.officialName} (${official.officialType})`);
      });

      console.log('\n📋 People Registry (first 3):');
      sampleMatch.peopleRegistry.slice(0, 3).forEach((person, index) => {
        console.log(`  ${index + 1}. ${person.personName} - ${person.registryId}`);
      });
    }

    // Check unique seasons
    const seasons = await prisma.wplMatchInfo.findMany({
      select: { season: true },
      distinct: ['season'],
    });

    console.log('\n📅 Seasons:');
    seasons.forEach((season, index) => {
      console.log(`  ${index + 1}. ${season.season}`);
    });

    // Check unique venues
    const venues = await prisma.wplMatchInfo.findMany({
      select: { venue: true },
      distinct: ['venue'],
      take: 5,
    });

    console.log('\n🏟️ Venues (first 5):');
    venues.forEach((venue, index) => {
      console.log(`  ${index + 1}. ${venue.venue}`);
    });

    // Check match date range
    const dateRange = await prisma.wplMatchInfo.aggregate({
      _min: { date: true },
      _max: { date: true },
    });

    console.log('\n📆 Date Range:');
    console.log(`  From: ${dateRange._min.date?.toDateString()}`);
    console.log(`  To: ${dateRange._max.date?.toDateString()}`);

    // Check teams distribution
    const teamStats = await prisma.wplTeam.groupBy({
      by: ['teamName'],
      _count: { teamName: true },
      orderBy: { _count: { teamName: 'desc' } },
    });

    console.log('\n🏆 Team Appearances:');
    teamStats.forEach((team, index) => {
      console.log(`  ${index + 1}. ${team.teamName}: ${team._count.teamName} matches`);
    });

    console.log('\n✅ Verification completed successfully!');

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyMatchInfo();
