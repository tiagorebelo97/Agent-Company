/**
 * Check agent status and recommendations
 */

const API_BASE = 'http://localhost:3001/api';

async function checkStatus() {
    try {
        // Check agents
        console.log('🤖 Checking agents...\n');
        const agentsResponse = await fetch(`${API_BASE}/agents`);
        const agentsData = await agentsResponse.json();

        if (agentsData.success) {
            const productAgent = agentsData.agents.find(a => a.id === 'product');
            const innovationAgent = agentsData.agents.find(a => a.id === 'innovation');

            console.log(`Product Agent: ${productAgent ? '✅ Found' : '❌ Not found'}`);
            if (productAgent) {
                console.log(`  Status: ${productAgent.status}`);
                console.log(`  Load: ${productAgent.load}%`);
            }

            console.log(`Innovation Agent: ${innovationAgent ? '✅ Found' : '❌ Not found'}`);
            if (innovationAgent) {
                console.log(`  Status: ${innovationAgent.status}`);
                console.log(`  Load: ${innovationAgent.load}%`);
            }
        }

        // Check recommendations for each project
        console.log('\n📊 Checking recommendations...\n');

        const projects = ['a3fa7d11-844c-4a4c-aae0-238343d4f1da', 'cdacaee7-657e-4fe8-a4d4-fb9748be2866', '879e8a61-14af-471b-9783-ce444e390163'];
        const projectNames = ['Agent Company', 'Football Ticketing', 'Mason'];

        for (let i = 0; i < projects.length; i++) {
            const response = await fetch(`${API_BASE}/projects/${projects[i]}/recommendations`);
            const data = await response.json();

            if (data.success) {
                console.log(`${projectNames[i]}: ${data.recommendations.length} recommendations`);
                data.recommendations.slice(0, 3).forEach(r => {
                    console.log(`  - ${r.title} (${r.category || 'uncategorized'})`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkStatus();
