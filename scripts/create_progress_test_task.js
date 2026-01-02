/**
 * Create Test Task for Progress Tracking
 * 
 * Creates a task to test the new real-time progress tracking feature
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createProgressTestTask() {
    console.log('🧪 Creating test task for progress tracking...\n');

    try {
        const task = await prisma.task.create({
            data: {
                title: 'Create Real-time Notifications Component',
                description: 'Build a React component that displays real-time notifications for task updates, agent activities, and system events. Include toast notifications and a notification center.',
                priority: 'medium',
                tags: JSON.stringify(['frontend', 'notifications', 'real-time']),
                status: 'todo',
                requirements: JSON.stringify({
                    features: [
                        'Toast notifications for events',
                        'Notification center dropdown',
                        'Mark as read functionality',
                        'Real-time updates via WebSocket',
                        'Notification history',
                        'Sound alerts (optional)'
                    ]
                })
            }
        });

        // Assign to Frontend Engineer
        await prisma.taskAgent.create({
            data: {
                taskId: task.id,
                agentId: 'frontend'
            }
        });

        console.log(`✅ Created task: "${task.title}"`);
        console.log(`   ID: ${task.id}`);
        console.log(`   Status: ${task.status}`);
        console.log(`   Agent: Frontend Engineer`);
        console.log('\n📊 This task will test:');
        console.log('   - Real-time progress bar updates');
        console.log('   - Activity log streaming');
        console.log('   - Current activity display');
        console.log('   - File modification tracking');
        console.log('\n⏳ TaskMonitor will assign within 30s...');
        console.log('💡 Open TaskModal while task is in_progress to see live updates!');

    } catch (error) {
        console.error('❌ Error creating task:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createProgressTestTask();
