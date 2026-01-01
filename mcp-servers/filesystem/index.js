/**
 * Simple Filesystem MCP Server
 * 
 * Provides basic file operations:
 * - read_file
 * - write_file
 * - list_directory
 * - create_directory
 */

import { readFile, writeFile, readdir, mkdir } from 'fs/promises';
import { join } from 'path';

class FilesystemMCPServer {
    constructor() {
        this.tools = [
            {
                name: 'read_file',
                description: 'Read contents of a file',
                parameters: {
                    path: { type: 'string', description: 'File path' }
                }
            },
            {
                name: 'write_file',
                description: 'Write content to a file',
                parameters: {
                    path: { type: 'string', description: 'File path' },
                    content: { type: 'string', description: 'File content' }
                }
            },
            {
                name: 'list_directory',
                description: 'List files in a directory',
                parameters: {
                    path: { type: 'string', description: 'Directory path' }
                }
            },
            {
                name: 'create_directory',
                description: 'Create a new directory',
                parameters: {
                    path: { type: 'string', description: 'Directory path' }
                }
            }
        ];

        this.basePath = process.env.WORKSPACE_PATH || process.cwd();
    }

    async handleToolCall(toolName, args) {
        switch (toolName) {
            case 'read_file':
                return await this.readFile(args.path);
            case 'write_file':
                return await this.writeFile(args.path, args.content);
            case 'list_directory':
                return await this.listDirectory(args.path);
            case 'create_directory':
                return await this.createDirectory(args.path);
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }

    async readFile(path) {
        const fullPath = join(this.basePath, path);
        const content = await readFile(fullPath, 'utf-8');
        return { content, path: fullPath };
    }

    async writeFile(path, content) {
        const fullPath = join(this.basePath, path);
        const dir = join(fullPath, '..');
        await mkdir(dir, { recursive: true });
        await writeFile(fullPath, content, 'utf-8');
        return { success: true, path: fullPath };
    }

    async listDirectory(path) {
        const fullPath = join(this.basePath, path);
        const files = await readdir(fullPath, { withFileTypes: true });

        return {
            path: fullPath,
            files: files.map(f => ({
                name: f.name,
                isDirectory: f.isDirectory()
            }))
        };
    }

    async createDirectory(path) {
        const fullPath = join(this.basePath, path);
        await mkdir(fullPath, { recursive: true });
        return { success: true, path: fullPath };
    }
}

// MCP Protocol Handler
const server = new FilesystemMCPServer();

// Send tool list on startup
process.stdout.write(JSON.stringify({
    type: 'tool_list',
    tools: server.tools
}) + '\n');

// Handle incoming requests
let buffer = '';
process.stdin.on('data', async (chunk) => {
    buffer += chunk.toString();

    // Process line by line
    let lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line in buffer

    for (const line of lines) {
        if (!line.trim()) continue;

        let requestId = null;
        try {
            const request = JSON.parse(line);
            requestId = request.requestId;

            if (request.type === 'tool_call') {
                const result = await server.handleToolCall(request.tool, request.arguments);

                process.stdout.write(JSON.stringify({
                    type: 'tool_response',
                    requestId: request.requestId,
                    result
                }) + '\n');
            }
        } catch (error) {
            process.stdout.write(JSON.stringify({
                type: 'error',
                requestId: requestId, // Use extracted ID if available
                error: error.message
            }) + '\n');
        }
    }
});

console.error('Filesystem MCP Server started');
