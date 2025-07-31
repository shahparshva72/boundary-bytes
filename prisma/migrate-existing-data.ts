import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting migration of existing WPL data...');

  try {
    // Update existing WPL matches
    const matchUpdateResult = await prisma.wplMatch.updateMany({
      where: {
        league: {
          not: 'IPL', // Don't update IPL records if they exist
        },
      },
      data: {
        league: 'WPL',
      },
    });

    console.log(`✅ Updated ${matchUpdateResult.count} WPL match records`);

    // Update existing WPL match info
    const matchInfoUpdateResult = await prisma.wplMatchInfo.updateMany({
      where: {
        league: {
          not: 'IPL', // Don't update IPL records if they exist
        },
      },
      data: {
        league: 'WPL',
      },
    });

    console.log(`✅ Updated ${matchInfoUpdateResult.count} WPL match info records`);

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during migration:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
