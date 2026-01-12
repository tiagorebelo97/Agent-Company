const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function forceFunctionalAnalysis() {
    try {
        console.log('🧹 Clearing old recommendations and stuck analysis tasks...');
        await prisma.recommendation.deleteMany({});
        await prisma.task.deleteMany({
            where: { type: 'agent_analysis' }
        });
        console.log('✅ Base cleared.');

        const projects = await prisma.project.findMany({});
        const agents = [
            { id: 'product', name: 'Product Agent', role: 'Product Optimization & Strategy' },
            { id: 'innovation', name: 'Innovation Agent', role: 'Innovation Strategist' }
        ];

        for (const project of projects) {
            console.log(`\n🚀 Forcing analysis for: ${project.name} (${project.id})`);

            for (const agent of agents) {
                console.log(`   - Creating task for ${agent.name}...`);

                const task = await prisma.task.create({
                    data: {
                        title: `Functional Analysis: ${project.name} (${agent.name})`,
                        description: `Analyze ${project.name} using the Business Model Canvas to suggest highly specific FUNCTIONAL and BUSINESS features. Avoid generic technical tips.`,
                        status: 'todo',
                        priority: 'high',
                        type: 'agent_analysis',
                        projectId: project.id,
                        createdBy: 'system_force',
                        requirements: JSON.stringify({
                            project_id: project.id,
                            force_functional: true,
                            analysis_type: 'business_value'
                        })
                    }
                });

                // Manually link agent to task via TaskAgent if possible
                // (Looking at schema, TaskAgent is the junction table)
                try {
                    await prisma.taskAgent.create({
                        data: {
                            taskId: task.id,
                            agentId: agent.id
                        }
                    });
                } catch (e) {
                    console.log(`     (Warning: Could not link agent ${agent.id} to task ${task.id}: ${e.message})`);
                }
            }
        }

        console.log('\n⏳ Waiting 60 seconds for agents to process (this time for real)...');
        // We'll wait in the terminal command instead

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

forceFunctionalAnalysis();
