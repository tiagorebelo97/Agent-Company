const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTaskResults() {
    try {
        console.log('🔍 Checking task results...\n');

        const tasks = await prisma.task.findMany({
            where: {
                type: 'agent_analysis',
                status: 'completed'
            },
            orderBy: { createdAt: 'desc' },
            take: 6
        });

        for (const task of tasks) {
            console.log(`\n📋 Task: ${task.title}`);
            console.log(`   Status: ${task.status}`);
            console.log(`   Assigned to: ${task.assignedToId}`);

            if (task.result) {
                try {
                    const result = JSON.parse(task.result);
                    console.log(`   Result:`, JSON.stringify(result, null, 2).substring(0, 500));
                } catch (e) {
                    console.log(`   Result (raw):`, task.result.substring(0, 300));
                }
            } else {
                console.log(`   Result: null`);
            }

            if (task.error) {
                console.log(`   Error:`, task.error.substring(0, 200));
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

checkTaskResults();
