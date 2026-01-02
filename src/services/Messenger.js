import redis from './redis.js';
import logger from '../utils/logger.js';
import prisma from '../database/client.js';

class Messenger {
    constructor() {
        this.handlers = new Map();
    }

    async init() {
        await redis.connect();

        // Subscribe to global agent communication channel
        await redis.subscribe('agent:communication', async (data) => {
            await this.handleIncomingMessage(data);
        });

        logger.info('Messenger service initialized');
    }

    /**
     * Send a message from one agent to another
     */
    async sendMessage(fromId, toId, content, type = 'chat') {
        const messageData = {
            fromId,
            toId,
            content,
            type,
            timestamp: Date.now()
        };

        // 1. Persist to database
        try {
            await prisma.message.create({
                data: {
                    fromId,
                    toId,
                    content,
                    type
                }
            });
        } catch (error) {
            logger.error('Failed to persist message:', error);
        }

        // 2. Publish to Redis for real-time delivery
        await redis.publish('agent:communication', messageData);

        logger.debug(`Message sent from ${fromId} to ${toId}`);
    }

    /**
     * Register a handler for messages addressed to a specific agent
     */
    registerAgent(agentId, handler) {
        this.handlers.set(agentId, handler);
    }

    unregisterAgent(agentId) {
        this.handlers.delete(agentId);
    }

    /**
     * Handle message received from Redis
     */
    async handleIncomingMessage(data) {
        const { toId, fromId, content, type } = data;

        // If we have a local handler for this agent, call it
        const handler = this.handlers.get(toId);
        if (handler) {
            try {
                await handler(data);
            } catch (error) {
                logger.error(`Error in local message handler for agent ${toId}:`, error);
            }
        }
    }
}

export default new Messenger();
