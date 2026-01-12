/**
 * Generate recommendations for all projects via API
 * Uses native fetch (Node 18+)
 */

const API_BASE = 'http://localhost:3001/api';

async function generateRecommendationsForAllProjects() {
    try {
        console.log('🚀 Starting recommendation generation for all projects...\n');

        // Get all projects
        const projectsResponse = await fetch(`${API_BASE}/projects`);
        const projectsData = await projectsResponse.json();

        if (!projectsData.success) {
            console.error('❌ Failed to fetch projects');
            return;
        }

        const projects = projectsData.projects;
        console.log(`Found ${projects.length} projects:`);
        projects.forEach(p => console.log(`  - ${p.name} (${p.id})`));
        console.log('');

        // Process each project
        for (const project of projects) {
            console.log(`\n📊 Processing: ${project.name}`);
            console.log(`   ID: ${project.id}`);

            try {
                // Get current assigned agents
                const currentAssigned = project.assignedAgents ? JSON.parse(project.assignedAgents) : [];

                // Add Product and Innovation agents if not already assigned
                const newAssigned = [...new Set([...currentAssigned, 'product', 'innovation'])];

                console.log(`   Current agents: ${currentAssigned.join(', ') || 'none'}`);
                console.log(`   Adding: product, innovation`);

                // Assign agents to the project
                const assignResponse = await fetch(`${API_BASE}/projects/${project.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        assignedAgents: newAssigned
                    })
                });

                const assignData = await assignResponse.json();

                if (assignData.success) {
                    console.log(`   ✅ Agents assigned successfully`);
                    console.log(`   ⏳ Analysis tasks created - agents are working...`);
                } else {
                    console.error(`   ❌ Failed to assign agents:`, assignData.error);
                }

            } catch (error) {
                console.error(`   ❌ Error processing ${project.name}:`, error.message);
            }

            // Wait before processing next project to avoid overwhelming the system
            console.log(`   ⏸️  Waiting 5 seconds before next project...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        console.log('\n\n✅ All projects processed!');
        console.log('📝 The Product and Innovation agents are now analyzing each project.');
        console.log('💡 Monitor the server logs to see recommendations being generated.');
        console.log('🎯 Check your dashboard Recommendations panel to see the results!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}

// Run the script
generateRecommendationsForAllProjects();
