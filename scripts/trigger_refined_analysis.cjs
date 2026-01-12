const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function triggerRefinedAnalysis() {
    try {
        console.log('🧹 Clearing old recommendations...');
        await prisma.recommendation.deleteMany({});
        console.log('✅ Recommendations cleared.');

        const projects = [
            { id: '879e8a61-14af-471b-9783-ce444e390163', name: 'Mason' },
            { id: 'cdacaee7-657e-4fe8-a4d4-fb9748be2866', name: 'Football Ticketing' },
            { id: 'a3fa7d11-844c-4a4c-aae0-238343d4f1da', name: 'Agent Company' }
        ];

        for (const project of projects) {
            console.log(`\n🚀 Triggering analysis for: ${project.name} (${project.id})`);

            // First clear assignedAgents to ensure the update triggers the analysis logic
            await prisma.project.update({
                where: { id: project.id },
                data: { assignedAgents: '[]' }
            });

            // Then add them back
            await prisma.project.update({
                where: { id: project.id },
                data: { assignedAgents: JSON.stringify(['product', 'innovation']) }
            });

            console.log(`✅ Agents re-assigned to ${project.name}. Tasks should be created automatically.`);
        }

        console.log('\n⏳ Waiting 30 seconds for agents to process...');
        await new Promise(resolve => setTimeout(resolve, 30000));

        console.log('\n🔍 Checking results...');
        const recs = await prisma.recommendation.findMany({
            include: { project: true }
        });

        console.log(`\nFound ${recs.length} new recommendations:`);
        recs.forEach(r => {
            console.log(`- [${r.project.name}] ${r.title} (${r.category})`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

triggerRefinedAnalysis();
