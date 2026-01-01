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

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
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
 * POST /api/tasks
 * Create a new task
 */
app.post('/api/tasks', async (req, res) => {
    try {
        const { type, description, requirements, targetAgent } = req.body;

        let agent;
        if (targetAgent) {
            agent = AgentRegistry.getAgent(targetAgent);
        } else {
            // Default to PM agent for high-level tasks
            agent = AgentRegistry.getAgent('pm');
        }

        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent not found' });
        }

        // Execute task asynchronously
        const taskPromise = agent.executeTask({
            type,
            description,
            requirements
        });

        // Don't wait for completion, return immediately
        res.json({
            success: true,
            message: 'Task submitted',
            agentId: agent.id
        });

        // Handle task completion in background
        taskPromise
            .then(result => {
                logger.info('Task completed:', result);
                io.emit('task:complete', { agentId: agent.id, result });
            })
            .catch(error => {
                logger.error('Task failed:', error);
                io.emit('task:fail', { agentId: agent.id, error: error.message });
            });

    } catch (error) {
        logger.error('Error creating task:', error);
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
        // Initialize agents
        await initializeAgents();

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
        await AgentRegistry.shutdownAll();
        await MCPManager.disconnectAll();

        httpServer.close(() => {
            logger.info('Server shut down successfully');
            process.exit(0);
        });
    } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
    }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server
startServer();

export { app, io };
