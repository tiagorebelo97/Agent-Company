const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPrismaFields() {
    try {
        const projects = await prisma.project.findMany({
            where: {},
            include: {
                _count: {
                    select: { tasks: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const mason = projects.find(p => p.name === 'Mason');
        console.log('Mason found:', !!mason);
        console.log('Fields returned by Prisma:', Object.keys(mason));
        console.log('Has businessModel:', 'businessModel' in mason);
        console.log('businessModel value:', mason.businessModel ? 'EXISTS (' + mason.businessModel.length + ' chars)' : 'NULL');

    } catch (error) {
        console.error('ERROR:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testPrismaFields();
