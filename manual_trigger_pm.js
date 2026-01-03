// Manually trigger PM to execute the task
// This simulates what would happen if the task was just assigned

async function manuallyTriggerPM() {
    console.log('🎯 Manually triggering PM to execute Subtasks task...\n');

    const taskId = '33e46811-bb99-4c47-8c20-72ba2c12f1c1';

    // Send a direct execution request to the PM agent
    const response = await fetch('http://localhost:3001/api/agents/pm/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            taskId: taskId
        })
    });

    const data = await response.json();

    if (data.success) {
        console.log('✅ PM execution triggered successfully!');
        console.log('\nResult:', JSON.stringify(data, null, 2));
        console.log('\n📊 What happened:');
        console.log('- PM received the task');
        console.log('- PM is now processing it');
        console.log('- Check backend logs for orchestration activity');
        console.log('\n⏳ The PM should now:');
        console.log('1. Analyze the feature requirements');
        console.log('2. Decompose into subtasks using LLM');
        console.log('3. Delegate to specialized agents');
        console.log('4. Monitor progress');
    } else {
        console.error('❌ Failed to trigger PM:', data.error || 'Unknown error');
        console.log('\n💡 Alternative: Send a chat message to PM');
        console.log('Try: POST /api/agents/pm/chat');
        console.log('Body: { "message": "Execute task ' + taskId + '" }');
    }
}

setTimeout(manuallyTriggerPM, 2000);
