/**
 * AgentRegistry - Central registry for all agents
 * 
 * Manages:
 * - Agent registration and discovery
 * - Load balancing
 * - Health checks
 * - Agent lifecycle
 */

import { EventEmitter } from 'events';
import logger from '../../utils/logger.js';

class AgentRegistry extends EventEmitter {
    constructor() {
        super();

        if (AgentRegistry.instance) {
            return AgentRegistry.instance;
        }

        this.agents = new Map();
        this.agentsBySkill = new Map();
        this.agentsByCategory = new Map();

        AgentRegistry.instance = this;
        logger.info('AgentRegistry initialized');
    }

    /**
     * Register a new agent
     */
    register(agent) {
        if (this.agents.has(agent.id)) {
            throw new Error(`Agent ${agent.id} already registered`);
        }

        this.agents.set(agent.id, agent);

        // Index by skills
        for (const skill of agent.skills) {
            if (!this.agentsBySkill.has(skill)) {
                this.agentsBySkill.set(skill, []);
            }
            this.agentsBySkill.get(skill).push(agent);
        }

        // Index by category
        const category = agent.category || 'general';
        if (!this.agentsByCategory.has(category)) {
            this.agentsByCategory.set(category, []);
        }
        this.agentsByCategory.get(category).push(agent);

        // Listen to agent events
        agent.on('task:start', (data) => this.emit('agent:task:start', { agentId: agent.id, ...data }));
        agent.on('task:complete', (data) => this.emit('agent:task:complete', { agentId: agent.id, ...data }));
        agent.on('task:fail', (data) => this.emit('agent:task:fail', { agentId: agent.id, ...data }));
        agent.on('message:send', (data) => this.routeMessage(data));

        logger.info(`Registered agent: ${agent.name} (${agent.id})`);
        this.emit('agent:registered', agent.getStatus());

        return agent;
    }

    /**
     * Unregister an agent
     */
    async unregister(agentId) {
        const agent = this.agents.get(agentId);

        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }

        await agent.shutdown();
        this.agents.delete(agentId);

        // Remove from skill index
        for (const skill of agent.skills) {
            const agents = this.agentsBySkill.get(skill);
            if (agents) {
                const index = agents.findIndex(a => a.id === agentId);
                if (index !== -1) {
                    agents.splice(index, 1);
                }
            }
        }

        logger.info(`Unregistered agent: ${agent.name} (${agentId})`);
        this.emit('agent:unregistered', agentId);
    }

    /**
     * Get agent by ID
     */
    getAgent(agentId) {
        return this.agents.get(agentId);
    }

    /**
     * Get all agents
     */
    getAllAgents() {
        return Array.from(this.agents.values());
    }

    /**
     * Find agents by skill
     */
    findBySkill(skill) {
        return this.agentsBySkill.get(skill) || [];
    }

    /**
     * Find agents by category
     */
    findByCategory(category) {
        return this.agentsByCategory.get(category) || [];
    }

    /**
     * Find best agent for a task (load balancing)
     */
    findBestAgent(criteria = {}) {
        let candidates = Array.from(this.agents.values());

        // Filter by skill if specified
        if (criteria.skill) {
            candidates = this.findBySkill(criteria.skill);
        }

        // Filter by category if specified
        if (criteria.category) {
            candidates = candidates.filter(a => a.category === criteria.category);
        }

        // Filter by status
        candidates = candidates.filter(a => a.status !== 'offline' && a.status !== 'error');

        if (candidates.length === 0) {
            return null;
        }

        // Sort by load (ascending) - least loaded first
        candidates.sort((a, b) => a.currentLoad - b.currentLoad);

        return candidates[0];
    }

    /**
     * Route message between agents
     */
    async routeMessage(messageData) {
        const targetAgent = this.getAgent(messageData.to);

        if (!targetAgent) {
            logger.error(`Cannot route message: Agent ${messageData.to} not found`);
            return;
        }

        try {
            await targetAgent.receiveMessage(messageData);
        } catch (error) {
            logger.error(`Error routing message to ${messageData.to}:`, error);
        }
    }

    /**
     * Broadcast message to all agents
     */
    async broadcast(message) {
        const promises = [];

        for (const agent of this.agents.values()) {
            promises.push(agent.receiveMessage({
                from: 'system',
                to: agent.id,
                message,
                timestamp: Date.now()
            }));
        }

        await Promise.allSettled(promises);
    }

    /**
     * Get registry statistics
     */
    getStats() {
        const agents = this.getAllAgents();

        return {
            totalAgents: agents.length,
            activeAgents: agents.filter(a => a.status === 'active' || a.status === 'busy').length,
            idleAgents: agents.filter(a => a.status === 'idle').length,
            averageLoad: agents.reduce((sum, a) => sum + a.currentLoad, 0) / agents.length || 0,
            totalTasksCompleted: agents.reduce((sum, a) => sum + a.stats.tasksCompleted, 0),
            totalTasksFailed: agents.reduce((sum, a) => sum + a.stats.tasksFailed, 0)
        };
    }

    /**
     * Health check for all agents
     */
    async healthCheck() {
        const results = [];

        for (const agent of this.agents.values()) {
            results.push({
                id: agent.id,
                name: agent.name,
                status: agent.status,
                load: agent.currentLoad,
                healthy: agent.status !== 'error'
            });
        }

        return results;
    }

    /**
     * Shutdown all agents
     */
    async shutdownAll() {
        logger.info('Shutting down all agents...');

        const promises = [];
        for (const agent of this.agents.values()) {
            promises.push(agent.shutdown());
        }

        await Promise.allSettled(promises);
        this.agents.clear();
        this.agentsBySkill.clear();
        this.agentsByCategory.clear();

        logger.info('All agents shut down');
    }
}

// Singleton instance
export default new AgentRegistry();
