/**
 * BackendAgent - Specialist in API development and Database management
 * 
 * Responsibilities:
 * - Design and implement API endpoints
 * - Manage database schemas
 * - Implement business logic
 * - Build authentication/security layers
 */

import BaseAgent from '../core/BaseAgent.js';
import logger from '../../utils/logger.js';

export class BackendAgent extends BaseAgent {
    constructor() {
        super('backend', 'Backend Engineer', {
            role: 'API & Business Logic',
            emoji: '⚙️',
            color: '#ef4444',
            category: 'development',
            skills: [
                'Node.js',
                'Express',
                'API Design',
                'Database Schema',
                'Authentication',
                'Server Optimization'
            ],
            mcps: ['filesystem', 'database']
        });
    }

    /**
     * Handle incoming task
     */
    async handleTask(task) {
        logger.info(`${this.name}: Handling task: ${task.description}`);

        switch (task.type) {
            case 'create_api':
                return await this.createAPI(task);
            case 'create_schema':
                return await this.createSchema(task);
            case 'implement_logic':
                return await this.implementLogic(task);
            default:
                if (task.type === 'backend') {
                    return await this.createAPI(task);
                }
                throw new Error(`Unknown task type for Backend Agent: ${task.type}`);
        }
    }

    /**
     * Create API endpoint
     */
    async createAPI(task) {
        const { description, path } = task;
        const apiPath = path || 'src/routes/api.js';

        logger.info(`${this.name}: Creating API endpoint at ${apiPath}`);

        const code = `
import express from 'express';
const router = express.Router();

// ${description}
router.get('/', (req, res) => {
    res.json({ message: 'API active', description: '${description}' });
});

export default router;
        `;

        try {
            const result = await this.callMCPTool('filesystem', 'write_file', {
                path: apiPath,
                content: code
            });

            return {
                status: 'success',
                message: `API route created at ${apiPath}`,
                result
            };
        } catch (error) {
            logger.error(`${this.name}: Failed to create API file:`, error);
            throw error;
        }
    }

    /**
     * Create database schema
     */
    async createSchema(task) {
        // Logic for creating migrations or schema files
        return { status: 'success', message: 'Schema created' };
    }

    /**
     * Implement business logic
     */
    async implementLogic(task) {
        return { status: 'success', message: 'Logic implemented' };
    }
}

export default BackendAgent;
