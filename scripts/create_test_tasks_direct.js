/**
 * Create Test Tasks Directly via Prisma
 * Bypasses API to create tasks directly in database
 */

import prisma from '../src/database/client.js';

async function createTestTasks() {
    console.log('Creating test tasks directly in database...\\n');

    const tasks = [
        {
            title: 'Add Task Statistics Widget to Dashboard',
            description: 'Create a new component that displays task statistics: total tasks, tasks by status (todo, in_progress, review, done), and tasks by priority. Add this widget to the dashboard above the tab navigation.',
            priority: 'medium',
            status: 'todo',
            tags: JSON.stringify(['frontend', 'dashboard', 'statistics']),
            agentIds: ['frontend', 'design'],
            createdBy: 'system'
        },
        {
            title: 'Implement Real-time Task Comments',
            description: 'Add WebSocket event listeners for task comments so that when a user adds a comment to a task, all other users viewing that task see the comment appear in real-time without refreshing.',
            priority: 'low',
            status: 'todo',
            tags: JSON.stringify(['frontend', 'backend', 'websocket']),
            agentIds: ['frontend', 'backend'],
            createdBy: 'system'
        },
        {
            title: 'Write Tests for TaskBoard Drag-and-Drop',
            description: 'Create automated tests using Playwright to verify that tasks can be dragged between columns, status updates correctly, and WebSocket events are emitted. Test edge cases like dragging to invalid targets.',
            priority: 'high',
            status: 'todo',
            tags: JSON.stringify(['testing', 'playwright', 'taskboard']),
            agentIds: ['qa'],
            createdBy: 'system'
        }
    ];

    try {
        for (const taskData of tasks) {
            const { agentIds, ...taskFields } = taskData;

            // Create task
            const task = await prisma.task.create({
                data: taskFields
            });

            console.log(`✅ Created: "${task.title}"`);
            console.log(`   ID: ${task.id}`);
            console.log(`   Status: ${task.status}`);
            console.log(`   Priority: ${task.priority}`);

            // Assign agents
            if (agentIds && agentIds.length > 0) {
                for (const agentId of agentIds) {
                    await prisma.taskAgent.create({
                        data: {
                            taskId: task.id,
                            agentId
                        }
                    });
                }
                console.log(`   Assigned to: ${agentIds.join(', ')}`);
            }

            console.log('');
        }

        console.log('\\n🎯 Test tasks created successfully!');
        console.log('📊 Check the dashboard to see tasks appear in the TaskBoard.');
        console.log('🤖 TaskMonitor will assign them to agents within 30 seconds.\\n');

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error creating tasks:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

createTestTasks();
