const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBusinessModels() {
    try {
        console.log('🔍 Checking Business Models for all projects...\n');

        const projects = await prisma.project.findMany({
            select: {
                id: true,
                name: true,
                businessModel: true
            }
        });

        for (const project of projects) {
            console.log(`📊 ${project.name} (${project.id})`);

            if (!project.businessModel) {
                console.log('   ❌ No Business Model found\n');
                continue;
            }

            try {
                const bm = JSON.parse(project.businessModel);
                const keys = Object.keys(bm);
                console.log(`   ✅ Business Model exists with ${keys.length} keys`);
                console.log(`   Keys: ${keys.join(', ')}`);

                // Check if it has meaningful data
                let hasData = false;
                for (const key of keys) {
                    if (bm[key] && (Array.isArray(bm[key]) ? bm[key].length > 0 : Object.keys(bm[key]).length > 0)) {
                        hasData = true;
                        break;
                    }
                }

                if (hasData) {
                    console.log('   ✅ Has meaningful data');
                } else {
                    console.log('   ⚠️  Business Model is empty or has no data');
                }

                console.log('');
            } catch (e) {
                console.log(`   ❌ Failed to parse Business Model: ${e.message}\n`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkBusinessModels();
