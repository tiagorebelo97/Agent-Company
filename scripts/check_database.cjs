const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        console.log('🔍 Checking database...\n');

        // Check tasks
        const tasks = await prisma.task.findMany({
            where: { type: 'agent_analysis' },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                project: { select: { name: true } }
            }
        });

        console.log(`📋 Found ${tasks.length} agent_analysis tasks:\n`);
        tasks.forEach(t => {
            console.log(`- [${t.project.name}] ${t.title}`);
            console.log(`  Status: ${t.status}`);
            console.log(`  Assigned to: ${t.assignedToId || 'none'}`);
            if (t.error) console.log(`  Error: ${t.error.substring(0, 100)}`);
            console.log('');
        });

        // Check recommendations
        const recommendations = await prisma.recommendation.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                project: { select: { name: true } }
            }
        });

        console.log(`\n📊 Found ${recommendations.length} recommendations:\n`);
        recommendations.forEach(r => {
            console.log(`- [${r.project.name}] ${r.title}`);
            console.log(`  Category: ${r.category || 'N/A'}`);
            console.log(`  Created by: ${r.createdBy}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
