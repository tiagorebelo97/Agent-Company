/**
 * TaskMonitor - Monitors and assigns tasks to agents
 * 
 * Periodically checks for tasks assigned to agents and triggers execution
 */

import logger from '../../utils/logger.js';
import prisma from '../../database/client.js';

class TaskMonitor {
    constructor(agentRegistry) {
        this.agentRegistry = agentRegistry;
        this.checkInterval = 30000; // Check every 30 seconds
        this.isRunning = false;
        this.intervalId = null;
    }

    /**
     * Start monitoring for tasks
     */
    start() {
        if (this.isRunning) {
            logger.warn('TaskMonitor already running');
            return;
        }

        this.isRunning = true;
        logger.info(`TaskMonitor started (checking every ${this.checkInterval}ms)`);

        // Initial check
        this.checkTasks();

        // Set up periodic checking
        this.intervalId = setInterval(() => {
            this.checkTasks();
        }, this.checkInterval);
    }

    /**
     * Stop monitoring
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        logger.info('TaskMonitor stopped');
    }

    /**
     * Check for tasks and assign to agents
     */
    async checkTasks() {
        try {
            // Get all tasks with status 'todo' that have assigned agents
            const tasks = await prisma.task.findMany({
                where: {
                    status: 'todo'
                },
                include: {
                    agents: {
                        include: {
                            agent: true
                        }
                    }
                }
            });

            if (tasks.length === 0) {
                return;
            }

            logger.info(`TaskMonitor: Found ${tasks.length} tasks to process`);

            for (const task of tasks) {
                await this.processTask(task);
            }
        } catch (error) {
            logger.error('TaskMonitor: Error checking tasks:', error);
        }
    }

    /**
     * Process a single task
     */
    async processTask(task) {
        try {
            // Get assigned agents
            const assignedAgents = task.agents.map(ta => ta.agent);

            if (assignedAgents.length === 0) {
                logger.warn(`Task ${task.id} has no assigned agents`);
                return;
            }

            logger.info(`Task ${task.id}: "${task.title}" assigned to ${assignedAgents.map(a => a.id).join(', ')}`);

            // Update task status to in_progress
            await prisma.task.update({
                where: { id: task.id },
                data: { status: 'in_progress' }
            });

            // If multiple agents, assign to the first one as lead
            // (In future, could implement more sophisticated assignment logic)
            const leadAgent = this.agentRegistry.getAgent(assignedAgents[0].id);

            if (!leadAgent) {
                logger.warn(`Lead agent ${assignedAgents[0].id} not found in registry`);
                return;
            }

            // Execute task
            logger.info(`Executing task ${task.id} on agent ${leadAgent.id}`);

            // Convert task to format expected by executeTask
            const taskPayload = {
                id: task.id,
                type: 'feature_implementation',
                description: task.title,
                requirements: {
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    tags: JSON.parse(task.tags || '[]'),
                    dueDate: task.dueDate,
                    collaborators: assignedAgents.map(a => ({
                        id: a.id,
                        name: a.name,
                        role: a.role
                    }))
                }
            };

            // Execute asynchronously (don't wait)
            leadAgent.executeTask(taskPayload)
                .then(result => {
                    logger.info(`Task ${task.id} completed successfully:`, result);
                })
                .catch(error => {
                    logger.error(`Task ${task.id} failed:`, error);
                });

        } catch (error) {
            logger.error(`Error processing task ${task.id}:`, error);
        }
    }

    /**
     * Manually trigger task check (for testing)
     */
    async triggerCheck() {
        logger.info('TaskMonitor: Manual trigger');
        await this.checkTasks();
    }
}

export default TaskMonitor;
