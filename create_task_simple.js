// Create auto-executing task for PM
async function createTask() {
    console.log('🚀 Creating task...\n');

    const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Implement Subtask Management Feature',
            description: 'Autonomous implementation of subtask management system. Create TaskSubtasks.jsx component with add/toggle/delete functionality, integrate into TaskModal.jsx, verify backend APIs, and test.',
            priority: 'high',
            status: 'in_progress',
            type: 'feature',
            agentIds: ['pm'],
            createdBy: 'system'
        })
    });

    const data = await response.json();

    if (data.success) {
        console.log('✅ Task created!');
        console.log('ID:', data.task.id);
        console.log('\n🎯 PM should now auto-execute!');
        console.log('Watch backend logs for:');
        console.log('  "PM: Starting autonomous orchestration..."');
    } else {
        console.error('❌ Error:', data.error);
    }
}

setTimeout(createTask, 2000);
