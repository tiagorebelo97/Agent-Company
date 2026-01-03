// Trigger PM to execute the Subtasks feature task

async function triggerPMExecution() {
    console.log('🚀 Triggering PM to execute Subtasks feature...\n');

    // First, get the task ID
    const tasksResponse = await fetch('http://localhost:3001/api/tasks');
    const tasksData = await tasksResponse.json();

    if (!tasksData.success) {
        console.error('❌ Failed to fetch tasks');
        return;
    }

    // Find the Subtasks task
    const subtasksTask = tasksData.tasks.find(t =>
        t.title.includes('Subtask Management') ||
        t.title.includes('Implement Subtask')
    );

    if (!subtasksTask) {
        console.error('❌ Subtasks task not found. Creating it...');
        // Create the task if it doesn't exist
        const createResponse = await fetch('http://localhost:3001/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Implement Subtask Management System',
                description: `Implement complete subtask management feature.

REQUIREMENTS:
1. Create TaskSubtasks.jsx component
2. Integrate into TaskModal.jsx
3. Verify backend API endpoints
4. Test functionality

Use your autonomous capabilities to orchestrate this feature implementation.`,
                priority: 'high',
                status: 'in_progress',  // Set to in_progress to trigger auto-execution
                type: 'feature',
                agentIds: ['pm']
            })
        });

        const createData = await createResponse.json();
        if (createData.success) {
            console.log('✅ Task created and set to in_progress');
            console.log('Task ID:', createData.task.id);
            console.log('\n⏳ PM should start executing automatically...');
            console.log('Watch the terminal logs for PM activity!');
        }
        return;
    }

    console.log('✅ Found task:', subtasksTask.title);
    console.log('Task ID:', subtasksTask.id);
    console.log('Current status:', subtasksTask.status);

    // Update task to in_progress to trigger auto-execution
    if (subtasksTask.status !== 'in_progress') {
        console.log('\n📝 Updating task to in_progress to trigger execution...');

        const updateResponse = await fetch(`http://localhost:3001/api/tasks/${subtasksTask.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'in_progress'
            })
        });

        const updateData = await updateResponse.json();

        if (updateData.success) {
            console.log('✅ Task updated to in_progress!');
            console.log('\n🎯 PM will now:');
            console.log('1. Detect it\'s a feature request');
            console.log('2. Use LLM to decompose into subtasks');
            console.log('3. Delegate to Design, Frontend, Backend, QA agents');
            console.log('4. Monitor progress');
            console.log('5. Integrate results');
            console.log('\n⏳ Watch the backend terminal for PM orchestration logs!');
            console.log('Look for messages like:');
            console.log('  - "PM: Starting autonomous orchestration..."');
            console.log('  - "PM: Analyzing feature requirements..."');
            console.log('  - "PM: Delegating to specialized agents..."');
        } else {
            console.error('❌ Failed to update task:', updateData.error);
        }
    } else {
        console.log('\n✅ Task is already in_progress!');
        console.log('PM should be executing it. Check backend logs for activity.');
    }
}

// Wait for backend
setTimeout(triggerPMExecution, 2000);
