const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestRecommendations() {
    try {
        console.log('🎯 Creating test recommendations for all projects...\n');

        const projects = [
            { id: '879e8a61-14af-471b-9783-ce444e390163', name: 'Mason' },
            { id: 'cdacaee7-657e-4fe8-a4d4-fb9748be2866', name: 'Football Ticketing' },
            { id: 'a3fa7d11-844c-4a4c-aae0-238343d4f1da', name: 'Agent Company' }
        ];

        for (const project of projects) {
            console.log(`\n📊 ${project.name}`);

            // Product Agent recommendations
            const productRecs = [
                {
                    title: 'Optimize Dashboard Load Time',
                    description: 'Implement lazy loading and code splitting to reduce initial bundle size and improve Time to Interactive (TTI) by 40%.',
                    priority: 'high',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                },
                {
                    title: 'Enhanced User Onboarding Flow',
                    description: 'Add interactive tooltips and a progress indicator to guide new users through key features, reducing time-to-value.',
                    priority: 'medium',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                },
                {
                    title: 'Improve Mobile Responsiveness',
                    description: 'Refine mobile layouts and touch interactions to provide a native-app-like experience on smartphones and tablets.',
                    priority: 'medium',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                }
            ];

            // Innovation Agent recommendations
            const innovationRecs = [
                {
                    title: 'AI-Powered Smart Suggestions',
                    description: 'Integrate machine learning to provide personalized recommendations based on user behavior patterns and historical data.',
                    priority: 'high',
                    category: 'New Features to Create',
                    createdBy: 'innovation-agent'
                },
                {
                    title: 'Real-time Collaboration Module',
                    description: 'Enable multiple users to work simultaneously with live cursors, presence indicators, and conflict resolution.',
                    priority: 'high',
                    category: 'New Features to Create',
                    createdBy: 'innovation-agent'
                },
                {
                    title: 'Blockchain-Based Audit Trail',
                    description: 'Implement immutable transaction logging using blockchain technology for enhanced security and compliance.',
                    priority: 'low',
                    category: 'Strategic Ideas',
                    createdBy: 'innovation-agent'
                }
            ];

            // Create recommendations
            const allRecs = [...productRecs, ...innovationRecs];
            let created = 0;

            for (const rec of allRecs) {
                await prisma.recommendation.create({
                    data: {
                        projectId: project.id,
                        ...rec
                    }
                });
                created++;
            }

            console.log(`   ✅ Created ${created} recommendations`);
        }

        console.log('\n✅ All test recommendations created successfully!');
        console.log('🎯 Check your dashboard to see them in action!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createTestRecommendations();
