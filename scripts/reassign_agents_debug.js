/**
 * Re-assign agents to trigger new analysis with detailed logging
 */

const API_BASE = 'http://localhost:3001/api';

async function reAssignAgents() {
    try {
        console.log('🔄 Re-assigning agents to trigger analysis with detailed logging...\n');

        // Use Mason project as test
        const projectId = '879e8a61-14af-471b-9783-ce444e390163';
        const projectName = 'Mason';

        console.log(`📊 Project: ${projectName}`);
        console.log(`   ID: ${projectId}\n`);

        // First, remove the agents
        console.log('1️⃣  Removing agents...');
        const removeResponse = await fetch(`${API_BASE}/projects/${projectId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assignedAgents: []
            })
        });

        const removeData = await removeResponse.json();
        if (removeData.success) {
            console.log('   ✅ Agents removed\n');
        }

        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Now re-assign them
        console.log('2️⃣  Re-assigning Product and Innovation agents...');
        const assignResponse = await fetch(`${API_BASE}/projects/${projectId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assignedAgents: ['product', 'innovation']
            })
        });

        const assignData = await assignResponse.json();
        if (assignData.success) {
            console.log('   ✅ Agents assigned - tasks created automatically\n');
        }

        console.log('3️⃣  Waiting 20 seconds for agents to execute...\n');
        await new Promise(resolve => setTimeout(resolve, 20000));

        // Check recommendations
        console.log('4️⃣  Checking recommendations...');
        const recsResponse = await fetch(`${API_BASE}/projects/${projectId}/recommendations`);
        const recsData = await recsResponse.json();

        if (recsData.success) {
            console.log(`\n✅ Found ${recsData.recommendations.length} recommendations:\n`);
            recsData.recommendations.forEach((r, i) => {
                console.log(`${i + 1}. ${r.title}`);
                console.log(`   Category: ${r.category || 'N/A'}`);
                console.log(`   Created by: ${r.createdBy}`);
                console.log('');
            });
        }

        console.log('\n💡 Check the server logs for detailed execution trace!');
        console.log('   Look for lines starting with "Product Agent" and "Innovation Agent"');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

reAssignAgents();
