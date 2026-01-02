/**
 * AgentHealthMonitor - Monitors agent health and auto-restarts crashed agents
 * 
 * Features:
 * - Periodic health checks (every 30 seconds)
 * - Auto-restart crashed Python agents
 * - WebSocket notifications for health changes
 * - Crash history tracking
 */

import logger from '../utils/logger.js';
import AgentRegistry from '../agents/core/AgentRegistry.js';
import prisma from '../database/client.js';

class AgentHealthMonitor {
    constructor(io) {
        this.io = io;
        this.checkInterval = 30000; // 30 seconds
        this.intervalId = null;
        this.crashHistory = new Map(); // agentId -> [timestamps]
        this.maxCrashesBeforeAlert = 3;
        this.crashWindowMs = 300000; // 5 minutes
    }

    /**
     * Start monitoring all agents
     */
    start() {
        logger.info('AgentHealthMonitor: Starting health monitoring');

        // Initial check
        this.checkAllAgents();

        // Schedule periodic checks
        this.intervalId = setInterval(() => {
            this.checkAllAgents();
        }, this.checkInterval);
    }

    /**
     * Stop monitoring
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            logger.info('AgentHealthMonitor: Stopped health monitoring');
        }
    }

    /**
     * Check health of all agents
     */
    async checkAllAgents() {
        const agents = AgentRegistry.getAllAgents();

        for (const agent of agents) {
            await this.checkAgentHealth(agent);
        }
    }

    /**
     * Check health of a single agent
     */
    async checkAgentHealth(agent) {
        try {
            // Check if Python process is running
            const isHealthy = this.isPythonProcessHealthy(agent);

            if (!isHealthy && agent.status !== 'error') {
                logger.warn(`AgentHealthMonitor: Agent ${agent.id} (${agent.name}) is unhealthy`);
                await this.handleUnhealthyAgent(agent);
            } else if (isHealthy && agent.status === 'error') {
                // Agent recovered
                logger.info(`AgentHealthMonitor: Agent ${agent.id} (${agent.name}) recovered`);
                await this.handleRecoveredAgent(agent);
            }
        } catch (error) {
            logger.error(`AgentHealthMonitor: Error checking agent ${agent.id}:`, error);
        }
    }

    /**
     * Check if Python process is healthy
     */
    isPythonProcessHealthy(agent) {
        if (!agent.pythonProcess) {
            return false;
        }

        // Check if process is still running
        if (agent.pythonProcess.killed || agent.pythonProcess.exitCode !== null) {
            return false;
        }

        // Check if stdin is writable (process is responsive)
        if (!agent.pythonProcess.stdin || !agent.pythonProcess.stdin.writable) {
            return false;
        }

        return true;
    }

    /**
     * Handle unhealthy agent
     */
    async handleUnhealthyAgent(agent) {
        // Record crash
        this.recordCrash(agent.id);

        // Update status in database
        try {
            await prisma.agent.update({
                where: { id: agent.id },
                data: { status: 'error' }
            });
        } catch (error) {
            logger.error(`Failed to update agent ${agent.id} status:`, error);
        }

        // Emit WebSocket event
        this.io.emit('agent:health', {
            agentId: agent.id,
            agentName: agent.name,
            status: 'error',
            timestamp: new Date().toISOString()
        });

        // Check if we should attempt restart
        if (this.shouldAttemptRestart(agent.id)) {
            logger.info(`AgentHealthMonitor: Attempting to restart agent ${agent.id}`);
            await this.restartAgent(agent);
        } else {
            logger.warn(`AgentHealthMonitor: Agent ${agent.id} has crashed too many times, not restarting`);
            this.io.emit('agent:alert', {
                agentId: agent.id,
                agentName: agent.name,
                message: `Agent ${agent.name} has crashed multiple times and requires manual intervention`,
                severity: 'high',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Handle recovered agent
     */
    async handleRecoveredAgent(agent) {
        // Update status
        agent.status = 'idle';

        try {
            await prisma.agent.update({
                where: { id: agent.id },
                data: { status: 'idle' }
            });
        } catch (error) {
            logger.error(`Failed to update agent ${agent.id} status:`, error);
        }

        // Emit WebSocket event
        this.io.emit('agent:health', {
            agentId: agent.id,
            agentName: agent.name,
            status: 'idle',
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Record crash timestamp
     */
    recordCrash(agentId) {
        if (!this.crashHistory.has(agentId)) {
            this.crashHistory.set(agentId, []);
        }

        const crashes = this.crashHistory.get(agentId);
        crashes.push(Date.now());

        // Clean old crashes outside the window
        const cutoff = Date.now() - this.crashWindowMs;
        this.crashHistory.set(
            agentId,
            crashes.filter(timestamp => timestamp > cutoff)
        );
    }

    /**
     * Check if we should attempt restart
     */
    shouldAttemptRestart(agentId) {
        const crashes = this.crashHistory.get(agentId) || [];
        return crashes.length < this.maxCrashesBeforeAlert;
    }

    /**
     * Restart an agent
     */
    async restartAgent(agent) {
        try {
            // Kill existing process if it exists
            if (agent.pythonProcess) {
                try {
                    agent.pythonProcess.kill('SIGTERM');
                } catch (error) {
                    logger.warn(`Failed to kill process for agent ${agent.id}:`, error);
                }
            }

            // Wait a bit for cleanup
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Restart the Python agent
            await agent.startPythonAgent();

            logger.info(`AgentHealthMonitor: Successfully restarted agent ${agent.id}`);

            // Emit success event
            this.io.emit('agent:restarted', {
                agentId: agent.id,
                agentName: agent.name,
                timestamp: new Date().toISOString()
            });

            return true;
        } catch (error) {
            logger.error(`AgentHealthMonitor: Failed to restart agent ${agent.id}:`, error);

            // Emit failure event
            this.io.emit('agent:restart_failed', {
                agentId: agent.id,
                agentName: agent.name,
                error: error.message,
                timestamp: new Date().toISOString()
            });

            return false;
        }
    }

    /**
     * Get crash history for an agent
     */
    getCrashHistory(agentId) {
        return this.crashHistory.get(agentId) || [];
    }

    /**
     * Get health report for all agents
     */
    getHealthReport() {
        const agents = AgentRegistry.getAllAgents();

        return agents.map(agent => ({
            id: agent.id,
            name: agent.name,
            status: agent.status,
            healthy: this.isPythonProcessHealthy(agent),
            crashes: this.getCrashHistory(agent.id).length,
            lastCrash: this.getLastCrash(agent.id)
        }));
    }

    /**
     * Get last crash timestamp
     */
    getLastCrash(agentId) {
        const crashes = this.crashHistory.get(agentId) || [];
        return crashes.length > 0 ? new Date(crashes[crashes.length - 1]) : null;
    }
}

export default AgentHealthMonitor;
