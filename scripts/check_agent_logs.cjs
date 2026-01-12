const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAgentLogs() {
    try {
        console.log('🔍 Checking agent execution logs...\n');

        // Get the latest tasks
        const tasks = await prisma.task.findMany({
            where: {
                type: 'agent_analysis',
                status: 'completed'
            },
            orderBy: { updatedAt: 'desc' },
            take: 2
        });

        for (const task of tasks) {
            console.log(`\n${'='.repeat(80)}`);
            console.log(`Task: ${task.title}`);
            console.log(`${'='.repeat(80)}\n`);

            if (task.logs) {
                console.log('Logs:');
                console.log(task.logs);
            } else {
                console.log('No logs found');
            }

            if (task.error) {
                console.log('\nError:');
                console.log(task.error);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkAgentLogs();
