import { createClient } from 'redis';
import { EventEmitter } from 'events';
import logger from '../utils/logger.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisService {
    constructor() {
        this.client = createClient({
            url: redisUrl,
            socket: { reconnectStrategy: false }
        });

        this.pubClient = createClient({
            url: redisUrl,
            socket: { reconnectStrategy: false }
        });

        this.subClient = createClient({
            url: redisUrl,
            socket: { reconnectStrategy: false }
        });

        this.client.on('error', (err) => logger.error('Redis Client Error', err));
        this.pubClient.on('error', (err) => logger.error('Redis Pub Client Error', err));
        this.subClient.on('error', (err) => logger.error('Redis Sub Client Error', err));

        this.isConnected = false;
        this.fallbackEmitter = new EventEmitter();
    }

    async connect() {
        if (this.isConnected) return;

        try {
            await Promise.all([
                this.client.connect(),
                this.pubClient.connect(),
                this.subClient.connect()
            ]);

            this.isConnected = true;
            logger.info('Connected to Redis');
        } catch (error) {
            logger.warn('Failed to connect to Redis, using local event emitter fallback.');
            this.isConnected = false;
        }
    }

    async get(key) {
        if (!this.isConnected) return null;
        return await this.client.get(key);
    }

    async set(key, value, options = {}) {
        if (!this.isConnected) return null;
        return await this.client.set(key, value, options);
    }

    async publish(channel, message) {
        if (this.isConnected) {
            return await this.pubClient.publish(channel, JSON.stringify(message));
        } else {
            this.fallbackEmitter.emit(channel, JSON.stringify(message));
        }
    }

    async subscribe(channel, callback) {
        if (this.isConnected) {
            return await this.subClient.subscribe(channel, (message) => {
                try {
                    callback(JSON.parse(message));
                } catch (error) {
                    logger.error(`Error parsing Redis message from channel ${channel}:`, error);
                }
            });
        } else {
            this.fallbackEmitter.on(channel, (message) => {
                try {
                    callback(JSON.parse(message));
                } catch (error) {
                    logger.error(`Error parsing local fallback message from channel ${channel}:`, error);
                }
            });
        }
    }

    async disconnect() {
        await Promise.all([
            this.client.disconnect(),
            this.pubClient.disconnect(),
            this.subClient.disconnect()
        ]);
        this.isConnected = false;
    }
}

export default new RedisService();
