// Create task for PM to implement Subtask Management feature

async function createSubtasksFeatureTask() {
    console.log('Creating Subtask Management feature task for PM...\n');

    const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Implement Subtask Management System',
            description: `Implement complete subtask management feature for the task system.
            
REQUIREMENTS:
1. Create TaskSubtasks.jsx component with:
   - List of subtasks with checkboxes
   - Add new subtask input
   - Progress indicator (X of Y completed)
   - Edit/delete subtask actions
   - Keyboard navigation support

2. Integrate into TaskModal.jsx:
   - Import and use TaskSubtasks component
   - Pass taskId and subtasks props
   - Handle subtask state updates

3. Backend API endpoints (verify they exist):
   - POST /api/tasks/:id/subtasks - Create subtask
   - PATCH /api/tasks/:taskId/subtasks/:subtaskId - Update subtask
   - DELETE /api/tasks/:taskId/subtasks/:subtaskId - Delete subtask

4. Testing:
   - Verify component with ESLint
   - Run component tests
   - Test API endpoints
   - Manual UI testing

DELIVERABLES:
- TaskSubtasks.jsx component
- Updated TaskModal.jsx
- Verified and tested code
- Documentation of changes`,
            priority: 'high',
            status: 'todo',
            type: 'feature',
            agentIds: ['pm'],
            createdBy: 'system'
        })
    });

    const data = await response.json();

    if (data.success) {
        console.log('✅ Task created successfully!');
        console.log('Task ID:', data.task.id);
        console.log('Assigned to: Project Manager');
        console.log('\nThe PM will now:');
        console.log('1. Decompose the task');
        console.log('2. Assign to Frontend Engineer');
        console.log('3. Coordinate with Backend/QA agents');
        console.log('4. Monitor progress');
        console.log('\nWatch the Activity Feed in the dashboard for updates!');
    } else {
        console.error('❌ Failed to create task:', data.error);
    }
}

// Wait for backend to be ready
setTimeout(createSubtasksFeatureTask, 2000);
