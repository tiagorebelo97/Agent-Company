/**
 * ProjectManagerAgent - Orchestrates tasks and coordinates other agents
 * 
 * Responsibilities:
 * - Task decomposition
 * - Agent coordination
 * - Priority management
 * - Timeline tracking
 * - Progress monitoring
 */

import BaseAgent from '../core/BaseAgent.js';
import AgentRegistry from '../core/AgentRegistry.js';
import logger from '../../utils/logger.js';

export class ProjectManagerAgent extends BaseAgent {
    constructor() {
        super('pm', 'Project Manager', {
            role: 'Task Orchestration & Coordination',
            emoji: '🎯',
            color: '#8b5cf6',
            category: 'management',
            skills: [
                'Task Decomposition',
                'Priority Management',
                'Timeline Tracking',
                'Agent Coordination',
                'Resource Allocation'
            ],
            mcps: ['filesystem', 'git']
        });

        this.projects = new Map();
        this.taskQueue = [];
    }

    /**
     * Handle incoming task
     */
    async handleTask(task) {
        logger.info(`PM: Received task: ${task.description}`);

        switch (task.type) {
            case 'create_feature':
                return await this.createFeature(task);
            case 'decompose_task':
                return await this.decomposeTask(task);
            case 'assign_task':
                return await this.assignTask(task);
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    /**
     * Create a new feature (high-level task)
     */
    async createFeature(task) {
        const { description, requirements } = task;

        logger.info(`PM: Creating feature: ${description}`);

        // Step 1: Analyze requirements
        const analysis = await this.analyzeRequirements(requirements);

        // Step 2: Decompose into subtasks
        const subtasks = await this.decomposeIntoSubtasks(description, analysis);

        // Step 3: Assign subtasks to agents
        const assignments = [];
        for (const subtask of subtasks) {
            const assignment = await this.assignSubtask(subtask);
            assignments.push(assignment);
        }

        // Step 4: Create project tracking
        const projectId = `project-${Date.now()}`;
        this.projects.set(projectId, {
            id: projectId,
            description,
            subtasks,
            assignments,
            status: 'in_progress',
            createdAt: Date.now()
        });

        return {
            projectId,
            subtasks: subtasks.length,
            assignments
        };
    }

    /**
     * Analyze requirements
     */
    async analyzeRequirements(requirements) {
        // Simple analysis for now
        return {
            frontend: requirements.includes('UI') || requirements.includes('component'),
            backend: requirements.includes('API') || requirements.includes('endpoint'),
            database: requirements.includes('database') || requirements.includes('schema'),
            testing: true, // Always include testing
            deployment: requirements.includes('deploy')
        };
    }

    /**
     * Decompose feature into subtasks
     */
    async decomposeIntoSubtasks(description, analysis) {
        const subtasks = [];

        if (analysis.database) {
            subtasks.push({
                id: `task-${Date.now()}-db`,
                type: 'database',
                description: `Create database schema for ${description}`,
                priority: 'high',
                estimatedTime: '1h'
            });
        }

        if (analysis.backend) {
            subtasks.push({
                id: `task-${Date.now()}-api`,
                type: 'backend',
                description: `Create API endpoints for ${description}`,
                priority: 'high',
                estimatedTime: '2h',
                dependencies: analysis.database ? ['database'] : []
            });
        }

        if (analysis.frontend) {
            subtasks.push({
                id: `task-${Date.now()}-ui`,
                type: 'frontend',
                description: `Create UI components for ${description}`,
                priority: 'medium',
                estimatedTime: '3h',
                dependencies: analysis.backend ? ['backend'] : []
            });
        }

        if (analysis.testing) {
            subtasks.push({
                id: `task-${Date.now()}-test`,
                type: 'testing',
                description: `Create tests for ${description}`,
                priority: 'medium',
                estimatedTime: '1h',
                dependencies: ['frontend', 'backend']
            });
        }

        return subtasks;
    }

    /**
     * Assign subtask to appropriate agent
     */
    async assignSubtask(subtask) {
        let agent;

        switch (subtask.type) {
            case 'frontend':
                agent = AgentRegistry.findBestAgent({ skill: 'React' });
                break;
            case 'backend':
                agent = AgentRegistry.findBestAgent({ skill: 'API Development' });
                break;
            case 'database':
                agent = AgentRegistry.findBestAgent({ skill: 'Database Design' });
                break;
            case 'testing':
                agent = AgentRegistry.findBestAgent({ skill: 'Testing' });
                break;
            default:
                agent = AgentRegistry.findBestAgent({});
        }

        if (!agent) {
            logger.warn(`PM: No agent available for ${subtask.type}`);
            return {
                subtaskId: subtask.id,
                agentId: null,
                status: 'pending'
            };
        }

        logger.info(`PM: Assigning ${subtask.description} to ${agent.name}`);

        // Send task to agent (async)
        agent.executeTask(subtask).catch(error => {
            logger.error(`PM: Task ${subtask.id} failed:`, error);
        });

        return {
            subtaskId: subtask.id,
            agentId: agent.id,
            agentName: agent.name,
            status: 'assigned'
        };
    }

    /**
     * Handle messages from other agents
     */
    async handleMessage(message) {
        if (message.type === 'task_complete') {
            logger.info(`PM: Task ${message.taskId} completed by ${message.from}`);
            // Update project status
        } else if (message.type === 'task_blocked') {
            logger.warn(`PM: Task ${message.taskId} blocked: ${message.reason}`);
            // Handle blocked task
        }

        return { acknowledged: true };
    }

    /**
     * Get project status
     */
    getProjectStatus(projectId) {
        return this.projects.get(projectId);
    }
}

export default ProjectManagerAgent;
