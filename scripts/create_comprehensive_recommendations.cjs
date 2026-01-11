const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createComprehensiveRecommendations() {
    try {
        console.log('🎯 Creating comprehensive recommendations organized by implementation phases...\n');

        const projects = [
            { id: '879e8a61-14af-471b-9783-ce444e390163', name: 'Mason' },
            { id: 'cdacaee7-657e-4fe8-a4d4-fb9748be2866', name: 'Football Ticketing' },
            { id: 'a3fa7d11-844c-4a4c-aae0-238343d4f1da', name: 'Agent Company' }
        ];

        // Clear existing recommendations first
        console.log('🗑️  Clearing existing test recommendations...');
        await prisma.recommendation.deleteMany({
            where: {
                createdBy: {
                    in: ['product-agent', 'innovation-agent']
                }
            }
        });
        console.log('✅ Cleared\n');

        for (const project of projects) {
            console.log(`\n${'='.repeat(80)}`);
            console.log(`📊 ${project.name}`);
            console.log('='.repeat(80));

            const recommendations = [
                // ============ MVP / FASE 1 - FUNDAÇÃO ============
                {
                    title: '[MVP] Optimize Initial Load Performance',
                    description: 'Implement code splitting, lazy loading, and tree shaking to reduce bundle size by 50%. Target: <3s Time to Interactive on 3G networks.',
                    priority: 'high',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                },
                {
                    title: '[MVP] Implement Comprehensive Error Handling',
                    description: 'Add error boundaries, fallback UI components, and user-friendly error messages. Integrate error tracking (Sentry/LogRocket) for production monitoring.',
                    priority: 'high',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                },
                {
                    title: '[MVP] Mobile-First Responsive Design',
                    description: 'Refactor all layouts to be mobile-first with touch-optimized interactions. Ensure 100% feature parity across devices.',
                    priority: 'high',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                },
                {
                    title: '[MVP] Enhanced User Onboarding Flow',
                    description: 'Create interactive tutorial with progress tracking, contextual tooltips, and achievement system to reduce time-to-first-value by 60%.',
                    priority: 'high',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                },
                {
                    title: '[MVP] Accessibility Compliance (WCAG 2.1 AA)',
                    description: 'Implement keyboard navigation, screen reader support, ARIA labels, and high-contrast mode. Target 100% compliance with WCAG 2.1 Level AA.',
                    priority: 'high',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                },

                // ============ FASE 2 - CRESCIMENTO ============
                {
                    title: '[Fase 2] Advanced Search & Filtering',
                    description: 'Implement full-text search with Elasticsearch, faceted filtering, saved searches, and search history with autocomplete.',
                    priority: 'high',
                    category: 'New Features to Create',
                    createdBy: 'innovation-agent'
                },
                {
                    title: '[Fase 2] Real-Time Collaboration Engine',
                    description: 'Enable multi-user simultaneous editing with operational transformation, live cursors, presence indicators, and conflict resolution using WebRTC/WebSockets.',
                    priority: 'high',
                    category: 'New Features to Create',
                    createdBy: 'innovation-agent'
                },
                {
                    title: '[Fase 2] Intelligent Notifications System',
                    description: 'Smart notification engine with ML-based prioritization, multi-channel delivery (email, push, SMS, Slack), and user preference learning.',
                    priority: 'medium',
                    category: 'New Features to Create',
                    createdBy: 'innovation-agent'
                },
                {
                    title: '[Fase 2] Advanced Analytics Dashboard',
                    description: 'Custom analytics with data visualization, exportable reports, scheduled insights, and predictive analytics using time-series forecasting.',
                    priority: 'medium',
                    category: 'New Features to Create',
                    createdBy: 'innovation-agent'
                },
                {
                    title: '[Fase 2] API Rate Limiting & Caching Strategy',
                    description: 'Implement Redis-based caching, request throttling, CDN integration, and GraphQL query optimization to handle 10x traffic growth.',
                    priority: 'medium',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                },
                {
                    title: '[Fase 2] Internationalization (i18n) Framework',
                    description: 'Support for 10+ languages with RTL layouts, currency/date localization, and crowdsourced translation management system.',
                    priority: 'medium',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                },
                {
                    title: '[Fase 2] Advanced Permission & Role System',
                    description: 'Granular RBAC with custom roles, attribute-based access control (ABAC), team hierarchies, and audit logging for compliance.',
                    priority: 'medium',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                },

                // ============ FASE 3 - ESCALA & OTIMIZAÇÃO ============
                {
                    title: '[Fase 3] AI-Powered Smart Recommendations',
                    description: 'Machine learning engine for personalized suggestions using collaborative filtering, content-based filtering, and hybrid models with A/B testing.',
                    priority: 'high',
                    category: 'New Features to Create',
                    createdBy: 'innovation-agent'
                },
                {
                    title: '[Fase 3] Automated Workflow Builder',
                    description: 'Visual workflow automation with drag-and-drop interface, conditional logic, integrations with 100+ apps via Zapier/Make, and custom triggers.',
                    priority: 'high',
                    category: 'New Features to Create',
                    createdBy: 'innovation-agent'
                },
                {
                    title: '[Fase 3] Advanced Data Export & Integration',
                    description: 'Support for 20+ export formats (CSV, JSON, XML, PDF), scheduled exports, webhook integrations, and bi-directional sync with external systems.',
                    priority: 'medium',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                },
                {
                    title: '[Fase 3] Microservices Architecture Migration',
                    description: 'Gradual migration to microservices with service mesh, API gateway, distributed tracing, and circuit breakers for 99.99% uptime.',
                    priority: 'medium',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                },
                {
                    title: '[Fase 3] Advanced Security Hardening',
                    description: 'Implement SOC 2 compliance, penetration testing automation, zero-trust architecture, secrets management with Vault, and SIEM integration.',
                    priority: 'high',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                },
                {
                    title: '[Fase 3] Custom Branding & White-Label Solution',
                    description: 'Enable enterprise customers to fully customize UI/UX, domain, emails, and branding with multi-tenant isolation and SSO integration.',
                    priority: 'medium',
                    category: 'New Features to Create',
                    createdBy: 'innovation-agent'
                },

                // ============ MOONSHOTS - INOVAÇÃO RADICAL ============
                {
                    title: '[Moonshot] Blockchain-Based Audit Trail',
                    description: 'Immutable transaction logging using Ethereum/Polygon for tamper-proof compliance records, smart contract automation, and decentralized verification.',
                    priority: 'low',
                    category: 'Strategic Ideas',
                    createdBy: 'innovation-agent'
                },
                {
                    title: '[Moonshot] AI Copilot Assistant',
                    description: 'GPT-4 powered conversational AI that understands context, automates repetitive tasks, generates content, and provides intelligent suggestions in natural language.',
                    priority: 'medium',
                    category: 'Strategic Ideas',
                    createdBy: 'innovation-agent'
                },
                {
                    title: '[Moonshot] AR/VR Immersive Experience',
                    description: 'Virtual reality workspace for remote collaboration with spatial computing, 3D data visualization, and haptic feedback integration.',
                    priority: 'low',
                    category: 'Strategic Ideas',
                    createdBy: 'innovation-agent'
                },
                {
                    title: '[Moonshot] Quantum-Resistant Encryption',
                    description: 'Future-proof security with post-quantum cryptography algorithms (CRYSTALS-Kyber, SPHINCS+) to protect against quantum computing threats.',
                    priority: 'low',
                    category: 'Strategic Ideas',
                    createdBy: 'innovation-agent'
                },
                {
                    title: '[Moonshot] Edge Computing & Offline-First',
                    description: 'Progressive Web App with full offline functionality, edge computing for low-latency operations, and conflict-free replicated data types (CRDTs).',
                    priority: 'medium',
                    category: 'Strategic Ideas',
                    createdBy: 'innovation-agent'
                },
                {
                    title: '[Moonshot] Neural Interface Integration',
                    description: 'Brain-computer interface support for accessibility, enabling thought-based navigation and control for users with disabilities.',
                    priority: 'low',
                    category: 'Strategic Ideas',
                    createdBy: 'innovation-agent'
                },

                // ============ MELHORIAS CONTÍNUAS ============
                {
                    title: '[Continuous] Performance Monitoring Dashboard',
                    description: 'Real-time performance metrics with Core Web Vitals tracking, custom alerts, and automated performance regression detection.',
                    priority: 'medium',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                },
                {
                    title: '[Continuous] Automated Testing Suite Expansion',
                    description: 'Achieve 90% code coverage with unit, integration, E2E, visual regression, and performance tests. Integrate with CI/CD pipeline.',
                    priority: 'high',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                },
                {
                    title: '[Continuous] Developer Experience (DX) Improvements',
                    description: 'Enhanced documentation, interactive API playground, SDK generation for 5+ languages, and comprehensive onboarding for contributors.',
                    priority: 'medium',
                    category: 'Features to Improve',
                    createdBy: 'product-agent'
                },
                {
                    title: '[Continuous] Customer Feedback Loop System',
                    description: 'In-app feedback widget, NPS surveys, feature voting board, and automated sentiment analysis to drive product roadmap.',
                    priority: 'medium',
                    category: 'New Features to Create',
                    createdBy: 'innovation-agent'
                }
            ];

            // Create all recommendations
            let created = 0;
            for (const rec of recommendations) {
                await prisma.recommendation.create({
                    data: {
                        projectId: project.id,
                        ...rec
                    }
                });
                created++;
            }

            console.log(`\n✅ Created ${created} recommendations:`);
            console.log(`   - MVP/Fase 1: 5 recommendations`);
            console.log(`   - Fase 2 (Growth): 7 recommendations`);
            console.log(`   - Fase 3 (Scale): 6 recommendations`);
            console.log(`   - Moonshots: 6 recommendations`);
            console.log(`   - Continuous Improvement: 4 recommendations`);
        }

        console.log('\n' + '='.repeat(80));
        console.log('✅ ALL RECOMMENDATIONS CREATED SUCCESSFULLY!');
        console.log('='.repeat(80));
        console.log('\n📊 Total: 28 recommendations per project (84 total)');
        console.log('🎯 Organized by implementation phases and priority');
        console.log('💡 Check your dashboard at http://localhost:5173');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

createComprehensiveRecommendations();
