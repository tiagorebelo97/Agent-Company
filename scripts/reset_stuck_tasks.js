/**
 * Reset Stuck Tasks
 * 
 * Resets tasks that are stuck in 'in_progress' back to 'todo'
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetStuckTasks() {
    console.log('🔄 Resetting stuck tasks...\n');

    try {
        // Find tasks stuck in in_progress
        const stuckTasks = await prisma.task.findMany({
            where: {
                status: 'in_progress'
            }
        });

        console.log(`Found ${stuckTasks.length} stuck tasks\n`);

        if (stuckTasks.length === 0) {
            console.log('✅ No stuck tasks found!');
            return;
        }

        // Reset to todo
        for (const task of stuckTasks) {
            await prisma.task.update({
                where: { id: task.id },
                data: { status: 'todo' }
            });
            console.log(`✅ Reset: "${task.title}"`);
        }

        console.log(`\n🎉 Reset ${stuckTasks.length} tasks to 'todo'`);
        console.log('⏳ TaskMonitor will pick them up within 30s...');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

resetStuckTasks();
