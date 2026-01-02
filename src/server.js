/**
 * Main Express Server
 * 
 * Provides:
 * - REST API for agents and tasks
 * - WebSocket server for real-time updates
 * - Agent initialization
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import logger from './utils/logger.js';
import AgentRegistry from './agents/core/AgentRegistry.js';
import MCPManager from './agents/core/MCPManager.js';
import BaseAgent from './agents/core/BaseAgent.js';

// Database & Messaging
import prisma from './database/client.js';
import redis from './services/redis.js';
import messenger from './services/Messenger.js';
import TaskMonitor from './agents/utils/TaskMonitor.js';
import TaskHealthMonitor from './services/TaskHealthMonitor.js';
import AgentHealthMonitor from './services/AgentHealthMonitor.js';
import { validateTaskPayload, sanitizeStrings, requestLogger } from './middleware/validation.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5175'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(sanitizeStrings); // XSS protection
app.use(requestLogger); // Request logging

// Request logging (legacy - will be replaced by requestLogger middleware)
app.use((req, res, next) => {
    next(); // Skip this, using requestLogger instead
});

// ============================================
// REST API Routes
// ============================================

/**
 * GET /api/agents
 * Get all agents with their current status
 */
app.get('/api/agents', (req, res) => {
    try {
        const agents = AgentRegistry.getAllAgents();
        const agentData = agents.map(agent => agent.getStatus());

        res.json({
            success: true,
            count: agentData.length,
            agents: agentData
        });
    } catch (error) {
        logger.error('Error fetching agents:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/agents/:id
 * Get specific agent details
 */
app.get('/api/agents/:id', (req, res) => {
    try {
        const agent = AgentRegistry.getAgent(req.params.id);

        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent not found' });
        }

        res.json({
            success: true,
            agent: agent.getStatus()
        });
    } catch (error) {
        logger.error('Error fetching agent:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/stats
 * Get system statistics
 */
app.get('/api/stats', (req, res) => {
    try {
        const stats = AgentRegistry.getStats();

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        logger.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/messages
 * Get inter-agent message history
 */
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            orderBy: { timestamp: 'desc' },
            take: 50,
            include: {
                fromAgent: true,
                toAgent: true
            }
        });

        res.json({
            success: true,
            count: messages.length,
            messages
        });
    } catch (error) {
        logger.error('Error fetching messages:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});



/**
 * POST /api/chat
 * Send message to agent (Smart Chat)
 */
app.post('/api/chat', async (req, res) => {
    try {
        const { message, agentId } = req.body;

        const agent = AgentRegistry.getAgent(agentId || 'pm');

        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent not found' });
        }

        // Send message to agent
        const response = await agent.receiveMessage({
            from: 'user',
            to: agent.id,
            message,
            timestamp: Date.now()
        });

        res.json({
            success: true,
            agent: {
                id: agent.id,
                name: agent.name,
                emoji: agent.emoji
            },
            response
        });

    } catch (error) {
        logger.error('Error in chat:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', async (req, res) => {
    try {
        const health = await AgentRegistry.healthCheck();

        res.json({
            success: true,
            status: 'healthy',
            agents: health
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/agents/health-report
 * Get detailed health report for all agents
 */
app.get('/api/agents/health-report', (req, res) => {
    try {
        if (!global.agentHealthMonitor) {
            return res.status(503).json({
                success: false,
                error: 'AgentHealthMonitor not initialized'
            });
        }

        const report = global.agentHealthMonitor.getHealthReport();

        res.json({
            success: true,
            report,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error getting health report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/agents/:id/restart
 * Manually restart an agent
 */
app.post('/api/agents/:id/restart', async (req, res) => {
    try {
        const agent = AgentRegistry.getAgent(req.params.id);

        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent not found' });
        }

        if (!global.agentHealthMonitor) {
            return res.status(503).json({
                success: false,
                error: 'AgentHealthMonitor not initialized'
            });
        }

        const success = await global.agentHealthMonitor.restartAgent(agent);

        res.json({
            success,
            message: success ? 'Agent restarted successfully' : 'Failed to restart agent',
            agentId: agent.id,
            agentName: agent.name
        });
    } catch (error) {
        logger.error('Error restarting agent:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// Task Management API
// ============================================

/**
 * GET /api/tasks
 * List all tasks with optional filters
 */
app.get('/api/tasks', async (req, res) => {
    try {
        const { status, priority, agentId, search } = req.query;

        const where = {};
        if (status) where.status = status;
        if (priority) where.priority = priority;

        const tasks = await prisma.task.findMany({
            where,
            include: {
                agents: {
                    include: {
                        agent: true
                    }
                },
                subtasks: true,
                comments: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Filter by agent if specified
        let filteredTasks = tasks;
        if (agentId) {
            filteredTasks = tasks.filter(task =>
                task.agents.some(ta => ta.agentId === agentId)
            );
        }

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filteredTasks = filteredTasks.filter(task =>
                task.title.toLowerCase().includes(searchLower) ||
                (task.description && task.description.toLowerCase().includes(searchLower))
            );
        }

        // Normalize status for frontend (completed -> done)
        const normalizedTasks = filteredTasks.map(task => ({
            ...task,
            status: task.status === 'completed' ? 'done' : task.status
        }));

        res.json({ success: true, tasks: normalizedTasks });
    } catch (error) {
        logger.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/tasks
 * Create a new task
 */
app.post('/api/tasks', validateTaskPayload, async (req, res) => {
    try {
        const { title, description, priority, status, tags, dueDate, agentIds, createdBy } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }

        const task = await prisma.task.create({
            data: {
                title,
                description,
                priority: priority || 'medium',
                status: status || 'todo',
                tags: JSON.stringify(tags || []),
                dueDate: dueDate ? new Date(dueDate) : null,
                createdBy
            }
        });

        // Assign agents if provided
        if (agentIds && agentIds.length > 0) {
            await Promise.all(
                agentIds.map(agentId =>
                    prisma.taskAgent.create({
                        data: {
                            taskId: task.id,
                            agentId
                        }
                    })
                )
            );
        }

        // Fetch complete task with relations
        const completeTask = await prisma.task.findUnique({
            where: { id: task.id },
            include: {
                agents: {
                    include: { agent: true }
                },
                subtasks: true,
                comments: true
            }
        });

        // Normalize status for frontend
        const normalizedTask = {
            ...completeTask,
            status: completeTask.status === 'completed' ? 'done' : completeTask.status
        };

        // Emit WebSocket event with normalized status
        io.emit('task:created', normalizedTask);

        // Execute task if agents are assigned and status is active
        if ((!status || status === 'in_progress' || status === 'todo') && agentIds && agentIds.length > 0) {
            // Pick the first agent to execute (for now)
            // In a swarm, the PM might coordinate, but direct assignment implies execution responsibility
            const primaryAgentId = agentIds[0];
            const agent = AgentRegistry.getAgent(primaryAgentId);

            if (agent) {
                logger.info(`Auto-executing task ${task.id} on agent ${primaryAgentId}`);

                // We don't await this to keep the API responsive
                agent.executeTask(completeTask).catch(err => {
                    logger.error(`Failed to auto-execute task ${task.id}:`, err);
                });
            }
        }

        logger.info(`Task created: ${task.id} - ${task.title}`);
        res.json({ success: true, task: normalizedTask });
    } catch (error) {
        logger.error('Error creating task:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PATCH /api/tasks/:id
 * Update a task
 */
app.patch('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priority, status, tags, dueDate, agentIds } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (priority !== undefined) updateData.priority = priority;
        if (status !== undefined) updateData.status = status;
        if (tags !== undefined) updateData.tags = JSON.stringify(tags);
        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

        const task = await prisma.task.update({
            where: { id },
            data: updateData
        });

        // Update agent assignments if provided
        if (agentIds !== undefined) {
            // Remove existing assignments
            await prisma.taskAgent.deleteMany({
                where: { taskId: id }
            });

            // Add new assignments
            if (agentIds.length > 0) {
                await Promise.all(
                    agentIds.map(agentId =>
                        prisma.taskAgent.create({
                            data: {
                                taskId: id,
                                agentId
                            }
                        })
                    )
                );
            }
        }

        // Fetch complete task
        const completeTask = await prisma.task.findUnique({
            where: { id },
            include: {
                agents: {
                    include: { agent: true }
                },
                subtasks: true,
                comments: true
            }
        });

        // Emit WebSocket events
        io.emit('task:updated', completeTask);
        if (status !== undefined) {
            io.emit('task:status_changed', { taskId: id, status });
        }

        // Auto-execute task if status changed to in_progress and agents are assigned
        if (status === 'in_progress' && completeTask.agents && completeTask.agents.length > 0) {
            const primaryAgentId = completeTask.agents[0].agentId;
            const agent = AgentRegistry.getAgent(primaryAgentId);

            if (agent && agent.status === 'idle') {
                logger.info(`Auto-executing task ${id} on agent ${primaryAgentId} (status changed to in_progress)`);

                // Execute task asynchronously
                agent.executeTask(completeTask).catch(err => {
                    logger.error(`Failed to auto-execute task ${id}:`, err);
                });
            } else if (!agent) {
                logger.warn(`Agent ${primaryAgentId} not found for task ${id}`);
            } else {
                logger.info(`Agent ${primaryAgentId} is ${agent.status}, cannot execute task ${id}`);
            }
        }

        logger.info(`Task updated: ${id}`);
        res.json({ success: true, task: completeTask });
    } catch (error) {
        logger.error('Error updating task:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.task.delete({
            where: { id }
        });

        // Emit WebSocket event
        io.emit('task:deleted', { taskId: id });

        logger.info(`Task deleted: ${id}`);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error deleting task:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/tasks/:id/subtasks
 * Add a subtask
 */
app.post('/api/tasks/:id/subtasks', async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        const subtask = await prisma.subtask.create({
            data: {
                taskId: id,
                title
            }
        });

        io.emit('task:updated', { taskId: id });

        res.json({ success: true, subtask });
    } catch (error) {
        logger.error('Error creating subtask:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PATCH /api/tasks/:taskId/subtasks/:subtaskId
 * Update subtask (toggle completion)
 */
app.patch('/api/tasks/:taskId/subtasks/:subtaskId', async (req, res) => {
    try {
        const { subtaskId } = req.params;
        const { completed } = req.body;

        const subtask = await prisma.subtask.update({
            where: { id: subtaskId },
            data: { completed }
        });

        io.emit('task:updated', { taskId: req.params.taskId });

        res.json({ success: true, subtask });
    } catch (error) {
        logger.error('Error updating subtask:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/tasks/:id/comments
 * Add a comment
 */
app.post('/api/tasks/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { content, authorId, authorName } = req.body;

        const comment = await prisma.comment.create({
            data: {
                taskId: id,
                content,
                authorId,
                authorName
            }
        });

        io.emit('task:updated', { taskId: id });

        res.json({ success: true, comment });
    } catch (error) {
        logger.error('Error creating comment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// WebSocket Events
// ============================================

io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Send current agent status on connection
    const agents = AgentRegistry.getAllAgents();
    socket.emit('agents:initial', agents.map(a => a.getStatus()));

    // Handle chat messages
    socket.on('chat:message', async (data) => {
        try {
            const { message, agentId } = data;
            const agent = AgentRegistry.getAgent(agentId || 'pm');

            if (agent) {
                const response = await agent.receiveMessage({
                    from: 'user',
                    to: agent.id,
                    message,
                    timestamp: Date.now()
                });

                socket.emit('chat:response', {
                    agent: {
                        id: agent.id,
                        name: agent.name,
                        emoji: agent.emoji
                    },
                    response
                });
            }
        } catch (error) {
            logger.error('Chat error:', error);
            socket.emit('chat:error', { error: error.message });
        }
    });

    // Handle agent status changes (for ActivityFeed)
    socket.on('agent:status', (data) => {
        logger.info(`Agent status change: ${data.agentId} -> ${data.status}`);
        // Broadcast to all clients
        io.emit('agent:status', data);
    });

    // Handle agent messages (for ActivityFeed)
    socket.on('agent:message', (data) => {
        logger.info(`Agent message: ${data.from} -> ${data.to}`);
        // Broadcast to all clients
        io.emit('agent:message', data);
    });

    // Handle task assignments (for ActivityFeed)
    socket.on('task:assigned', (data) => {
        logger.info(`Task assigned: ${data.taskName} to ${data.agentId}`);
        // Broadcast to all clients
        io.emit('task:assigned', data);
    });

    // Handle system notifications (for ActivityFeed)
    socket.on('system:notification', (data) => {
        logger.info(`System notification: ${data.message}`);
        // Broadcast to all clients
        io.emit('system:notification', data);
    });

    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

// ============================================
// Agent Event Broadcasting
// ============================================

// Broadcast agent events to all connected clients
AgentRegistry.on('agent:registered', (agentStatus) => {
    io.emit('agent:registered', agentStatus);
});

AgentRegistry.on('agent:task:start', (data) => {
    io.emit('agent:task:start', data);
});

AgentRegistry.on('agent:task:complete', (data) => {
    io.emit('agent:task:complete', data);
});

AgentRegistry.on('agent:task:fail', (data) => {
    io.emit('agent:task:fail', data);
});

// ============================================
// Initialize Agents
// ============================================

function toPascalCase(str) {
    if (!str) return '';
    return str.replace(/[^a-zA-Z0-9 ]/g, "").split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

async function initializeAgents() {
    logger.info('Initializing Agent Swarm...');

    // Load config
    const configPath = path.join(process.cwd(), 'config', 'agents.json');
    if (!fs.existsSync(configPath)) {
        logger.error('Config file not found: ' + configPath);
        return;
    }

    const agentsConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    logger.info(`Found ${agentsConfig.length} agents in config.`);

    // Create agents dynamically
    for (const config of agentsConfig) {
        try {
            logger.info(`Registering ${config.name}...`);

            // Determine Python path
            // 1. Explicit path in config
            // 2. Standard path based on PascalCase name
            let pythonPath;
            if (config.customPath) {
                pythonPath = path.join(process.cwd(), config.customPath);
            } else {
                const folderName = toPascalCase(config.name);
                pythonPath = path.join(process.cwd(), 'src', 'agents', 'implementations', folderName, 'main.py');
            }

            const agent = new BaseAgent(config.id, config.name, {
                ...config,
                pythonPath
            });

            await agent.connectMCPs(MCPManager);
            AgentRegistry.register(agent);

        } catch (error) {
            logger.error(`Failed to initialize agent ${config.name}: ${error.message}`);
            // Continue initializing other agents
        }
    }

    logger.info(`Swarm initialized: ${AgentRegistry.getAllAgents().length} agents online.`);
}

// ============================================
// Server Startup
// ============================================

async function startServer() {
    try {
        logger.info('Starting Agent-Company Foundation services...');

        // 1. Initialize Database
        await prisma.$connect();
        logger.info('Database connected');

        // 2. Initialize Redis & Messenger
        await messenger.init();
        logger.info('Messenger & Redis active');

        // 3. Initialize agents
        await initializeAgents();

        // 4. Start TaskMonitor for autonomous task execution
        const TaskMonitor = (await import('./agents/utils/TaskMonitor.js')).default;
        const taskMonitor = new TaskMonitor(AgentRegistry);
        taskMonitor.start();
        logger.info('TaskMonitor started - agents will autonomously pick up tasks');

        // 5. Start TaskHealthMonitor for automatic task recovery
        TaskHealthMonitor.start();
        logger.info('TaskHealthMonitor started - monitoring for stuck tasks');

        // 6. Start AgentHealthMonitor for agent health and auto-restart
        global.agentHealthMonitor = new AgentHealthMonitor(io);
        global.agentHealthMonitor.start();
        logger.info('AgentHealthMonitor started - monitoring agent health');

        // 7. Setup Hot-Reload for agents.json
        setupAgentWatcher();

        // Start HTTP server
        httpServer.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`📊 Dashboard: http://localhost:5173`);
            logger.info(`🔌 API: http://localhost:${PORT}/api`);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// ============================================
// Graceful Shutdown
// ============================================


async function shutdown() {
    logger.info('Shutting down server...');

    try {
        // 1. Reset all in-progress tasks
        logger.info('Resetting in-progress tasks...');
        await TaskHealthMonitor.resetAllInProgressTasks();

        // 2. Stop monitors
        TaskHealthMonitor.stop();
        if (global.agentHealthMonitor) {
            global.agentHealthMonitor.stop();
        }

        // 3. Shutdown agents
        await AgentRegistry.shutdownAll();
        await MCPManager.disconnectAll();

        // 4. Disconnect services
        await TaskHealthMonitor.disconnect();
        await prisma.$disconnect();

        // 5. Close HTTP server
        httpServer.close(() => {
            logger.info('Server shut down successfully');
            process.exit(0);
        });

        // Force exit after 5 seconds if graceful shutdown fails
        setTimeout(() => {
            logger.warn('Forcing shutdown after timeout');
            process.exit(1);
        }, 5000);

    } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
    }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    logger.error('Uncaught Exception:', error);
    try {
        await TaskHealthMonitor.resetAllInProgressTasks();
        await TaskHealthMonitor.disconnect();
    } catch (e) {
        logger.error('Error during emergency cleanup:', e);
    }
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    try {
        await TaskHealthMonitor.resetAllInProgressTasks();
        await TaskHealthMonitor.disconnect();
    } catch (e) {
        logger.error('Error during emergency cleanup:', e);
    }
    process.exit(1);
});

// Start the server
startServer();

export { app, io };
/**
 * Watch for changes in agents.json and reload new agents
 */
function setupAgentWatcher() {
    const configPath = path.join(process.cwd(), 'config', 'agents.json');
    let isReloading = false;

    fs.watch(configPath, async (eventType) => {
        if (eventType === 'change' && !isReloading) {
            isReloading = true;
            logger.info('Detected change in agents.json, checking for new agents...');

            // Wait a bit for file to be fully written
            setTimeout(async () => {
                try {
                    await initializeAgents();
                } catch (error) {
                    logger.error('Failed to hot-reload agents:', error);
                } finally {
                    isReloading = false;
                }
            }, 1000);
        }
    });
}
