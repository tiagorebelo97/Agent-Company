const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatestTasks() {
    try {
        console.log('🔍 Checking latest task executions...\n');

        const tasks = await prisma.task.findMany({
            where: {
                type: 'agent_analysis',
                status: 'completed'
            },
            orderBy: { updatedAt: 'desc' },
            take: 2,
            include: {
                agents: {
                    include: {
                        agent: true
                    }
                }
            }
        });

        for (const task of tasks) {
            console.log(`\n${'='.repeat(80)}`);
            console.log(`Task: ${task.title}`);
            console.log(`Agent: ${task.agents[0]?.agent.name || 'Unknown'}`);
            console.log(`Status: ${task.status}`);
            console.log(`Updated: ${task.updatedAt}`);
            console.log(`${'='.repeat(80)}\n`);

            if (task.result) {
                try {
                    const result = JSON.parse(task.result);
                    console.log('Result:');
                    console.log(JSON.stringify(result, null, 2));
                } catch (e) {
                    console.log('Result (raw):');
                    console.log(task.result);
                }
            } else {
                console.log('No result');
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

checkLatestTasks();
