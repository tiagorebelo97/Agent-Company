/**
 * Create Test Tasks for Agent Autonomy
 * 
 * This script creates initial tasks to test the agent autonomy system
 */

const API_URL = 'http://localhost:3001';

async function createTestTasks() {
    console.log('Creating test tasks for agent autonomy...\n');

    const tasks = [
        {
            title: 'Add Task Statistics Widget to Dashboard',
            description: 'Create a new component that displays task statistics: total tasks, tasks by status (todo, in_progress, review, done), and tasks by priority. Add this widget to the dashboard above the tab navigation.',
            priority: 'medium',
            status: 'todo',
            tags: ['frontend', 'dashboard', 'statistics'],
            agentIds: ['frontend', 'design'],
            createdBy: 'system'
        },
        {
            title: 'Implement Real-time Task Comments',
            description: 'Add WebSocket event listeners for task comments so that when a user adds a comment to a task, all other users viewing that task see the comment appear in real-time without refreshing.',
            priority: 'low',
            status: 'todo',
            tags: ['frontend', 'backend', 'websocket'],
            agentIds: ['frontend', 'backend'],
            createdBy: 'system'
        },
        {
            title: 'Write Tests for TaskBoard Drag-and-Drop',
            description: 'Create automated tests using Playwright to verify that tasks can be dragged between columns, status updates correctly, and WebSocket events are emitted. Test edge cases like dragging to invalid targets.',
            priority: 'high',
            status: 'todo',
            tags: ['testing', 'playwright', 'taskboard'],
            agentIds: ['qa'],
            createdBy: 'system'
        }
    ];

    for (const task of tasks) {
        try {
            const response = await fetch(`${API_URL}/api/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task)
            });

            const result = await response.json();

            if (result.success) {
                console.log(`✅ Created: "${task.title}"`);
                console.log(`   Assigned to: ${task.agentIds.join(', ')}`);
                console.log(`   Priority: ${task.priority}\n`);
            } else {
                console.error(`❌ Failed to create: "${task.title}"`, result.error);
            }
        } catch (error) {
            console.error(`❌ Error creating task: "${task.title}"`, error.message);
        }
    }

    console.log('\n🎯 Test tasks created! TaskMonitor will assign them to agents within 30 seconds.');
    console.log('📊 Check the dashboard to see tasks appear in the TaskBoard.');
    console.log('🤖 Watch the server logs to see agents pick up and execute tasks.\n');
}

createTestTasks().catch(console.error);
