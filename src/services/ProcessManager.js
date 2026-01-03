import { EventEmitter } from 'events';
import logger from '../utils/logger.js';

/**
 * ProcessManager - Handles graceful shutdown and process cleanup
 */
class ProcessManager extends EventEmitter {
    constructor() {
        super();
        this.isShuttingDown = false;
        this.processes = new Set();
        this.setupSignalHandlers();
    }

    /**
     * Register a process for cleanup
     */
    register(process, name) {
        this.processes.add({ process, name });
        logger.info(`ProcessManager: Registered ${name}`);
    }

    /**
     * Setup signal handlers for graceful shutdown
     */
    setupSignalHandlers() {
        // Handle Ctrl+C
        process.on('SIGINT', () => this.shutdown('SIGINT'));

        // Handle kill command
        process.on('SIGTERM', () => this.shutdown('SIGTERM'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            this.shutdown('UNCAUGHT_EXCEPTION');
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
            this.shutdown('UNHANDLED_REJECTION');
        });
    }

    /**
     * Graceful shutdown
     */
    async shutdown(signal) {
        if (this.isShuttingDown) {
            logger.warn('Shutdown already in progress...');
            return;
        }

        this.isShuttingDown = true;
        logger.info(`\n🛑 Received ${signal}, starting graceful shutdown...`);

        try {
            // Emit shutdown event
            this.emit('shutdown');

            // Kill all registered processes
            logger.info('Stopping registered processes...');
            for (const { process: proc, name } of this.processes) {
                try {
                    if (proc && proc.kill) {
                        proc.kill();
                        logger.info(`✅ Stopped ${name}`);
                    }
                } catch (error) {
                    logger.error(`Failed to stop ${name}:`, error);
                }
            }

            // Wait a bit for cleanup
            await new Promise(resolve => setTimeout(resolve, 1000));

            logger.info('✅ Graceful shutdown complete');
            process.exit(0);
        } catch (error) {
            logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    }

    /**
     * Check if port is in use
     */
    async isPortInUse(port) {
        return new Promise(async (resolve) => {
            const net = await import('net');
            const server = net.createServer();

            server.once('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });

            server.once('listening', () => {
                server.close();
                resolve(false);
            });

            server.listen(port);
        });
    }

    /**
     * Wait for port to be free
     */
    async waitForPort(port, maxAttempts = 10) {
        for (let i = 0; i < maxAttempts; i++) {
            const inUse = await this.isPortInUse(port);
            if (!inUse) {
                logger.info(`Port ${port} is free`);
                return true;
            }
            logger.warn(`Port ${port} still in use, waiting... (${i + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        throw new Error(`Port ${port} is still in use after ${maxAttempts} attempts`);
    }
}

export default new ProcessManager();
