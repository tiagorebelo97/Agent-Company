const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTaskAssignment() {
    try {
        console.log('🔍 Checking task assignment...\n');

        const task = await prisma.task.findUnique({
            where: { id: 'd5184e33-e84f-4e4d-93ad-e5612b2dcb03' },
            include: {
                agents: {
                    include: {
                        agent: true
                    }
                }
            }
        });

        if (task) {
            console.log(`Task: ${task.title}`);
            console.log(`Type: ${task.type}`);
            console.log(`Status: ${task.status}`);
            console.log(`AssignedToId: ${task.assignedToId}`);
            console.log(`Agents relation: ${task.agents.length} agents`);
            task.agents.forEach(ta => {
                console.log(`  - ${ta.agent.name} (${ta.agent.id})`);
            });

            if (task.requirements) {
                console.log(`\nRequirements:`);
                console.log(task.requirements);
            }

            if (task.result) {
                console.log(`\nResult:`);
                console.log(task.result.substring(0, 500));
            }
        } else {
            console.log('Task not found');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkTaskAssignment();
