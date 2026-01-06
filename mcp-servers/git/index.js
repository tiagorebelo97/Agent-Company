/**
 * Simple Git MCP Server
 * 
 * Provides basic git operations:
 * - git_status
 * - git_add
 * - git_commit
 * - git_push
 * - git_pull
 * - git_init
 */

import { simpleGit } from 'simple-git';
import { join } from 'path';

class GitMCPServer {
    constructor() {
        this.tools = [
            {
                name: 'git_status',
                description: 'Get git status',
                parameters: {
                    path: { type: 'string', description: 'Repository path' }
                }
            },
            {
                name: 'git_add',
                description: 'Add files to git',
                parameters: {
                    path: { type: 'string', description: 'Repository path' },
                    files: { type: 'array', items: { type: 'string' }, description: 'Files to add' }
                }
            },
            {
                name: 'git_commit',
                description: 'Commit changes',
                parameters: {
                    path: { type: 'string', description: 'Repository path' },
                    message: { type: 'string', description: 'Commit message' }
                }
            },
            {
                name: 'git_push',
                description: 'Push changes',
                parameters: {
                    path: { type: 'string', description: 'Repository path' }
                }
            },
            {
                name: 'git_pull',
                description: 'Pull changes',
                parameters: {
                    path: { type: 'string', description: 'Repository path' }
                }
            },
            {
                name: 'git_init',
                description: 'Initialize a new git repository',
                parameters: {
                    path: { type: 'string', description: 'Repository path' }
                }
            },
            {
                name: 'git_clone',
                description: 'Clone a repository',
                parameters: {
                    url: { type: 'string', description: 'Repository URL' },
                    path: { type: 'string', description: 'Target destination path' }
                }
            }
        ];

        this.basePath = process.env.WORKSPACE_PATH || process.cwd();
    }

    async handleToolCall(toolName, args) {
        const repoPath = join(this.basePath, args.path || '.');
        const git = simpleGit(repoPath);

        switch (toolName) {
            case 'git_status':
                return await git.status();
            case 'git_add':
                return await git.add(args.files);
            case 'git_commit':
                return await git.commit(args.message);
            case 'git_push':
                return await git.push();
            case 'git_pull':
                return await git.pull();
            case 'git_init':
                return await git.init();
            case 'git_clone':
                const targetPath = join(this.basePath, args.path);
                try {
                    const result = await simpleGit().clone(args.url, targetPath);
                    return { success: true, result };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }
}

// MCP Protocol Handler
const server = new GitMCPServer();

// Send tool list on startup
process.stdout.write(JSON.stringify({
    type: 'tool_list',
    tools: server.tools
}) + '\n');

// Handle incoming requests
process.stdin.on('data', async (data) => {
    try {
        const input = data.toString().split('\n').filter(line => line.trim());
        for (const line of input) {
            const request = JSON.parse(line);

            if (request.type === 'tool_call') {
                const result = await server.handleToolCall(request.tool, request.arguments);

                process.stdout.write(JSON.stringify({
                    type: 'tool_response',
                    requestId: request.requestId,
                    result
                }) + '\n');
            }
        }
    } catch (error) {
        process.stdout.write(JSON.stringify({
            type: 'error',
            error: error.message
        }) + '\n');
    }
});

console.error('Git MCP Server started');
