
async function createTasks() {
    console.log('🚀 Creating Sprint 1 Tasks...');

    // 1. Subtask Management
    const subtasksRes = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Implement Subtask Management Feature',
            description: 'Autonomous implementation of a complete subtask management system. \n- Backend: API endpoints for CRUD subtasks linked to parent tasks. \n- Frontend: TaskSubtasks component in the dashboard to list, add, and toggle subtasks.',
            priority: 'high',
            status: 'in_progress',
            type: 'feature',
            agentIds: ['pm'],
            createdBy: 'system'
        })
    });

    const subtasksData = await subtasksRes.json();
    if (subtasksData.success) {
        console.log(`✅ Subtasks Task created: ${subtasksData.task.id}`);
    } else {
        console.error('❌ Failed to create Subtasks task');
    }

    // 2. Task Comments System
    const commentsRes = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Implement Task Comments System',
            description: 'Create a messaging system within each task. \n- Backend: Table and API for storing comments and linking them to tasks. \n- Frontend: Chat-like interface in TaskModal to allow communication and history logs.',
            priority: 'high',
            status: 'todo', // Start as todo, PM will pick it up after current or in parallel
            type: 'feature',
            agentIds: ['pm'],
            createdBy: 'system'
        })
    });

    const commentsData = await commentsRes.json();
    if (commentsData.success) {
        console.log(`✅ Comments Task created: ${commentsData.task.id}`);
    } else {
        console.error('❌ Failed to create Comments task:', commentsData);
    }
}

createTasks();
