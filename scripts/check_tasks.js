/**
 * Quick Database Check - List all tasks
 */

import prisma from '../src/database/client.js';

async function checkTasks() {
    try {
        const tasks = await prisma.task.findMany({
            include: {
                agents: {
                    include: {
                        agent: true
                    }
                }
            }
        });

        console.log(`\n📊 Total tasks in database: ${tasks.length}\n`);

        if (tasks.length === 0) {
            console.log('❌ No tasks found in database!');
            console.log('The tasks may not have been created successfully.\n');
        } else {
            tasks.forEach((task, index) => {
                console.log(`${index + 1}. ${task.title}`);
                console.log(`   Status: ${task.status}`);
                console.log(`   Priority: ${task.priority}`);
                console.log(`   Agents: ${task.agents.map(ta => ta.agent.name).join(', ')}`);
                console.log('');
            });
        }

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error checking tasks:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

checkTasks();
