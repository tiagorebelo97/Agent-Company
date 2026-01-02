/**
 * Task Health Monitor
 * 
 * Monitors tasks and automatically resets stuck tasks
 * - Tasks in 'in_progress' for more than 5 minutes
 * - Orphaned tasks (assigned to offline agents)
 */

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

class TaskHealthMonitor {
    constructor() {
        this.prisma = new PrismaClient();
        this.checkInterval = 60000; // Check every 1 minute
        this.taskTimeout = 5 * 60 * 1000; // 5 minutes timeout
        this.intervalId = null;
    }

    start() {
        logger.info('TaskHealthMonitor started');

        // Run initial check
        this.checkStuckTasks();

        // Schedule periodic checks
        this.intervalId = setInterval(() => {
            this.checkStuckTasks();
        }, this.checkInterval);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            logger.info('TaskHealthMonitor stopped');
        }
    }

    async checkStuckTasks() {
        try {
            const now = new Date();
            const timeoutThreshold = new Date(now.getTime() - this.taskTimeout);

            // Find tasks stuck in in_progress
            const stuckTasks = await this.prisma.task.findMany({
                where: {
                    status: 'in_progress',
                    updatedAt: {
                        lt: timeoutThreshold
                    }
                }
            });

            if (stuckTasks.length > 0) {
                logger.warn(`Found ${stuckTasks.length} stuck tasks, resetting...`);

                for (const task of stuckTasks) {
                    await this.resetTask(task);
                }
            }

        } catch (error) {
            logger.error(`TaskHealthMonitor error: ${error.message}`);
        }
    }

    async resetTask(task) {
        try {
            await this.prisma.task.update({
                where: { id: task.id },
                data: {
                    status: 'todo',
                    assignedToId: null
                }
            });

            logger.info(`Reset stuck task: ${task.title} (${task.id})`);
        } catch (error) {
            logger.error(`Failed to reset task ${task.id}: ${error.message}`);
        }
    }

    async resetAllInProgressTasks() {
        try {
            const result = await this.prisma.task.updateMany({
                where: {
                    status: 'in_progress'
                },
                data: {
                    status: 'todo',
                    assignedToId: null
                }
            });

            if (result.count > 0) {
                logger.info(`Reset ${result.count} in-progress tasks on shutdown`);
            }
        } catch (error) {
            logger.error(`Failed to reset tasks on shutdown: ${error.message}`);
        }
    }

    async disconnect() {
        await this.prisma.$disconnect();
    }
}

export default new TaskHealthMonitor();
