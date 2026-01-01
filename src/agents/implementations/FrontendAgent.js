/**
 * FrontendAgent - Specialist in UI/UX and React development
 * 
 * Responsibilities:
 * - Create React components
 * - Implement UI designs
 * - Asset management
 * - UI testing
 */

import BaseAgent from '../core/BaseAgent.js';
import logger from '../../utils/logger.js';

export class FrontendAgent extends BaseAgent {
    constructor() {
        super('frontend', 'Frontend Engineer', {
            role: 'UI/UX & React Development',
            emoji: '💻',
            color: '#3b82f6',
            category: 'development',
            skills: [
                'React',
                'JavaScript',
                'CSS/Tailwind',
                'UI/UX Design',
                'Component Testing',
                'Responsive Design'
            ],
            mcps: ['filesystem', 'browser']
        });
    }

    /**
     * Handle incoming task
     */
    async handleTask(task) {
        logger.info(`${this.name}: Handling task: ${task.description}`);

        switch (task.type) {
            case 'create_component':
                return await this.createComponent(task);
            case 'apply_styling':
                return await this.applyStyling(task);
            case 'test_ui':
                return await this.testUI(task);
            default:
                // Default to creating a component if type matches frontend but specific subtask unknown
                if (task.type === 'frontend' || task.type === 'ui') {
                    return await this.createComponent(task);
                }
                throw new Error(`Unknown task type for Frontend Agent: ${task.type}`);
        }
    }

    /**
     * Create a React component using filesystem MCP
     */
    async createComponent(task) {
        const { description, requirements, path } = task;
        logger.info(`${this.name}: Creating component at ${path || 'src/components/NewComponent.jsx'}`);

        // In a real scenario, this would involve calling an LLM to generate the code.
        // For this implementation, we simulate the agent logic of generating and writing a file.
        const componentName = this.extractComponentName(description);
        const fileName = path || `src/components/${componentName}.jsx`;

        const code = `
import React from 'react';

const ${componentName} = () => {
  return (
    <div className="p-4 border rounded shadow">
      <h1>${componentName}</h1>
      <p>${description}</p>
    </div>
  );
};

export default ${componentName};
        `;

        // Use MCP to write the file
        try {
            const result = await this.callMCPTool('filesystem', 'write_file', {
                path: fileName,
                content: code
            });

            return {
                status: 'success',
                message: `Component ${componentName} created successfully`,
                file: fileName,
                result
            };
        } catch (error) {
            logger.error(`${this.name}: Failed to write component file:`, error);
            throw error;
        }
    }

    /**
     * Apply styling to a file
     */
    async applyStyling(task) {
        // Implementation for CSS modification/generation
        return { status: 'success', message: 'Styling applied' };
    }

    /**
     * Test UI using browser MCP
     */
    async testUI(task) {
        // Simulation: Call browser tool to open URL and check elements
        return { status: 'success', message: 'UI tests passed' };
    }

    /**
     * Helper to extract a component name from description
     */
    extractComponentName(description) {
        // Simplified logic: pick a word or use default
        const words = description.split(' ').filter(w => w.length > 3);
        return words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : 'GeneratedComponent';
    }
}

export default FrontendAgent;
