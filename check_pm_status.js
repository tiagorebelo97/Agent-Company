// Check PM execution status

async function checkPMStatus() {
    console.log('🔍 Checking PM execution status...\n');

    try {
        // 1. Check task status
        const taskResponse = await fetch('http://localhost:3001/api/tasks/33e46811-bb99-4c47-8c20-72ba2c12f1c1');
        const taskData = await taskResponse.json();

        if (taskData.success) {
            console.log('📋 Task Status:');
            console.log('  Title:', taskData.task.title);
            console.log('  Status:', taskData.task.status);
            console.log('  Assigned to:', taskData.task.agents?.map(a => a.agent.name).join(', ') || 'None');
            console.log('  Created:', new Date(taskData.task.createdAt).toLocaleString());
            console.log('  Updated:', new Date(taskData.task.updatedAt).toLocaleString());

            if (taskData.task.result) {
                console.log('  Result:', JSON.stringify(taskData.task.result, null, 2));
            }
        }

        // 2. Check PM agent status
        console.log('\n🤖 PM Agent Status:');
        const agentsResponse = await fetch('http://localhost:3001/api/agents');
        const agentsData = await agentsResponse.json();

        if (agentsData.success) {
            const pm = agentsData.agents.find(a => a.id === 'pm');
            if (pm) {
                console.log('  Status:', pm.status);
                console.log('  Load:', pm.load + '%');
                console.log('  Tasks Completed:', pm.stats?.tasksCompleted || 0);
                console.log('  Tasks Failed:', pm.stats?.tasksFailed || 0);
            }
        }

        // 3. Check recent messages
        console.log('\n💬 Recent Messages (last 5):');
        const messagesResponse = await fetch('http://localhost:3001/api/messages?limit=5');
        const messagesData = await messagesResponse.json();

        if (messagesData.success && messagesData.messages.length > 0) {
            messagesData.messages.forEach(msg => {
                console.log(`  [${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.fromAgent?.name || 'System'} → ${msg.toAgent?.name || 'All'}: ${msg.content.substring(0, 60)}...`);
            });
        } else {
            console.log('  No recent messages');
        }

        // 4. Check if files were created
        console.log('\n📁 Checking for created files:');
        const fs = require('fs');
        const path = require('path');

        const filesToCheck = [
            'apps/dashboard/src/components/TaskSubtasks.jsx',
            'apps/dashboard/src/components/TaskModal.jsx'
        ];

        for (const file of filesToCheck) {
            const fullPath = path.join(process.cwd(), file);
            if (fs.existsSync(fullPath)) {
                const stats = fs.statSync(fullPath);
                console.log(`  ✅ ${file} (${stats.size} bytes, modified: ${stats.mtime.toLocaleString()})`);
            } else {
                console.log(`  ❌ ${file} (not found)`);
            }
        }

        console.log('\n📊 Summary:');
        if (taskData.task.status === 'in_progress') {
            console.log('  ⏳ Task is IN PROGRESS - PM should be working on it');
            console.log('  💡 If no activity, the PM might need manual triggering');
        } else if (taskData.task.status === 'completed') {
            console.log('  ✅ Task COMPLETED!');
        } else {
            console.log(`  ℹ️  Task status: ${taskData.task.status}`);
        }

    } catch (error) {
        console.error('❌ Error checking status:', error.message);
    }
}

setTimeout(checkPMStatus, 2000);
