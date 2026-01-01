/**
 * BaseAgent - Node.js Agent Wrapper for Python implementations
 * 
 * Provides:
 * - Python child process management
 * - JSON-RPC bridge (Bridge -> Python Agent)
 * - MCP tool routing (Python Agent -> Bridge -> MCP)
 * - Task and message delegation
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';
import path from 'path';
import logger from '../../utils/logger.js';

export class BaseAgent extends EventEmitter {
    constructor(id, name, config = {}) {
        super();
        this.id = id;
        this.name = name;
        this.role = config.role || 'General Agent';
        this.emoji = config.emoji || '🤖';
        this.color = config.color || '#3b82f6';
        this.category = config.category || 'other';
        this.status = 'idle'; // idle, busy, thinking, error
        this.skills = config.skills || [];
        this.mcps = config.mcps || [];
        this.mcpConnections = new Map();

        // Python Process Management
        this.pythonProcess = null;
        // Default path: src/agents/implementations/<AgentName>/main.py
        const agentFolderName = config.folderName || this.name.replace(/\s+/g, '');
        this.agentPath = config.pythonPath || path.join(process.cwd(), 'src', 'agents', 'implementations', agentFolderName, 'main.py');

        this.pendingPythonRequests = new Map();
        this.requestId = 0;

        // Statistics
        this.stats = {
            tasksCompleted: 0,
            tasksFailed: 0,
            averageResponseTime: 0,
            uptime: Date.now()
        };

        this.load = 0; // 0-100
        this.isReal = true;
    }

    /**
     * Start the Python agent process
     */
    async startPythonAgent() {
        logger.info(`${this.name}: Starting Python agent at ${this.agentPath}`);

        this.pythonProcess = spawn('python', [this.agentPath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Handle StdOut (JSON messages or logs)
        this.pythonProcess.stdout.on('data', (data) => {
            const lines = data.toString().split('\n').filter(l => l.trim());
            for (const line of lines) {
                try {
                    const message = JSON.parse(line);
                    this.handlePythonMessage(message);
                } catch (error) {
                    // If not JSON, treat as raw log
                    logger.debug(`${this.name} Python Output: ${line}`);
                }
            }
        });

        // Handle StdErr (Errors)
        this.pythonProcess.stderr.on('data', (data) => {
            logger.error(`${this.name} Python Error: ${data.toString()}`);
        });

        this.pythonProcess.on('exit', (code) => {
            logger.warn(`${this.name}: Python process exited with code ${code}`);
            this.status = 'error';
        });

        // Wait for ready signal (optional stabilization delay)
        return new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }

    /**
     * Handle incoming messages from Python agent
     */
    async handlePythonMessage(message) {
        if (message.type === 'tool_call') {
            // Python wants to call an MCP tool
            await this.handleMCPToolCall(message);
        } else if (message.type === 'response') {
            // Python responded to a request from Node
            const pending = this.pendingPythonRequests.get(message.requestId);
            if (pending) {
                pending.resolve(message.result);
                this.pendingPythonRequests.delete(message.requestId);
            }
        } else if (message.type === 'log') {
            logger.info(`${this.name} (Python): ${message.content}`);
        } else if (message.type === 'status_update') {
            this.status = message.status;
            this.updateLoad();
        } else if (message.type === 'assign_task') {
            // PM wants to assign a task to another agent
            await this.handleTaskAssignment(message);
        }
    }

    /**
     * Handle task assignment from PM to other agents
     */
    async handleTaskAssignment(message) {
        const { targetAgent, task } = message;
        logger.info(`${this.name}: Routing task '${task.description}' to ${targetAgent}`);

        // Get the target agent from registry
        const AgentRegistry = (await import('./AgentRegistry.js')).default;
        const agent = AgentRegistry.getAgent(targetAgent);

        if (agent) {
            // Execute task on target agent (async, don't wait)
            agent.executeTask(task).then(result => {
                logger.info(`Task ${task.id} completed by ${targetAgent}:`, result);
            }).catch(error => {
                logger.error(`Task ${task.id} failed on ${targetAgent}:`, error);
            });
        } else {
            logger.warn(`Target agent ${targetAgent} not found`);
        }
    }

    /**
     * Route tool calls from Python to connected MCPs
     */
    async handleMCPToolCall(message) {
        const { mcpName, toolName, args, requestId } = message;
        try {
            const result = await this.callMCPTool(mcpName, toolName, args);
            this.sendToPython({
                type: 'tool_response',
                requestId,
                result
            });
        } catch (error) {
            logger.error(`${this.name}: Tool call failed: ${error.message}`);
            this.sendToPython({
                type: 'tool_response',
                requestId,
                error: error.message
            });
        }
    }

    /**
     * Send message to Python agent via StdIn
     */
    sendToPython(message) {
        if (this.pythonProcess && this.pythonProcess.stdin.writable) {
            this.pythonProcess.stdin.write(JSON.stringify(message) + '\n');
        } else {
            logger.error(`${this.name}: Cannot send to Python, process not writable`);
        }
    }

    /**
     * Connect to required MCP servers and start Python agent
     */
    async connectMCPs(mcpManager) {
        logger.info(`${this.name}: Connecting to MCPs: ${this.mcps.join(', ')}`);

        for (const mcpName of this.mcps) {
            try {
                const connection = await mcpManager.connect(mcpName, this.id);
                this.mcpConnections.set(mcpName, connection);
                logger.info(`${this.name}: Connected to MCP ${mcpName}`);
            } catch (error) {
                logger.error(`${this.name}: Failed to connect to MCP ${mcpName}:`, error);
            }
        }

        // Start the Python implementation
        await this.startPythonAgent();
    }

    /**
     * Execute a task (delegates to Python)
     */
    async executeTask(task) {
        const taskId = task.id || uuidv4();
        const startTime = Date.now();

        this.status = 'busy';
        this.updateLoad();

        logger.info(`${this.name}: Delegating task ${taskId} to Python`);
        this.emit('task:start', { agentId: this.id, taskId, task });

        try {
            const requestId = ++this.requestId;
            const resultPromise = new Promise((resolve, reject) => {
                this.pendingPythonRequests.set(requestId, { resolve, reject });
                // Timeout after 5 minutes
                setTimeout(() => reject(new Error('Python task timeout')), 300000);
            });

            this.sendToPython({
                type: 'execute_task',
                requestId,
                task: { ...task, id: taskId }
            });

            const result = await resultPromise;

            const duration = Date.now() - startTime;
            this.completeTask(taskId, result, duration);
            return result;
        } catch (error) {
            this.failTask(taskId, error);
            throw error;
        }
    }

    /**
     * Call an MCP tool (Internal use)
     */
    async callMCPTool(mcpName, toolName, args = {}) {
        const connection = this.mcpConnections.get(mcpName);
        if (!connection) {
            throw new Error(`MCP '${mcpName}' not connected`);
        }

        return await connection.callTool(toolName, args);
    }

    /**
     * Receive and handle a message from another agent or user
     */
    async receiveMessage(message) {
        const requestId = ++this.requestId;
        const resultPromise = new Promise((resolve, reject) => {
            this.pendingPythonRequests.set(requestId, { resolve, reject });
        });

        this.sendToPython({
            type: 'handle_message',
            requestId,
            message
        });

        return await resultPromise;
    }

    completeTask(taskId, result, duration) {
        this.status = 'idle';
        this.stats.tasksCompleted++;
        this.updateStats(duration);
        this.updateLoad();

        this.emit('task:complete', { agentId: this.id, taskId, result, duration });
        logger.info(`${this.name}: Task ${taskId} completed`);
    }

    failTask(taskId, error) {
        this.status = 'idle';
        this.stats.tasksFailed++;
        this.updateLoad();

        this.emit('task:fail', { agentId: this.id, taskId, error: error.message });
        logger.error(`${this.name}: Task ${taskId} failed:`, error);
    }

    updateLoad() {
        this.load = (this.status === 'busy' || this.status === 'thinking') ? 100 : 0;
    }

    updateStats(duration) {
        const n = this.stats.tasksCompleted;
        this.stats.averageResponseTime = (this.stats.averageResponseTime * (n - 1) + duration) / n;
    }

    getStatus() {
        return {
            id: this.id,
            name: this.name,
            role: this.role,
            emoji: this.emoji,
            color: this.color,
            category: this.category,
            status: this.status,
            load: this.load,
            skills: this.skills,
            stats: this.stats,
            isReal: this.isReal
        };
    }

    async shutdown() {
        if (this.pythonProcess) {
            this.pythonProcess.kill();
        }
        logger.info(`${this.name}: Bridge closed`);
    }
}

export default BaseAgent;
