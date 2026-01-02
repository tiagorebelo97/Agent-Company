import prisma from '../src/database/client.js';
import messenger from '../src/services/Messenger.js';
import logger from '../src/utils/logger.js';

async function runDemo() {
    logger.info('🎬 Starting Multi-Agent Collaboration Demo...');

    try {
        await messenger.init();

        // 1. Setup Virtual Agents in DB
        logger.info('Registering swarm participants...');
        const agents = [
            { id: 'pm', name: 'Project Manager', emoji: '🎯', status: 'active' },
            { id: 'architect', name: 'Technical Architect', emoji: '📐', status: 'idle' },
            { id: 'design', name: 'Design Agent', emoji: '🎨', status: 'idle' }
        ];

        for (const agentData of agents) {
            await prisma.agent.upsert({
                where: { id: agentData.id },
                update: { status: agentData.status },
                create: {
                    ...agentData,
                    skills: '[]',
                    role: 'Demo Participant'
                }
            });

            // Register local handlers to simulate their response
            messenger.registerAgent(agentData.id, async (msg) => {
                logger.info(`[${agentData.name}] Received: "${msg.content}" from ${msg.fromId}`);
            });
        }

        // 2. Simulate Workflow
        logger.info('\n--- Workflow Start ---');

        // PM starts the project
        await messenger.sendMessage('pm', 'architect', 'Architect, we need a plan for the new Dashboard UI.');
        await sleep(1500);

        // Architect responds and task Design
        await prisma.agent.update({ where: { id: 'architect' }, data: { status: 'thinking' } });
        await messenger.sendMessage('architect', 'pm', 'Plan created. Requesting UI tokens from Designer.');
        await sleep(1000);

        await messenger.sendMessage('architect', 'design', 'Design Agent, please provide the color palette.');
        await prisma.agent.update({ where: { id: 'architect' }, data: { status: 'idle' } });
        await prisma.agent.update({ where: { id: 'design' }, data: { status: 'busy' } });
        await sleep(1500);

        // Designer responds
        await messenger.sendMessage('design', 'architect', 'Colors: #2B81FF (Blue), #0f172a (Dark Slate). Implementation starting.');
        await prisma.agent.update({ where: { id: 'design' }, data: { status: 'idle' } });

        logger.info('\n--- Workflow Complete ---');
        logger.info('Check the database for the message history!');

        const count = await prisma.message.count();
        logger.info(`Total messages persisted: ${count}`);

        process.exit(0);
    } catch (error) {
        logger.error('❌ Demo failed:', error);
        process.exit(1);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

runDemo();
