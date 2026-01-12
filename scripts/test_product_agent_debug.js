/**
 * Test Product Agent directly with detailed logging
 */

const API_BASE = 'http://localhost:3001/api';

async function testProductAgent() {
    try {
        console.log('🧪 Testing Product Agent with detailed logging\n');

        const projectId = '879e8a61-14af-471b-9783-ce444e390163'; // Mason

        console.log('📦 Creating test task for Product Agent...');
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: `DEBUG: Test Product Agent`,
                description: `Analyze Mason and provide recommendations.`,
                type: 'agent_analysis',
                priority: 'high',
                projectId: projectId,
                assignedToId: 'product',
                requirements: JSON.stringify({
                    project_id: projectId,
                    analysis_type: 'feature_improvement'
                })
            })
        });

        const data = await response.json();
        if (data.success) {
            console.log(`✅ Task created: ${data.task.id}`);
            console.log(`\n⏳ Waiting 15 seconds for execution...\n`);

            await new Promise(resolve => setTimeout(resolve, 15000));

            // Check task result
            const taskResponse = await fetch(`${API_BASE}/tasks/${data.task.id}`);
            const taskData = await taskResponse.json();

            if (taskData.success) {
                console.log(`📊 Task Status: ${taskData.task.status}`);
                if (taskData.task.result) {
                    console.log(`\n📝 Result:`);
                    console.log(JSON.stringify(JSON.parse(taskData.task.result), null, 2));
                }
                if (taskData.task.error) {
                    console.log(`\n❌ Error: ${taskData.task.error}`);
                }
            }

            console.log(`\n💡 Check the server logs for detailed execution trace!`);
        } else {
            console.log(`❌ Failed to create task:`, data.error);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testProductAgent();
