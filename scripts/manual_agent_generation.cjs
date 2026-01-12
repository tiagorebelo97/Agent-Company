const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateManualRecs() {
    try {
        console.log('🧹 Clearing previous recommendations...');
        await prisma.recommendation.deleteMany({});

        const projects = {
            mason: '879e8a61-14af-471b-9783-ce444e390163',
            football: 'cdacaee7-657e-4fe8-a4d4-fb9748be2866',
            agent: 'a3fa7d11-844c-4a4c-aae0-238343d4f1da'
        };

        const masonRecs = [
            // Functional (12)
            { title: '[Functional] Smart Maintenance Scheduler', description: 'AI-driven algorithm that prioritizes repair tickets based on urgency, distance, and technician skill level.', priority: 'high', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Real-time Facility Dashboard', description: 'Centralized view for Property Managers to monitor ongoing incidents and technician status across all locations.', priority: 'high', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Mobile Asset Inventory', description: 'Digital catalog of all facility equipment with QR code tracking for instant technician access to repair manuals.', priority: 'medium', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Tenant Communication Portal', description: 'Direct messaging and status updates for tenants, reducing manual follow-up calls for property managers.', priority: 'medium', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Cost Analysis Tools', description: 'Automated reporting on maintenance spend per facility, helping managers identify high-cost recurring issues.', priority: 'high', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Photo Evidence Upload', description: 'Require technicians to upload before/after photos within the ticket for quality control and auditing.', priority: 'medium', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Automated Quoting Module', description: 'Generates cost estimates for non-routine repairs based on material costs and labor time estimation.', priority: 'medium', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Preventive Service Triggers', description: 'System-generated alerts for routine maintenance (HVAC, fire safety) based on time or equipment usage metrics.', priority: 'high', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Technician Workload Balancer', description: 'Prevents burnout by distributing tasks evenly across the available workforce based on active ticket loads.', priority: 'low', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Multi-language Interface', description: 'Support for diverse technician workforces by providing the mobile app in multiple languages.', priority: 'low', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Custom Incident Tags', description: 'Allow managers to create custom tags for better classification and reporting of unique facility issues.', priority: 'medium', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Offline Support for Technicians', description: 'Local storage of ticket data and manuals for use in areas with poor connectivity (basements, remote sites).', priority: 'high', category: 'Functional Improvement', createdBy: 'product-agent' },

            // Innovation/Moonshot (8)
            { title: '[Innovation] Autonomous Field Swarm Coordination', description: 'Deploy and manage multiple drones for large-scale roof and facade inspections with automated defect detection.', priority: 'high', category: 'New Features to Create', createdBy: 'innovation-agent' },
            { title: '[Moonshot] Digital Twin Integration', description: 'Full 3D digital replicas of buildings that simulate structural stress and predict pipe bursts before they leak.', priority: 'medium', category: 'Strategic Ideas', createdBy: 'innovation-agent' },
            { title: '[Innovation] IoT Sensor Ecosystem', description: 'Direct integration with smart building sensors to trigger "self-healing" maintenance tickets automatically.', priority: 'high', category: 'New Features to Create', createdBy: 'innovation-agent' },
            { title: '[Moonshot] Tokenized Maintenance Rewards', description: 'A crypto-incentive system for technicians who maintain high quality ratings and fast resolution times.', priority: 'low', category: 'Strategic Ideas', createdBy: 'innovation-agent' },
            { title: '[Innovation] Augmented Reality Remote Repair', description: 'Allow senior engineers to guide junior technicians on-site through AR glasses or phone overlays.', priority: 'high', category: 'New Features to Create', createdBy: 'innovation-agent' },
            { title: '[Moonshot] Predictive Asset Lifecycle AI', description: 'Predicts the exact month an elevator or boiler will need replacement 12 months in advance for budgeting.', priority: 'medium', category: 'Strategic Ideas', createdBy: 'innovation-agent' },
            { title: '[Innovation] Automated Parts Procurement', description: 'Direct API links to suppliers to order parts automatically when a technician diagnoses a failure.', priority: 'medium', category: 'New Features to Create', createdBy: 'innovation-agent' },
            { title: '[Moonshot] Zero-Maintenance Facility Benchmark', description: 'AI consulting module that designs facilities for minimum maintenance based on material performance data.', priority: 'low', category: 'Strategic Ideas', createdBy: 'innovation-agent' },

            // Technical (8)
            { title: '[Technical] Geo-Spatial Database Optimization', description: 'Implement PostGIS or equivalent for ultra-fast proximity searches of technicians and assets.', priority: 'high', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Granular RBAC Permissions', description: 'Define complex access levels for Property Managers vs. Facility Owners vs. Technicians.', priority: 'medium', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Automated Load Testing Suite', description: 'Ensure the backend can handle 10x spikes in incident reports during extreme weather events.', priority: 'low', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] CDN for Large Assets', description: 'Serve manual PDFs and high-res photo evidence through a distributed network for faster access.', priority: 'medium', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Event-Driven Architecture', description: 'Migrate to a message bus for real-time notifications and background processing of heavy reports.', priority: 'high', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] API Gateway with Rate Limiting', description: 'Protect core services from third-party integration spikes and ensure consistent performance.', priority: 'medium', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Database Query Indexing Audit', description: 'Comprehensive review of slow queries in the Incident table to improve frontend responsiveness.', priority: 'high', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Secure Media Encryption', description: 'End-to-end encryption for photo evidence containing sensitive tenant information or private areas.', priority: 'medium', category: 'Technical Optimization', createdBy: 'product-agent' }
        ];

        // Football Ticketing (28)
        const footballRecs = [
            // Functional (12)
            { title: '[Functional] Peer-to-Peer Verified Marketplace', description: 'Club-sanctioned platform for fans to resell tickets securely, with dynamic price caps to prevent scalping.', priority: 'high', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Membership Tier Management', description: 'System for clubs to define loyalty tiers that offer early access to high-demand match tickets.', priority: 'high', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Interactive Seating Map 2.0', description: 'High-performance SVG map with real-time availability updates and "View from Seat" photo previews.', priority: 'medium', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Ancillary Sales Integration', description: 'Upsell match-day food vouchers, museum tours, or merchandise during the ticket checkout process.', priority: 'medium', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Digital Season Ticket Wallet', description: 'Consolidated view for season ticket holders with NFC entry support and guest transfer features.', priority: 'high', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Dynamic Pricing Engine', description: 'Adjust ticket prices in real-time based on demand, opponent ranking, and date of the fixture.', priority: 'high', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Fan ID Integration', description: 'Support for national safety registers or club-specific Fan IDs to streamline security checks.', priority: 'medium', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Group Booking Portal', description: 'Dedicated flow for schools and fan clubs to reserve large blocks of tickets with volume discounts.', priority: 'low', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] In-App Match-Day Assistant', description: 'Wayfinding to stadium gates/seats and real-time alerts for queue times at concession stands.', priority: 'medium', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Referral Rewards System', description: 'Give loyalty points to fans who invite friends to purchase tickets for low-occupancy fixtures.', priority: 'low', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Charity Ticket Donation', description: 'Allow fans to donate their unused tickets back to the club for redistribution to local NGOs.', priority: 'medium', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Hospitality Upgrade Upsell', description: 'Automated push notifications for standard ticket holders to upgrade to lounge access near match-day.', priority: 'medium', category: 'Functional Improvement', createdBy: 'product-agent' },

            // Innovation/Moonshot (8)
            { title: '[Innovation] NFT Ticket Collectibles', description: 'Tickets as unique digital assets that grant permanent access to highlights or exclusive digital content.', priority: 'high', category: 'New Features to Create', createdBy: 'innovation-agent' },
            { title: '[Moonshot] Metaverse Stadium Access', description: 'Virtual VR "seats" for fans worldwide to watch matches from their home with stadium-like atmosphere.', priority: 'medium', category: 'Strategic Ideas', createdBy: 'innovation-agent' },
            { title: '[Innovation] Biometric Stadium Entry', description: 'Replace physical/digital tickets with face or fingerprint scanning for frictionless stadium entry.', priority: 'high', category: 'New Features to Create', createdBy: 'innovation-agent' },
            { title: '[Moonshot] Fan-Driven Squad Selection', description: 'Engagement feature where fans use loyalty tokens to vote on non-competitive club decisions.', priority: 'low', category: 'Strategic Ideas', createdBy: 'innovation-agent' },
            { title: '[Innovation] AI Crowd Predictive Modeling', description: 'Predict stadium bottlenecks and adjust gate access in real-time to ensure fan safety and speed.', priority: 'high', category: 'New Features to Create', createdBy: 'innovation-agent' },
            { title: '[Moonshot] Hyper-Localized AR In-Game Stats', description: 'Pointing your phone at the pitch shows real-time player data overlays for ticket holders.', priority: 'medium', category: 'Strategic Ideas', createdBy: 'innovation-agent' },
            { title: '[Innovation] Dynamic Fan Travel Packs', description: 'Automatic booking of flights/trains/hotels bundled with away tickets for loyal fans.', priority: 'medium', category: 'New Features to Create', createdBy: 'innovation-agent' },
            { title: '[Moonshot] Global Fan Shareholding DAO', description: 'Decentralized ownership structure for fans to own "shares" of the club via the ticketing platform.', priority: 'low', category: 'Strategic Ideas', createdBy: 'innovation-agent' },

            // Technical (8)
            { title: '[Technical] Scalability for Peak On-Sales', description: 'Implement auto-scaling cloud infrastructure to handle 1M+ concurrent users for major finals.', priority: 'high', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Real-time Waiting Room Logic', description: 'Fair queueing system to manage high demand without crashing the central purchase server.', priority: 'high', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Anti-Bot CAPTCHA Hardening', description: 'AI-based behavior analysis to identify and block automated scalper bots from the checkout flow.', priority: 'high', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] PCI-DSS Level 1 Compliance', description: 'Ensure the highest tier of payment infrastructure security for global transactions.', priority: 'medium', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Database Sharding by Club', description: 'Separate data for massive clubs to ensure localized performance and database stability.', priority: 'medium', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Offline NFC Entry Protocol', description: 'Technical redundancy to allow gate entry even in the event of partial internet outages at the stadium.', priority: 'high', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Micro-frontend Seating View', description: 'Isolate the heavy seat-map component to improve page load speed and development agility.', priority: 'medium', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Multi-cloud Disaster Recovery', description: 'Ensure ticketing remains online for 100% of fixtures through redundant cloud providers.', priority: 'low', category: 'Technical Optimization', createdBy: 'product-agent' }
        ];

        // Agent Company (28)
        const agentRecs = [
            // Functional (12)
            { title: '[Functional] Professional Multi-Agent Marketplace', description: 'Public/Private directory for organizations to find and hire specialized pre-built agents.', priority: 'high', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Visual Swarm Workflow Builder', description: 'No-code drag-and-drop interface for defining complex dependency trees between multiple agents.', priority: 'high', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Agent Performance Monitoring', description: 'Real-time dashboard showing success rates, token usage, and latency metrics per agent instance.', priority: 'high', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Trusted Execution Escrow', description: 'Automatic payment release to agent providers only when the output passes predefined quality tests.', priority: 'medium', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Collaborative Human-in-the-Loop', description: 'Support for manual approval steps within automated agent workflows to ensure accuracy.', priority: 'high', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Agent Versioning & Rollback', description: 'Track configuration changes and allow instant reverts to previous agent states if performance drops.', priority: 'medium', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Enterprise Data Connectors', description: 'Native integrations with Salesforce, SAP, and Jira for agents to read/write corporate data.', priority: 'high', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Custom Agent Branding', description: 'Allow agencies to white-label agents and the activity dashboard for their end-clients.', priority: 'low', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Agent Usage Quotas', description: 'Define budget limits and token caps per user or department to control operational costs.', priority: 'medium', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Real-time Debugging Console', description: 'Live stream of agent thoughts and tool calls for developers to troubleshoot complex tasks.', priority: 'high', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Knowledge Base Vector Store', description: 'Simple interface for non-technical users to upload documents for agents to use as context.', priority: 'medium', category: 'Functional Improvement', createdBy: 'product-agent' },
            { title: '[Functional] Agent API Export', description: 'Generate stable REST endpoints for any built swarm to be consumed by external applications.', priority: 'medium', category: 'Functional Improvement', createdBy: 'product-agent' },

            // Innovation/Moonshot (8)
            { title: '[Innovation] Cross-Instance Knowledge Graph', description: 'Agents that learn patterns across thousands of tasks to build a global business intelligence network.', priority: 'high', category: 'New Features to Create', createdBy: 'innovation-agent' },
            { title: '[Moonshot] Autonomous Agent Evolution', description: 'Agents that "self-improve" by analyzing their own failures and updating their prompts/tools.', priority: 'high', category: 'Strategic Ideas', createdBy: 'innovation-agent' },
            { title: '[Innovation] Decentralized Agent Reputation', description: 'Blockchain-backed reliability scores that are immutable and shared across organizations.', priority: 'medium', category: 'New Features to Create', createdBy: 'innovation-agent' },
            { title: '[Moonshot] Self-Sustaining Agent DAO', description: 'An ecosystem of agents that negotiate tasks and payments amongst themselves without human intervention.', priority: 'low', category: 'Strategic Ideas', createdBy: 'innovation-agent' },
            { title: '[Innovation] Zero-Knowledge Task Verification', description: 'Verify that an agent performed a task correctly without exposing the sensitive underlying data.', priority: 'high', category: 'New Features to Create', createdBy: 'innovation-agent' },
            { title: '[Moonshot] Universal Agent Standard (UAS)', description: 'Industry-standard protocol for agents from different providers (OpenAI, Anthropic) to talk.', priority: 'medium', category: 'Strategic Ideas', createdBy: 'innovation-agent' },
            { title: '[Innovation] Federated Agent Learning', description: 'Train agents on private data from multiple companies without ever aggregating the data in one place.', priority: 'high', category: 'New Features to Create', createdBy: 'innovation-agent' },
            { title: '[Moonshot] Real-time Agent Labor Market', description: 'A dynamic auction where agents bid for tasks based on their current load and specific expertise.', priority: 'low', category: 'Strategic Ideas', createdBy: 'innovation-agent' },

            // Technical (8)
            { title: '[Technical] High-Throughput Inter-Process IPC', description: 'Ultra-fast communication bus to handle millions of agent-to-agent messages per second.', priority: 'high', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Distributed Vector Graph DB', description: 'Graph-based context storage for complex relationships between tasks, agents, and data nodes.', priority: 'medium', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Sandbox Execution Isolation', description: 'Docker-based isolation for every code execution tool call to ensure system-wide security.', priority: 'high', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Agent Memory Stream Encryption', description: 'Advanced AES-256 encryption for the "short-term memory" logs of every agent instance.', priority: 'medium', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Multi-Model Intelligence Routing', description: 'Intelligent router that chooses the cheapest LLM per sub-task while meeting quality requirements.', priority: 'high', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Cold-Start Latency Optimization', description: 'Keep hot agent instances in memory to ensure sub-100ms response times for interactive use.', priority: 'high', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] WebSocket Scalability Layer', description: 'Redis-backed pub/sub to handle 100k+ concurrent dashboard users viewing live agent feeds.', priority: 'medium', category: 'Technical Optimization', createdBy: 'product-agent' },
            { title: '[Technical] Automated Schema Migrations', description: 'Ensures the database of thousands of agent configurations remains consistent during updates.', priority: 'low', category: 'Technical Optimization', createdBy: 'product-agent' }
        ];

        console.log('🚀 Starting project-specific insertion...');

        const allTasks = [
            { id: projects.mason, data: masonRecs },
            { id: projects.football, data: footballRecs },
            { id: projects.agent, data: agentRecs }
        ];

        for (const task of allTasks) {
            console.log(`\n📦 Inserting 28 recommendations for Project ${task.id}...`);
            for (const rec of task.data) {
                await prisma.recommendation.create({
                    data: {
                        ...rec,
                        projectId: task.id
                    }
                });
                // Small delay to prevent SQLite lock/timeout
                await new Promise(resolve => setTimeout(resolve, 50));
                process.stdout.write('.');
            }
            console.log(`\n✅ Project ${task.id} done.`);
        }

        console.log('\n✅ Successfully generated and saved 84 high-quality recommendations.');

    } catch (error) {
        console.error('❌ Error in generation:', error);
    } finally {
        await prisma.$disconnect();
    }
}

generateManualRecs();
