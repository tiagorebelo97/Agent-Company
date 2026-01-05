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
import ProcessManager from './services/ProcessManager.js';
import { validateTaskPayload, sanitizeStrings, requestLogger } from './middleware/validation.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5175'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5175'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(sanitizeStrings); // XSS protection
app.use(requestLogger); // Request logging

// Request logging (legacy - will be replaced by requestLogger middleware)
app.use((req, res, next) => {
    next(); // Skip this, using requestLogger instead
});

// ============================================
// Projects API Routes
// ============================================

/**
 * GET /api/projects
 * List all projects
 */
app.get('/api/projects', async (req, res) => {
    try {
        const { status, search } = req.query;
        const where = {};
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } }
            ];
        }

        const projects = await prisma.project.findMany({
            where,
            include: {
                _count: {
                    select: { tasks: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        logger.info(`Fetched ${projects.length} projects`);
        res.json({ success: true, projects });
    } catch (error) {
        logger.error('Error fetching projects:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/projects
 * Create a new project
 */
app.post('/api/projects', async (req, res) => {
    try {
        const { name, description, status, repoUrl, localPath, clientName, endDate } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Project name is required' });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                status: status || 'active',
                repoUrl,
                localPath,
                clientName,
                endDate: endDate ? new Date(endDate) : null
            }
        });

        io.emit('project:created', project);
        logger.info(`Project created: ${project.id} - ${project.name}`);

        // Automatically trigger analysis if repository info is provided
        if (repoUrl || localPath) {
            const pm = AgentRegistry.getAgent('pm');
            if (pm) {
                logger.info(`Auto-triggering analysis for new project: ${project.name}`);

                // Create analysis task
                const task = await prisma.task.create({
                    data: {
                        title: `Initial Analysis: ${project.name}`,
                        description: `Automatically analyzing the new project at ${localPath || repoUrl}. Identifiy tech stack and suggest agent swarm.`,
                        status: 'todo',
                        priority: 'high',
                        type: 'project_analysis',
                        project: { connect: { id: project.id } },
                        agents: {
                            create: [
                                { agent: { connect: { id: 'pm' } } }
                            ]
                        },
                        createdBy: 'system',
                        requirements: JSON.stringify({
                            project_id: project.id,
                            local_path: localPath,
                            repo_url: repoUrl
                        })
                    }
                });

                // Trigger execution
                const completeTask = await prisma.task.findUnique({
                    where: { id: task.id },
                    include: { agents: { include: { agent: true } }, subtasks: true, comments: true }
                });

                pm.executeTask(completeTask).catch(err => {
                    logger.error(`Failed to auto-trigger analysis for project ${project.id}:`, err);
                });
            }
        }

        res.json({ success: true, project });
    } catch (error) {
        logger.error('Error creating project:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/projects/:id
 * Get project details with its tasks
 */
app.get('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                tasks: {
                    include: {
                        agents: { include: { agent: true } },
                        subtasks: true
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        res.json({ success: true, project });
    } catch (error) {
        logger.error('Error fetching project:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PATCH /api/projects/:id
 * Update project details (status, analysis results, assigned agents, etc.)
 */
app.patch('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, analysisResults, suggestedAgents, assignedAgents, localPath, clientName, endDate } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (analysisResults) updateData.analysisResults = analysisResults;
        if (suggestedAgents) updateData.suggestedAgents = suggestedAgents;
        if (assignedAgents) updateData.assignedAgents = assignedAgents;
        if (localPath) updateData.localPath = localPath;
        if (clientName) updateData.clientName = clientName;
        if (endDate) updateData.endDate = new Date(endDate);

        const project = await prisma.project.update({
            where: { id },
            data: updateData
        });

        logger.info(`Project updated: ${project.id} - ${project.name}`);
        io.emit('project:updated', project);

        res.json({ success: true, project });
    } catch (error) {
        logger.error('Error updating project:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/projects/:id/files
 * Recursive directory listing for the project
 */
app.get('/api/projects/:id/files', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.json({ success: true, files: [] });
        }

        // Fix: Resolve path correctly based on project root
        // If it's relative, it should be relative to the server root (process.cwd())
        const absolutePath = path.isAbsolute(project.localPath)
            ? project.localPath
            : path.resolve(process.cwd(), project.localPath);

        const stats = await fs.promises.stat(absolutePath).catch(() => null);
        if (!stats || !stats.isDirectory()) {
            logger.warn(`Project path is invalid for project ${id}: ${absolutePath}`);
            return res.json({ success: true, files: [] });
        }

        const listFiles = async (dir, baseDir) => {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            const files = await Promise.all(entries.map(async (entry) => {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.relative(baseDir, fullPath);

                if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next' || entry.name === 'dist') {
                    return null;
                }

                if (entry.isDirectory()) {
                    return {
                        name: entry.name,
                        path: relativePath,
                        type: 'directory',
                        children: await listFiles(fullPath, baseDir)
                    };
                } else {
                    return {
                        name: entry.name,
                        path: relativePath,
                        type: 'file'
                    };
                }
            }));
            return files.filter(Boolean);
        };

        const fileTree = await listFiles(absolutePath, absolutePath);
        res.json({ success: true, files: fileTree });
    } catch (error) {
        logger.error('Error listing project files:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/projects/:id
 * Delete a project
 */
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Cascade delete is handled by Prisma relations (onDelete: Cascade)
        // for TaskAgent, Subtask, Comment.
        // We first need to delete Tasks associated with the project.
        await prisma.task.deleteMany({
            where: { projectId: id }
        });

        await prisma.project.delete({
            where: { id }
        });

        logger.info(`Project deleted: ${id}`);
        io.emit('project:deleted', id);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error deleting project:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/projects/:id/analyze
 * Request Project Manager to analyze the repository
 */
app.post('/api/projects/:id/analyze', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const pm = AgentRegistry.getAgent('pm');
        if (!pm) {
            return res.status(503).json({ success: false, error: 'Project Manager agent not available' });
        }

        // Create a task for the PM to analyze the project
        const task = await prisma.task.create({
            data: {
                title: `Analyze Project: ${project.name}`,
                description: `Perform a deep analysis of the project repository at ${project.localPath || project.repoUrl}. Identify tech stack, architectural patterns, and suggest suitable agents for the swarm.`,
                status: 'in_progress',
                priority: 'high',
                type: 'project_analysis',
                project: { connect: { id: id } },
                agents: {
                    create: [
                        { agent: { connect: { id: 'pm' } } }
                    ]
                },
                createdBy: 'system',
                requirements: JSON.stringify({
                    project_id: id,
                    local_path: project.localPath,
                    repo_url: project.repoUrl
                })
            }
        });

        // Trigger execution immediately
        const completeTask = await prisma.task.findUnique({
            where: { id: task.id },
            include: { agents: { include: { agent: true } }, subtasks: true, comments: true }
        });

        pm.executeTask(completeTask).catch(err => {
            logger.error(`Failed to trigger analysis for project ${id}:`, err);
        });

        // Broadcast to Activity Feed and UI
        io.emit('analysis:started', { projectId: id, taskId: task.id, projectName: project.name });
        io.emit('task:created', completeTask);
        io.emit('agent:status', { agentId: 'pm', status: 'busy', taskId: task.id });
        io.emit('agent:message', {
            from: 'Project Manager',
            to: 'System',
            message: `Starting comprehensive analysis for project "${project.name}"...`,
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'Project analysis initiated',
            taskId: task.id
        });
    } catch (error) {
        logger.error('Error initiating project analysis:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// Git Operations API
// ============================================

/**
 * GET /api/projects/:id/git/status
 * Get git status for project repository
 */
app.get('/api/projects/:id/git/status', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absolutePath = path.resolve(process.cwd(), project.localPath);
        const { simpleGit } = await import('simple-git');
        const git = simpleGit(absolutePath);

        const status = await git.status();
        res.json({ success: true, status });
    } catch (error) {
        logger.error('Error getting git status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/projects/:id/git/pull
 * Pull changes from remote repository
 */
app.post('/api/projects/:id/git/pull', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absolutePath = path.resolve(process.cwd(), project.localPath);
        const { simpleGit } = await import('simple-git');
        const git = simpleGit(absolutePath);

        const result = await git.pull();

        logger.info(`Git pull completed for project ${id}`);
        io.emit('git:operation', { projectId: id, operation: 'pull', success: true });

        res.json({ success: true, result });
    } catch (error) {
        logger.error('Error pulling git changes:', error);
        io.emit('git:operation', { projectId: req.params.id, operation: 'pull', success: false, error: error.message });
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/projects/:id/git/push
 * Push changes to remote repository
 */
app.post('/api/projects/:id/git/push', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absolutePath = path.resolve(process.cwd(), project.localPath);
        const { simpleGit } = await import('simple-git');
        const git = simpleGit(absolutePath);

        const result = await git.push();

        logger.info(`Git push completed for project ${id}`);
        io.emit('git:operation', { projectId: id, operation: 'push', success: true });

        res.json({ success: true, result });
    } catch (error) {
        logger.error('Error pushing git changes:', error);
        io.emit('git:operation', { projectId: req.params.id, operation: 'push', success: false, error: error.message });
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/projects/:id/git/commit
 * Commit changes
 */
app.post('/api/projects/:id/git/commit', async (req, res) => {
    try {
        const { id } = req.params;
        const { message, files } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        if (!message) {
            return res.status(400).json({ success: false, error: 'Commit message is required' });
        }

        const absolutePath = path.resolve(process.cwd(), project.localPath);
        const { simpleGit } = await import('simple-git');
        const git = simpleGit(absolutePath);

        // Add files if specified, otherwise add all
        if (files && files.length > 0) {
            await git.add(files);
        } else {
            await git.add('.');
        }

        const result = await git.commit(message);

        logger.info(`Git commit completed for project ${id}`);
        io.emit('git:operation', { projectId: id, operation: 'commit', success: true });

        res.json({ success: true, result });
    } catch (error) {
        logger.error('Error committing git changes:', error);
        io.emit('git:operation', { projectId: req.params.id, operation: 'commit', success: false, error: error.message });
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PATCH /api/projects/:id
 * Update project
 */
app.patch('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status, repoUrl, clientName, endDate } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (repoUrl !== undefined) updateData.repoUrl = repoUrl;
        if (clientName !== undefined) updateData.clientName = clientName;
        if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

        const project = await prisma.project.update({
            where: { id },
            data: updateData
        });

        io.emit('project:updated', project);
        res.json({ success: true, project });
    } catch (error) {
        logger.error('Error updating project:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/projects/:id
 * Delete project
 */
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.project.delete({ where: { id } });
        io.emit('project:deleted', { id });
        res.json({ success: true });
    } catch (error) {
        logger.error('Error deleting project:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// Recommendations API
// ============================================

/**
 * GET /api/projects/:id/recommendations
 * Get all recommendations for a project
 */
app.get('/api/projects/:id/recommendations', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.query;

        const where = { projectId: id };
        if (status) where.status = status;

        const recommendations = await prisma.recommendation.findMany({
            where,
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        res.json({ success: true, recommendations });
    } catch (error) {
        logger.error('Error fetching recommendations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/projects/:id/recommendations
 * Create a new recommendation
 */
app.post('/api/projects/:id/recommendations', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priority, category, createdBy } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }

        const recommendation = await prisma.recommendation.create({
            data: {
                projectId: id,
                title,
                description,
                priority: priority || 'medium',
                category,
                createdBy: createdBy || 'pm'
            }
        });

        logger.info(`Recommendation created: ${recommendation.id}`);
        io.emit('recommendation:created', recommendation);

        res.json({ success: true, recommendation });
    } catch (error) {
        logger.error('Error creating recommendation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PATCH /api/recommendations/:id
 * Update a recommendation (e.g., mark as implemented)
 */
app.patch('/api/recommendations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, taskId } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (taskId) updateData.taskId = taskId;
        if (status === 'implemented') updateData.implementedAt = new Date();

        const recommendation = await prisma.recommendation.update({
            where: { id },
            data: updateData
        });

        logger.info(`Recommendation updated: ${id}`);
        io.emit('recommendation:updated', recommendation);

        res.json({ success: true, recommendation });
    } catch (error) {
        logger.error('Error updating recommendation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/recommendations/:id/implement
 * Implement a recommendation by creating a task
 */
app.post('/api/recommendations/:id/implement', async (req, res) => {
    try {
        const { id } = req.params;
        const { agentIds } = req.body;

        const recommendation = await prisma.recommendation.findUnique({
            where: { id },
            include: { project: true }
        });

        if (!recommendation) {
            return res.status(404).json({ success: false, error: 'Recommendation not found' });
        }

        if (recommendation.status === 'implemented') {
            return res.status(400).json({ success: false, error: 'Recommendation already implemented' });
        }

        // Create a task for the recommendation
        const task = await prisma.task.create({
            data: {
                title: `Implement: ${recommendation.title}`,
                description: recommendation.description,
                priority: recommendation.priority,
                status: 'todo',
                type: 'recommendation_implementation',
                projectId: recommendation.projectId,
                requirements: JSON.stringify({
                    recommendationId: id,
                    category: recommendation.category
                })
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

        // Update recommendation status
        await prisma.recommendation.update({
            where: { id },
            data: {
                status: 'implemented',
                taskId: task.id,
                implementedAt: new Date()
            }
        });

        // Fetch complete task
        const completeTask = await prisma.task.findUnique({
            where: { id: task.id },
            include: {
                agents: { include: { agent: true } },
                subtasks: true,
                comments: true
            }
        });

        logger.info(`Recommendation ${id} implemented as task ${task.id}`);
        io.emit('recommendation:implemented', { recommendationId: id, taskId: task.id });
        io.emit('task:created', completeTask);

        res.json({ success: true, task: completeTask, recommendationId: id });
    } catch (error) {
        logger.error('Error implementing recommendation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// Meetings API
// ============================================

/**
 * GET /api/meetings
 * Get all meetings, optionally filtered by project
 */
app.get('/api/meetings', async (req, res) => {
    try {
        const { projectId, status } = req.query;

        const where = {};
        if (projectId) where.projectId = projectId;
        if (status) where.status = status;

        const meetings = await prisma.meeting.findMany({
            where,
            include: {
                participants: true,
                project: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, meetings });
    } catch (error) {
        logger.error('Error fetching meetings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/meetings/:id
 * Get a specific meeting with full transcript
 */
app.get('/api/meetings/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const meeting = await prisma.meeting.findUnique({
            where: { id },
            include: {
                participants: true,
                project: true
            }
        });

        if (!meeting) {
            return res.status(404).json({ success: false, error: 'Meeting not found' });
        }

        res.json({ success: true, meeting });
    } catch (error) {
        logger.error('Error fetching meeting:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/meetings
 * Create a new meeting
 */
app.post('/api/meetings', async (req, res) => {
    try {
        const { title, description, projectId, agentIds, createdBy } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }

        if (!agentIds || agentIds.length === 0) {
            return res.status(400).json({ success: false, error: 'At least one agent must be invited' });
        }

        const meeting = await prisma.meeting.create({
            data: {
                title,
                description,
                projectId,
                createdBy: createdBy || 'user'
            }
        });

        // Add participants
        await Promise.all(
            agentIds.map(agentId =>
                prisma.meetingParticipant.create({
                    data: {
                        meetingId: meeting.id,
                        agentId
                    }
                })
            )
        );

        // Fetch complete meeting
        const completeMeeting = await prisma.meeting.findUnique({
            where: { id: meeting.id },
            include: {
                participants: true,
                project: true
            }
        });

        logger.info(`Meeting created: ${meeting.id} with ${agentIds.length} participants`);
        io.emit('meeting:created', completeMeeting);

        res.json({ success: true, meeting: completeMeeting });
    } catch (error) {
        logger.error('Error creating meeting:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/meetings/:id/messages
 * Add a message to a meeting
 */
app.post('/api/meetings/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { fromId, content } = req.body;

        if (!content) {
            return res.status(400).json({ success: false, error: 'Message content is required' });
        }

        const meeting = await prisma.meeting.findUnique({
            where: { id },
            include: { participants: true, project: true }
        });

        if (!meeting) {
            return res.status(404).json({ success: false, error: 'Meeting not found' });
        }

        // Parse existing transcript
        let transcript = [];
        try {
            transcript = JSON.parse(meeting.transcript);
        } catch (e) {
            transcript = [];
        }

        // Add new message
        const message = {
            id: Date.now().toString(),
            fromId: fromId || 'user',
            content,
            timestamp: new Date().toISOString()
        };

        transcript.push(message);

        // Update meeting
        await prisma.meeting.update({
            where: { id },
            data: {
                transcript: JSON.stringify(transcript)
            }
        });

        logger.info(`Message added to meeting ${id}`);
        io.emit('meeting:message', { meetingId: id, message });

        // If message is from user, get responses from agents
        if (fromId === 'user' || !fromId) {
            const agentIds = meeting.participants.map(p => p.agentId);

            // Send message to agents in parallel (simplified - in reality would need context)
            const responses = await Promise.all(
                agentIds.map(async (agentId) => {
                    const agent = AgentRegistry.getAgent(agentId);
                    if (!agent) return null;

                    try {
                        // Include project context if available
                        const context = meeting.projectId ? {
                            projectId: meeting.projectId,
                            projectName: meeting.project?.name
                        } : {};

                        const agentResponse = await agent.handleChatMessage(content, transcript, null, meeting.projectId);

                        const responseMessage = {
                            id: Date.now().toString() + '-' + agentId,
                            fromId: agentId,
                            content: agentResponse.response || agentResponse.result || 'No response',
                            timestamp: new Date().toISOString()
                        };

                        transcript.push(responseMessage);
                        return responseMessage;
                    } catch (err) {
                        logger.error(`Error getting response from agent ${agentId}:`, err);
                        return null;
                    }
                })
            );

            // Update meeting with agent responses
            await prisma.meeting.update({
                where: { id },
                data: {
                    transcript: JSON.stringify(transcript)
                }
            });

            // Emit agent responses
            responses.filter(Boolean).forEach(response => {
                io.emit('meeting:message', { meetingId: id, message: response });
            });
        }

        res.json({ success: true, message });
    } catch (error) {
        logger.error('Error adding message to meeting:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PATCH /api/meetings/:id
 * Update meeting (e.g., mark as completed)
 */
app.patch('/api/meetings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updateData = {};
        if (status) {
            updateData.status = status;
            if (status === 'completed') {
                updateData.completedAt = new Date();
            }
        }

        const meeting = await prisma.meeting.update({
            where: { id },
            data: updateData,
            include: {
                participants: true,
                project: true
            }
        });

        logger.info(`Meeting updated: ${id}`);
        io.emit('meeting:updated', meeting);

        res.json({ success: true, meeting });
    } catch (error) {
        logger.error('Error updating meeting:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/meetings/:id/export
 * Export meeting transcript
 */
app.get('/api/meetings/:id/export', async (req, res) => {
    try {
        const { id } = req.params;
        const { format } = req.query; // 'json' or 'text'

        const meeting = await prisma.meeting.findUnique({
            where: { id },
            include: {
                participants: true,
                project: true
            }
        });

        if (!meeting) {
            return res.status(404).json({ success: false, error: 'Meeting not found' });
        }

        let transcript = [];
        try {
            transcript = JSON.parse(meeting.transcript);
        } catch (e) {
            transcript = [];
        }

        if (format === 'text') {
            // Format as plain text
            let text = `Meeting: ${meeting.title}\n`;
            text += `Date: ${meeting.createdAt.toISOString()}\n`;
            if (meeting.project) {
                text += `Project: ${meeting.project.name}\n`;
            }
            text += `\n${'='.repeat(60)}\n\n`;

            transcript.forEach(msg => {
                const agent = AgentRegistry.getAgent(msg.fromId);
                const name = msg.fromId === 'user' ? 'User' : agent?.name || msg.fromId;
                text += `[${new Date(msg.timestamp).toLocaleTimeString()}] ${name}:\n`;
                text += `${msg.content}\n\n`;
            });

            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="meeting-${id}.txt"`);
            res.send(text);
        } else {
            // Format as JSON
            const exportData = {
                meeting: {
                    id: meeting.id,
                    title: meeting.title,
                    description: meeting.description,
                    createdAt: meeting.createdAt,
                    completedAt: meeting.completedAt,
                    status: meeting.status,
                    project: meeting.project ? {
                        id: meeting.project.id,
                        name: meeting.project.name
                    } : null
                },
                participants: meeting.participants.map(p => {
                    const agent = AgentRegistry.getAgent(p.agentId);
                    return {
                        agentId: p.agentId,
                        name: agent?.name || p.agentId,
                        joinedAt: p.joinedAt
                    };
                }),
                transcript
            };

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="meeting-${id}.json"`);
            res.json(exportData);
        }
    } catch (error) {
        logger.error('Error exporting meeting:', error);
        res.status(500).json({ success: false, error: error.message });
    }
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
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
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
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
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
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
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
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
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

        // Fetch recent history for context (last 10 messages)
        const history = await prisma.message.findMany({
            where: {
                OR: [
                    { fromId: agent.id, toId: 'user' },
                    { fromId: 'user', toId: agent.id }
                ]
            },
            orderBy: { timestamp: 'asc' },
            take: 10
        });

        // Send message to agent
        const response = await agent.handleChatMessage(
            typeof message === 'object' ? message.message : message,
            history,
            req.body.taskId
        );

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
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /
 * Root route to guide users
 */
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>Agent-Company Backend</h1>
            <p>The API is running, but this is not the main interface.</p>
            <p>Please visit the <b>Dashboard</b> at:</p>
            <a href="http://localhost:5173" style="font-size: 20px; color: #007bff; text-decoration: none;">http://localhost:5173</a>
        </div>
    `);
});

/**
 * POST /api/agents/:id/chat
 * Send a message to an agent
 */
app.post('/api/agents/:id/chat', async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        const agent = AgentRegistry.getAgent(id);
        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent not found' });
        }

        // 1. Persist User Message to DB
        let userMessage;
        try {
            userMessage = await prisma.message.create({
                data: {
                    fromId: 'user', // We'll ensure 'user' agent exists
                    toId: id,
                    content: typeof message === 'object' ? JSON.stringify(message) : message.trim(),
                    type: 'chat'
                }
            });
        } catch (dbError) {
            logger.error('Failed to save user message to DB:', dbError);
            // Non-blocking for the chat itself
        }

        // Emit typing indicator
        io.emit('agent:typing', { agentId: id, isTyping: true });

        // Fetch recent history for context (last 10 messages)
        const history = await prisma.message.findMany({
            where: {
                OR: [
                    { fromId: id, toId: 'user' },
                    { fromId: 'user', toId: id }
                ]
            },
            orderBy: { timestamp: 'asc' },
            take: 10
        });

        // Process message with actual agent intelligence
        try {
            let response;
            try {
                // Pass history context to the agent
                const agentResponse = await agent.handleChatMessage(message.trim(), history, req.body.taskId);

                if (agentResponse && agentResponse.response) {
                    response = {
                        text: agentResponse.response,
                        interactive: agentResponse.interactive
                    };
                } else if (agentResponse && agentResponse.success) {
                    response = {
                        text: agentResponse.result || agentResponse.message || "I've processed your request.",
                        interactive: agentResponse.interactive
                    };
                } else {
                    throw new Error('No valid response from agent');
                }
            } catch (agentError) {
                logger.warn(`Agent ${id} chat failed, using basic fallback:`, agentError.message);
                response = `I'm ${agent.name}, but I'm having a technical issue. I heard: "${message.trim()}"`;
            }

            // 2. Persist Agent Response to DB
            const agentMessage = {
                id: `msg-${Date.now() + 1}`,
                agentId: id,
                sender: 'agent',
                message: response,
                timestamp: new Date().toISOString()
            };

            try {
                await prisma.message.create({
                    data: {
                        fromId: id,
                        toId: 'user',
                        content: typeof response === 'object' ? JSON.stringify(response) : response,
                        type: 'chat'
                    }
                });
            } catch (dbError) {
                logger.error('Failed to save agent response to DB:', dbError);
            }

            // Emit agent response via WebSocket
            setTimeout(() => {
                io.emit('agent:typing', { agentId: id, isTyping: false });
                io.emit('agent:message', agentMessage);
            }, 500 + Math.random() * 500);

            logger.info(`Agent ${id} responded to chat: ${typeof response === 'object' ? response.text.substring(0, 50) : response.substring(0, 50)}...`);
            res.json({ success: true, response });

        } catch (error) {
            io.emit('agent:typing', { agentId: id, isTyping: false });
            throw error;
        }

    } catch (error) {
        logger.error('Error in agent chat:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/agents/:id/chat/history
 * Get conversation history with an agent
 */
app.get('/api/agents/:id/chat/history', async (req, res) => {
    try {
        const { id } = req.params;

        const agent = AgentRegistry.getAgent(id);
        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent not found' });
        }

        // Fetch messages from DB
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { fromId: id, toId: 'user' },
                    { fromId: 'user', toId: id }
                ]
            },
            orderBy: { timestamp: 'asc' },
            take: 50
        });

        // Map to format expected by the frontend
        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            agentId: id,
            sender: msg.fromId === 'user' ? 'user' : 'agent',
            message: msg.content,
            timestamp: msg.timestamp
        }));

        res.json({
            success: true,
            messages: formattedMessages,
            agentId: id,
            agentName: agent.name
        });

    } catch (error) {
        logger.error('Error fetching chat history:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
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
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
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
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
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
/**
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
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
        const { status, priority, agentId, projectId, search } = req.query;

        const where = {};
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (projectId) where.projectId = projectId;

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
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/tasks
 * Create a new task
 */
app.post('/api/tasks', validateTaskPayload, async (req, res) => {
    try {
        const { title, description, priority, status, tags, dueDate, agentIds, createdBy, projectId } = req.body;

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
                createdBy,
                projectId
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
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
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
        const { title, description, priority, status, tags, dueDate, agentIds, projectId } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (priority !== undefined) updateData.priority = priority;
        if (status !== undefined) updateData.status = status;
        if (tags !== undefined) updateData.tags = JSON.stringify(tags);
        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
        if (projectId !== undefined) updateData.projectId = projectId;

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
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
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
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/tasks/:id/subtasks

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
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
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
            const { message, agentId, projectId } = data;
            const agent = AgentRegistry.getAgent(agentId || 'pm');

            if (agent) {
                // 1. Save user message to database
                const userMsg = await prisma.message.create({
                    data: {
                        fromId: 'user',
                        toId: agent.id,
                        content: message,
                        type: 'chat'
                    }
                });

                // 2. Load recent history for context
                const history = await prisma.message.findMany({
                    where: {
                        OR: [
                            { fromId: agent.id, toId: 'user' },
                            { fromId: 'user', toId: agent.id }
                        ]
                    },
                    orderBy: { timestamp: 'asc' },
                    take: 10
                });

                // 3. Get response from agent
                const agentResponse = await agent.handleChatMessage(
                    message,
                    history,
                    data.taskId,
                    projectId
                );

                const responseText = agentResponse.response || agentResponse.result || agentResponse.message;

                // 4. Save agent response to database
                const agentMsg = await prisma.message.create({
                    data: {
                        fromId: agent.id,
                        toId: 'user',
                        content: responseText,
                        type: 'chat'
                    }
                });

                // 5. Broadcast response
                socket.emit('chat:response', {
                    agent: {
                        id: agent.id,
                        name: agent.name,
                        emoji: agent.emoji
                    },
                    response: {
                        text: responseText,
                        interactive: agentResponse.interactive
                    }
                });

                // Also emit to agents:message for ActivityFeed
                io.emit('agent:message', {
                    from: agent.name,
                    to: 'User',
                    message: responseText,
                    timestamp: new Date()
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

AgentRegistry.on('agent:task:assigned', (data) => {
    io.emit('task:assigned', data);
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

AgentRegistry.on('agent:chat:message', async (data) => {
    // Proactive agent message (like final report)
    const agent = AgentRegistry.getAgent(data.agentId);
    if (!agent) return;

    const agentMessage = {
        id: Date.now(),
        fromId: data.agentId,
        toId: 'user',
        content: data.text,
        interactive: data.interactive,
        timestamp: new Date()
    };

    io.emit('agent:message', agentMessage);

    // Persist to DB
    try {
        await prisma.message.create({
            data: {
                fromId: data.agentId,
                toId: 'user',
                content: typeof agentMessage.content === 'object' ? JSON.stringify(agentMessage.content) : String(agentMessage.content),
                type: 'chat'
            }
        });
    } catch (e) {
        logger.error('Failed to persist proactive agent message:', e);
    }
});

// ============================================
// Initialize Agents

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

        // Ensure "user" agent exists for foreign key constraints
        await prisma.agent.upsert({
            where: { id: 'user' },
            update: {},
            create: {
                id: 'user',
                name: 'The User',
                role: 'Administrator',
                status: 'active',
                skills: '[]'
            }
        });
        logger.info('System "user" agent verified');

        // 2. Initialize Redis & Messenger
        await messenger.init();
        logger.info('Messenger & Redis active');

        // 3. Initialize agents
        await initializeAgents();

        // 4. Start TaskMonitor for autonomous task execution
        const TaskMonitor = (await import('./agents/utils/TaskMonitor.js')).default;
        const taskMonitor = new TaskMonitor(AgentRegistry, io);
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

        // 8. Validate port is free before starting
        logger.info(`Checking if port ${PORT} is available...`);
        const portInUse = await ProcessManager.isPortInUse(PORT);
        if (portInUse) {
            logger.error(`❌ Port ${PORT} is already in use!`);
            logger.error('Run: npm run stop-all to clean up processes');
            process.exit(1);
        }

        // Start HTTP server
        httpServer.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`📊 Dashboard: http://localhost:5173`);
            logger.info(`🔌 API: http://localhost:${PORT}/api`);
            logger.info(`💡 Tip: Use 'npm run stop-all' to cleanly stop all processes`);
        });

        // Register HTTP server for cleanup
        ProcessManager.register(httpServer, 'HTTP Server');

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
