const { PrismaClient } = require('@prisma/client');

async function testPrismaConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing Prisma connection...');
    
    // Test User table
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User table exists and contains ${userCount} records`);
    } catch (error) {
      console.error('❌ Error accessing User table:', error.message);
    }
    
    // Test MatchHistory table
    try {
      const matchCount = await prisma.matchHistory.count();
      console.log(`✅ MatchHistory table exists and contains ${matchCount} records`);
    } catch (error) {
      console.error('❌ Error accessing MatchHistory table:', error.message);
    }
    
    console.log('\nPrisma client information:');
    console.log(prisma);
    
  } catch (error) {
    console.error('Error testing database connection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection();