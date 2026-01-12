/**
 * Check tasks status
 */

const API_BASE = 'http://localhost:3001/api';

async function checkTasks() {
    try {
        console.log('📋 Checking recent tasks...\n');

        const projects = [
            { id: '879e8a61-14af-471b-9783-ce444e390163', name: 'Mason' },
            { id: 'cdacaee7-657e-4fe8-a4d4-fb9748be2866', name: 'Football Ticketing' },
            { id: 'a3fa7d11-844c-4a4c-aae0-238343d4f1da', name: 'Agent Company' }
        ];

        for (const project of projects) {
            const response = await fetch(`${API_BASE}/projects/${project.id}`);
            const data = await response.json();

            if (data.success) {
                const tasks = data.project.tasks || [];
                const agentAnalysisTasks = tasks.filter(t => t.type === 'agent_analysis');

                console.log(`${project.name}:`);
                console.log(`  Total tasks: ${tasks.length}`);
                console.log(`  Agent analysis tasks: ${agentAnalysisTasks.length}`);

                agentAnalysisTasks.slice(0, 5).forEach(t => {
                    console.log(`    - ${t.title}`);
                    console.log(`      Status: ${t.status}`);
                    console.log(`      Assigned to: ${t.assignedToId || 'none'}`);
                    if (t.error) console.log(`      Error: ${t.error}`);
                });
                console.log('');
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkTasks();
