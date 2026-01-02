import prisma from '../src/database/client.js';
import messenger from '../src/services/Messenger.js';
import logger from '../src/utils/logger.js';

async function verifyFoundation() {
    logger.info('🔍 Starting Foundation Verification...');

    try {
        // 1. Test Database
        logger.info('Testing Database persistence...');
        const testAgent = await prisma.agent.upsert({
            where: { id: 'test-agent' },
            update: { status: 'testing' },
            create: {
                id: 'test-agent',
                name: 'Test Agent',
                skills: '[]',
                status: 'testing'
            }
        });
        logger.info(`✅ Database Agent persist: ${testAgent.id}`);

        // 2. Test Messenger
        logger.info('Testing Messenger/Redis PubSub...');
        await messenger.init();

        const messageReceived = new Promise((resolve) => {
            messenger.registerAgent('test-target', (data) => {
                logger.info(`📬 Received message: ${data.content}`);
                resolve(data);
            });
        });

        await messenger.sendMessage('test-agent', 'test-target', 'Foundation is solid!');

        const received = await messageReceived;
        if (received.content === 'Foundation is solid!') {
            logger.info('✅ Messenger verification successful');
        }

        // 3. Cleanup
        await prisma.agent.delete({ where: { id: 'test-agent' } });
        logger.info('✅ Cleanup complete');

        process.exit(0);
    } catch (error) {
        logger.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

verifyFoundation();
