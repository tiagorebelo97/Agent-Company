const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restoreFunctionalRecs() {
    try {
        console.log('🧹 Clearing old recommendations...');
        await prisma.recommendation.deleteMany({});

        const projects = [
            { id: '879e8a61-14af-471b-9783-ce444e390163', name: 'Mason' },
            { id: 'cdacaee7-657e-4fe8-a4d4-fb9748be2866', name: 'Football Ticketing' },
            { id: 'a3fa7d11-844c-4a4c-aae0-238343d4f1da', name: 'Agent Company' }
        ];

        const recs = [
            // Mason
            {
                projectId: '879e8a61-14af-471b-9783-ce444e390163',
                title: '[Functional] Intelligent Resource Allocation Engine',
                description: 'Automates technician matching based on skill set and proximity, strengthening the Technician Efficiency value proposition.',
                priority: 'high',
                category: 'Functional Improvement',
                createdBy: 'product-agent'
            },
            {
                projectId: '879e8a61-14af-471b-9783-ce444e390163',
                title: '[Functional] Predictive Maintenance Alerts',
                description: 'Uses historical incident data to predict and alert Property Managers about potential equipment failures before they occur.',
                priority: 'high',
                category: 'Functional Improvement',
                createdBy: 'product-agent'
            },
            {
                projectId: '879e8a61-14af-471b-9783-ce444e390163',
                title: '[Innovation] Autonomous Field Swarm Coordination',
                description: 'A revolutionary system for coordinating multiple autonomous maintenance agents for large-scale property audits.',
                priority: 'high',
                category: 'New Features to Create',
                createdBy: 'innovation-agent'
            },
            // Football Ticketing
            {
                projectId: 'cdacaee7-657e-4fe8-a4d4-fb9748be2866',
                title: '[Functional] Verified Secondary Marketplace',
                description: 'A secure, official platform for fans to resell tickets, eliminating fraud and ensuring fair pricing.',
                priority: 'high',
                category: 'Functional Improvement',
                createdBy: 'product-agent'
            },
            {
                projectId: 'cdacaee7-657e-4fe8-a4d4-fb9748be2866',
                title: '[Functional] Personalized Fan Engagement Engine',
                description: 'Tailors match-day offers and content to specific fan segments based on their purchase history and preferences.',
                priority: 'medium',
                category: 'Functional Improvement',
                createdBy: 'product-agent'
            },
            {
                projectId: 'cdacaee7-657e-4fe8-a4d4-fb9748be2866',
                title: '[Innovation] NFT-Based Fan Loyalty & Governance',
                description: 'Uses blockchain to create a transparent loyalty program where fans can vote on minor club decisions and own unique digital assets.',
                priority: 'high',
                category: 'New Features to Create',
                createdBy: 'innovation-agent'
            },
            // Agent Company
            {
                projectId: 'a3fa7d11-844c-4a4c-aae0-238343d4f1da',
                title: '[Functional] Agent Marketplace with Performance Escrow',
                description: 'Creates a trust layer for Enterprise customers, ensuring agent results meet quality standards before payment release.',
                priority: 'high',
                category: 'Functional Improvement',
                createdBy: 'product-agent'
            },
            {
                projectId: 'a3fa7d11-844c-4a4c-aae0-238343d4f1da',
                title: '[Functional] Multi-Agent Workflow Orchestrator',
                description: 'A drag-and-drop builder to define complex sequences and parallel tasks between different specialized agents.',
                priority: 'high',
                category: 'Functional Improvement',
                createdBy: 'product-agent'
            },
            {
                projectId: 'a3fa7d11-844c-4a4c-aae0-238343d4f1da',
                title: '[Innovation] Decentralized Agent Reputation Network',
                description: 'A cross-organization reputation system for agents to verify their capabilities and reliability using zero-knowledge proofs.',
                priority: 'high',
                category: 'New Features to Create',
                createdBy: 'innovation-agent'
            }
        ];

        console.log('🚀 Inserting functional recommendations...');
        for (const rec of recs) {
            await prisma.recommendation.create({ data: rec });
            console.log(`✅ Added: ${rec.title} for ${rec.projectId}`);
        }

        console.log('\n🎉 Finished restoring recommendations.');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

restoreFunctionalRecs();
