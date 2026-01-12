/**
 * Direct test of Product and Innovation agents
 */

const API_BASE = 'http://localhost:3001/api';

async function testAgents() {
    try {
        console.log('🧪 Testing Product and Innovation Agents\n');

        // Get Mason project (has business model)
        const projectId = '879e8a61-14af-471b-9783-ce444e390163';
        const projectName = 'Mason';

        console.log(`📊 Testing with project: ${projectName}`);
        console.log(`   ID: ${projectId}\n`);

        // Create a task directly for Product Agent
        console.log('📦 Creating task for Product Agent...');
        const productTaskResponse = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: `Test: Generate Feature Improvements for ${projectName}`,
                description: `Analyze ${projectName} and provide recommendations for feature improvements.`,
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

        const productTaskData = await productTaskResponse.json();
        if (productTaskData.success) {
            console.log(`   ✅ Task created: ${productTaskData.task.id}`);
        } else {
            console.log(`   ❌ Failed:`, productTaskData.error);
        }

        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create a task directly for Innovation Agent
        console.log('\n🚀 Creating task for Innovation Agent...');
        const innovationTaskResponse = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: `Test: Generate Radical Innovations for ${projectName}`,
                description: `Analyze ${projectName} and provide disruptive innovation ideas.`,
                type: 'agent_analysis',
                priority: 'high',
                projectId: projectId,
                assignedToId: 'innovation',
                requirements: JSON.stringify({
                    project_id: projectId,
                    analysis_type: 'radical_innovation'
                })
            })
        });

        const innovationTaskData = await innovationTaskResponse.json();
        if (innovationTaskData.success) {
            console.log(`   ✅ Task created: ${innovationTaskData.task.id}`);
        } else {
            console.log(`   ❌ Failed:`, innovationTaskData.error);
        }

        console.log('\n⏳ Waiting 10 seconds for agents to process...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Check recommendations
        console.log('📊 Checking recommendations...');
        const recsResponse = await fetch(`${API_BASE}/projects/${projectId}/recommendations`);
        const recsData = await recsResponse.json();

        if (recsData.success) {
            console.log(`\n✅ Found ${recsData.recommendations.length} recommendations:\n`);
            recsData.recommendations.forEach((r, i) => {
                console.log(`${i + 1}. ${r.title}`);
                console.log(`   Category: ${r.category || 'N/A'}`);
                console.log(`   Priority: ${r.priority}`);
                console.log(`   Created by: ${r.createdBy}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}

testAgents();
