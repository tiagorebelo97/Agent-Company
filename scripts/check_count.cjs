const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.recommendation.count().then(c => {
    console.log('FINAL_COUNT:' + c);
    process.exit(0);
});
