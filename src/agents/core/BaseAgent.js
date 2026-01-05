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
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import logger from '../../utils/logger.js';
import messenger from '../../services/Messenger.js';
import prisma from '../../database/client.js';

const execAsync = promisify(exec);

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

        // Use virtual environment Python if available
        const venvPython = path.join(process.cwd(), 'venv', 'bin', 'python');
        const pythonCmd = await fs.access(venvPython).then(() => venvPython).catch(() => 'python');

        this.pythonProcess = spawn(pythonCmd, [this.agentPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, PYTHONUTF8: '1' }
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
            // Handle tool calls from Python
            await this.handleToolCall(message);
        } else if (message.type === 'response') {
            // Python responded to a request from Node
            const pending = this.pendingPythonRequests.get(message.requestId);
            if (pending) {
                pending.resolve(message.result);
                this.pendingPythonRequests.delete(message.requestId);
            }
        } else if (message.type === 'status_update') {
            this.status = message.status;
            this.updateLoad();
            await this.updateExternalStatus(message.status);
        } else if (message.type === 'progress_update') {
            // Emit progress update via WebSocket
            this.emit('task:progress', {
                taskId: this.currentTaskId,
                agentId: this.id,
                agentName: this.name,
                progress: message.progress,
                activity: message.activity,
                timestamp: new Date().toISOString()
            });
        } else if (message.type === 'activity_log') {
            // Emit activity log via WebSocket
            this.emit('task:activity', {
                taskId: this.currentTaskId,
                agentId: this.id,
                agentName: this.name,
                message: message.message,
                timestamp: message.timestamp
            });
            // Also log to console
            logger.info(`${this.name} (Python): ${message.message}`);
        } else if (message.type === 'log') {
            logger.info(`${this.name} (Python): ${message.content}`);
        } else if (message.type === 'agent_message') {
            // Proactive message from agent (like final report)
            const content = message.content || {};
            this.emit('agent:message', {
                text: content.response || content.result || content.message || content,
                interactive: content.interactive
            });
        } else if (message.type === 'assign_task') {
            // PM wants to assign a task to another agent
            await this.handleTaskAssignment(message);
        }
    }

    /**
     * Handle tool calls from Python agent
     */
    async handleToolCall(message) {
        const { toolName, args, requestId } = message;

        try {
            let result;

            // Import AgentFileSystem dynamically
            const agentFileSystem = (await import('../utils/AgentFileSystem.js')).default;

            // File system operations
            if (toolName === 'file_system_read') {
                const content = await agentFileSystem.readFile(args.agentId, args.filePath);
                result = { success: true, content };
            }
            else if (toolName === 'file_system_write') {
                result = await agentFileSystem.writeFile(
                    args.agentId,
                    args.filePath,
                    args.content
                );
            }
            else if (toolName === 'file_system_list') {
                const files = await agentFileSystem.listFiles(args.agentId, args.dirPath);
                result = { success: true, files };
            }
            // Project file operations (real files)
            else if (toolName === 'project_read_file') {
                try {
                    const projectRoot = process.cwd();
                    const filePath = path.resolve(projectRoot, args.filePath);
                    const content = await fs.readFile(filePath, 'utf-8');
                    result = { success: true, content };
                    logger.info(`${this.name}: Read project file: ${args.filePath}`);
                } catch (err) {
                    result = { success: false, error: err.message };
                }
            }
            else if (toolName === 'project_write_file') {
                try {
                    const projectRoot = process.cwd();
                    const filePath = path.resolve(projectRoot, args.filePath);
                    await fs.mkdir(path.dirname(filePath), { recursive: true });
                    await fs.writeFile(filePath, args.content, 'utf-8');
                    result = { success: true };
                    logger.info(`${this.name}: Wrote project file: ${args.filePath}`);
                } catch (err) {
                    result = { success: false, error: err.message };
                }
            }
            else if (toolName === 'project_list_files') {
                try {
                    const projectRoot = process.cwd();
                    const dirPath = path.resolve(projectRoot, args.dirPath);
                    const files = await fs.readdir(dirPath);
                    result = { success: true, files };
                } catch (err) {
                    result = { success: false, error: err.message };
                }
            }
            else if (toolName === 'project_get') {
                try {
                    const project = await prisma.project.findUnique({
                        where: { id: args.projectId },
                        include: { tasks: { take: 10, orderBy: { createdAt: 'desc' } } }
                    });
                    result = { success: true, project };
                } catch (err) {
                    result = { success: false, error: err.message };
                }
            }
            else if (toolName === 'project_update') {
                try {
                    const { projectId, ...data } = args;
                    // Handle JSON strings if necessary (prisma expects objects for JSON fields if using json model)
                    // but our schema uses String? @default("{}").
                    const project = await prisma.project.update({
                        where: { id: projectId },
                        data: data
                    });
                    result = { success: true, project };
                    logger.info(`${this.name}: Updated project ${projectId}`);
                } catch (err) {
                    result = { success: false, error: err.message };
                }
            }
            else if (toolName === 'run_command') {
                try {
                    const { stdout, stderr } = await execAsync(args.command, {
                        cwd: args.cwd || process.cwd(),
                        timeout: 30000
                    });
                    result = { success: true, stdout: stdout.trim(), stderr: stderr.trim() };
                    logger.info(`${this.name}: Executed: ${args.command}`);
                } catch (err) {
                    result = { success: false, error: err.message };
                }
            }
            else {
                // Unknown tool
                result = { success: false, error: `Unknown tool: ${toolName}` };
            }

            // Send response back to Python
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
     * Update status in database and registry
     */
    async updateExternalStatus(status) {
        this.status = status;
        this.updateLoad();

        try {
            await prisma.agent.update({
                where: { id: this.id },
                data: {
                    status: this.status,
                    load: this.load,
                    stats: JSON.stringify(this.stats)
                }
            });
        } catch (error) {
            logger.error(`Failed to update DB status for agent ${this.id}:`, error);
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
            // Emit assignment event for UI
            this.emit('task:assigned', {
                taskId: task.id,
                taskName: task.description,
                agentId: targetAgent,
                agentName: agent.name,
                timestamp: new Date().toISOString()
            });

            // Inject parent agent ID for reporting back
            const taskWithParent = { ...task, parentAgentId: this.id };

            // Execute task on target agent (async, don't wait)
            agent.executeTask(taskWithParent).then(result => {
                logger.info(`Task ${task.id} completed by ${targetAgent}: ${JSON.stringify(result).substring(0, 50)}...`);
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

        // Store current task ID for progress tracking
        this.currentTaskId = taskId;
        this.currentParentTaskId = task.parentTaskId || task.parent_task_id;
        this.currentParentAgentId = task.parentAgentId;

        this.status = 'busy';
        this.updateLoad();

        logger.info(`[TASK ${taskId}] ========== STARTING EXECUTION ==========`);
        logger.info(`[TASK ${taskId}] Agent: ${this.id} (${this.name})`);
        logger.info(`[TASK ${taskId}] Delegating to Python bridge...`);
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

            // Upsert task to DB (might be pre-created by Monitor or PM)
            try {
                await prisma.task.upsert({
                    where: { id: taskId },
                    update: {
                        status: 'in_progress',
                        assignedToId: this.id
                    },
                    create: {
                        id: taskId,
                        title: task.requirements?.title || task.description || 'Untitled Task',
                        type: task.type,
                        description: task.description,
                        requirements: task.requirements ? JSON.stringify(task.requirements) : null,
                        status: 'in_progress',
                        assignedToId: this.id
                    }
                });
            } catch (error) {
                logger.error(`Failed to upsert task ${taskId} in DB:`, error);
            }

            const result = await resultPromise;
            logger.info(`[TASK ${taskId}] Python result received:`, JSON.stringify(result, null, 2));

            const duration = Date.now() - startTime;

            // Check if result is a delegation
            if (result && (result.assigned_to || result.assignments || result.status === 'assigned')) {
                logger.warn(`[TASK ${taskId}] ⚠️ Result is DELEGATION, not completion! Keeping status as in_progress.`);

                // Update DB to reflect it's been coordinated but still ongoing
                try {
                    await prisma.task.update({
                        where: { id: taskId },
                        data: {
                            result: JSON.stringify(result)
                        }
                    });
                } catch (e) {
                    logger.error(`[TASK ${taskId}] Failed to update delegation result:`, e);
                }

                // Move agent to idle so it can pick up other work
                await this.updateExternalStatus('idle');
                return result;
            }

            logger.info(`[TASK ${taskId}] Task execution finished with success. Marking as completed.`);
            await this.completeTask(taskId, result, duration);
            logger.info(`[TASK ${taskId}] ========== EXECUTION COMPLETE ==========`);
            return result;
        } catch (error) {
            await this.failTask(taskId, error);
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
        // Register with messenger for incoming messages
        messenger.registerAgent(this.id, async (data) => {
            // This handler is called when a message is routed via Redis
            this.sendToPython({
                type: 'handle_message',
                requestId: ++this.requestId, // We don't wait for response in pub/sub mode usually
                message: data
            });
        });

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

    /**
     * Handle chat message from user (delegates to Python's handleChatMessage)
     */
    async handleChatMessage(message, history = null, taskId = null, projectId = null) {
        if (taskId) this.currentTaskId = taskId;
        const requestId = ++this.requestId;
        const resultPromise = new Promise((resolve, reject) => {
            this.pendingPythonRequests.set(requestId, { resolve, reject });
            // Timeout after 60 seconds (allow for LLM retries)
            setTimeout(() => reject(new Error('Chat message timeout')), 60000);
        });

        this.sendToPython({
            type: 'handle_chat',
            requestId,
            message,
            history,
            taskId: this.currentTaskId,
            projectId: projectId
        });

        return await resultPromise;
    }

    async completeTask(taskId, result, duration) {
        await this.updateExternalStatus('idle');
        this.stats.tasksCompleted++;
        this.updateStats(duration);

        try {
            await prisma.task.update({
                where: { id: taskId },
                data: {
                    status: 'completed',
                    result: JSON.stringify(result),
                    duration
                }
            });
        } catch (error) {
            logger.error(`Failed to update task ${taskId} in DB:`, error);
        }

        this.emit('task:complete', { agentId: this.id, taskId, result, duration });

        // REPORT BACK TO PARENT AGENT IF EXISTS
        if (this.currentParentAgentId && this.currentParentAgentId !== this.id) {
            import('./AgentRegistry.js').then(module => {
                const AgentRegistry = module.default;
                const parentAgent = AgentRegistry.getAgent(this.currentParentAgentId);
                if (parentAgent) {
                    logger.info(`${this.name}: Reporting task ${taskId} completion back to parent ${this.currentParentAgentId}`);
                    parentAgent.receiveMessage({
                        from: this.id,
                        to: this.currentParentAgentId,
                        message: `Subtarefa concluída: ${taskId}`,
                        type: 'agent_task_complete',
                        data: {
                            taskId,
                            parentTaskId: this.currentParentTaskId,
                            result,
                            agentId: this.id,
                            agentName: this.name
                        },
                        timestamp: Date.now()
                    });
                }
            });
        }
        logger.info(`${this.name}: Task ${taskId} completed`);
    }

    async failTask(taskId, error) {
        await this.updateExternalStatus('idle');
        this.stats.tasksFailed++;

        try {
            await prisma.task.update({
                where: { id: taskId },
                data: {
                    status: 'failed',
                    error: error.message
                }
            });
        } catch (error) {
            logger.error(`Failed to update task ${taskId} in DB:`, error);
        }

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
