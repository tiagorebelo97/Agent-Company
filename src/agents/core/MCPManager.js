/**
 * MCPManager - Manages MCP server connections
 * 
 * Handles:
 * - MCP server spawning
 * - Tool/resource discovery
 * - Request routing
 * - Connection pooling
 */

import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import logger from '../../utils/logger.js';

class MCPConnection extends EventEmitter {
    constructor(name, process) {
        super();
        this.name = name;
        this.process = process;
        this.tools = new Map();
        this.resources = new Map();
        this.ready = false;
        this.requestId = 0;
        this.pendingRequests = new Map();

        this.setupProcessHandlers();
    }

    setupProcessHandlers() {
        this.process.stdout.on('data', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleMessage(message);
            } catch (error) {
                logger.error(`${this.name}: Failed to parse message:`, error);
            }
        });

        this.process.stderr.on('data', (data) => {
            logger.error(`${this.name} stderr:`, data.toString());
        });

        this.process.on('exit', (code) => {
            logger.warn(`${this.name}: Process exited with code ${code}`);
            this.emit('exit', code);
        });
    }

    handleMessage(message) {
        if (message.type === 'tool_list') {
            // Store available tools
            for (const tool of message.tools || []) {
                this.tools.set(tool.name, tool);
            }
            this.ready = true;
            this.emit('ready');
            logger.info(`${this.name}: Ready with ${this.tools.size} tools`);
        } else if (message.type === 'tool_response') {
            // Handle tool response
            const pending = this.pendingRequests.get(message.requestId);
            if (pending) {
                pending.resolve(message.result);
                this.pendingRequests.delete(message.requestId);
            }
        } else if (message.type === 'error') {
            // Handle error
            const pending = this.pendingRequests.get(message.requestId);
            if (pending) {
                pending.reject(new Error(message.error));
                this.pendingRequests.delete(message.requestId);
            }
        }
    }

    async callTool(toolName, args = {}) {
        if (!this.ready) {
            throw new Error(`${this.name}: Not ready`);
        }

        if (!this.tools.has(toolName)) {
            throw new Error(`${this.name}: Tool '${toolName}' not found`);
        }

        const requestId = ++this.requestId;

        const request = {
            type: 'tool_call',
            requestId,
            tool: toolName,
            arguments: args
        };

        return new Promise((resolve, reject) => {
            this.pendingRequests.set(requestId, { resolve, reject });

            // Send request to MCP server
            this.process.stdin.write(JSON.stringify(request) + '\n');

            // Timeout after 30 seconds
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    reject(new Error(`${this.name}: Tool call timeout`));
                }
            }, 30000);
        });
    }

    async disconnect() {
        this.process.kill();
    }
}

class MCPManager {
    constructor() {
        if (MCPManager.instance) {
            return MCPManager.instance;
        }

        this.connections = new Map();
        this.serverPaths = {
            filesystem: process.env.MCP_FILESYSTEM_PATH || './mcp-servers/filesystem',
            git: process.env.MCP_GIT_PATH || './mcp-servers/git',
            browser: process.env.MCP_BROWSER_PATH || './mcp-servers/browser'
        };

        MCPManager.instance = this;
        logger.info('MCPManager initialized');
    }

    async connect(mcpName, agentId) {
        const connectionKey = `${mcpName}:${agentId}`;

        // Return existing connection if available
        if (this.connections.has(connectionKey)) {
            return this.connections.get(connectionKey);
        }

        const serverPath = this.serverPaths[mcpName];
        if (!serverPath) {
            throw new Error(`Unknown MCP server: ${mcpName}`);
        }

        logger.info(`Spawning MCP server: ${mcpName} for agent ${agentId}`);

        // Spawn MCP server process
        const mcpProcess = spawn('node', [serverPath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        const connection = new MCPConnection(mcpName, mcpProcess);

        // Wait for connection to be ready
        await new Promise((resolve, reject) => {
            connection.once('ready', resolve);
            connection.once('exit', () => reject(new Error(`${mcpName}: Failed to start`)));

            setTimeout(() => reject(new Error(`${mcpName}: Startup timeout`)), 10000);
        });

        this.connections.set(connectionKey, connection);
        logger.info(`MCP ${mcpName} connected for agent ${agentId}`);

        return connection;
    }

    async disconnect(mcpName, agentId) {
        const connectionKey = `${mcpName}:${agentId}`;
        const connection = this.connections.get(connectionKey);

        if (connection) {
            await connection.disconnect();
            this.connections.delete(connectionKey);
            logger.info(`MCP ${mcpName} disconnected for agent ${agentId}`);
        }
    }

    async disconnectAll() {
        const promises = [];

        for (const [key, connection] of this.connections) {
            promises.push(connection.disconnect());
        }

        await Promise.allSettled(promises);
        this.connections.clear();
        logger.info('All MCP connections closed');
    }
}

export default new MCPManager();
