const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDates() {
  try {
    console.log('Checking database records...');
    
    // Get a few sample records
    const matches = await prisma.matchHistory.findMany({
      take: 5,
      orderBy: { id: 'asc' }
    });
    
    console.log('Sample matches:');
    matches.forEach(match => {
      console.log(`ID: ${match.id}, Match: ${match.match}`);
      console.log(`Date: ${match.date} (Type: ${typeof match.date})`);
      console.log('---');
    });
    
    console.log('\nRaw date values:');
    const rawResults = await prisma.$queryRaw`SELECT id, match, date FROM match_history LIMIT 5`;
    console.log(JSON.stringify(rawResults, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDates().catch(console.error);