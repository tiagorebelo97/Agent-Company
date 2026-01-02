/**
 * AgentFileSystem - Safe file system access for agents
 * 
 * Provides controlled file access with:
 * - Path validation (only allowed directories)
 * - Automatic backups before modifications
 * - Change logging for audit trail
 * - Rollback capabilities
 */

import fs from 'fs/promises';
import path from 'path';
import logger from '../../utils/logger.js';

class AgentFileSystem {
    constructor() {
        // Directories where agents are allowed to write
        this.ALLOWED_PATHS = [
            'apps/dashboard/src/components',
            'apps/dashboard/src/pages',
            'apps/dashboard/src/utils',
            'src/agents/implementations',
            'tests',
            'docs'
        ];

        this.BACKUP_DIR = '.agent_backups';
        this.changeLog = [];
    }

    /**
     * Check if a path is within allowed directories
     */
    isPathAllowed(filePath) {
        const normalizedPath = path.normalize(filePath).replace(/\\/g, '/');

        return this.ALLOWED_PATHS.some(allowedPath => {
            const normalizedAllowed = path.normalize(allowedPath).replace(/\\/g, '/');
            return normalizedPath.startsWith(normalizedAllowed) ||
                normalizedPath.includes(`/${normalizedAllowed}/`);
        });
    }

    /**
     * Create a backup of a file before modification
     */
    async backupFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const timestamp = Date.now();
            const backupPath = path.join(
                this.BACKUP_DIR,
                `${path.basename(filePath)}.${timestamp}.bak`
            );

            // Ensure backup directory exists
            await fs.mkdir(this.BACKUP_DIR, { recursive: true });
            await fs.writeFile(backupPath, content);

            logger.info(`Backup created: ${backupPath}`);
            return backupPath;
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist yet, no backup needed
                return null;
            }
            throw error;
        }
    }

    /**
     * Read a file (with logging)
     */
    async readFile(agentId, filePath) {
        if (!this.isPathAllowed(filePath)) {
            throw new Error(`Access denied: ${filePath} is not in allowed paths`);
        }

        try {
            const content = await fs.readFile(filePath, 'utf-8');
            this.logChange(agentId, filePath, 'read', null);
            return content;
        } catch (error) {
            logger.error(`Agent ${agentId} failed to read ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * Write a file (with backup and logging)
     */
    async writeFile(agentId, filePath, content) {
        if (!this.isPathAllowed(filePath)) {
            throw new Error(`Access denied: ${filePath} is not in allowed paths`);
        }

        try {
            // Create backup if file exists
            const backupPath = await this.backupFile(filePath);

            // Ensure directory exists
            await fs.mkdir(path.dirname(filePath), { recursive: true });

            // Write file
            await fs.writeFile(filePath, content, 'utf-8');

            this.logChange(agentId, filePath, 'write', backupPath);
            logger.info(`Agent ${agentId} wrote to ${filePath}`);

            return { success: true, path: filePath, backup: backupPath };
        } catch (error) {
            logger.error(`Agent ${agentId} failed to write ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * Append to a file
     */
    async appendFile(agentId, filePath, content) {
        if (!this.isPathAllowed(filePath)) {
            throw new Error(`Access denied: ${filePath} is not in allowed paths`);
        }

        try {
            const backupPath = await this.backupFile(filePath);
            await fs.appendFile(filePath, content, 'utf-8');

            this.logChange(agentId, filePath, 'append', backupPath);
            logger.info(`Agent ${agentId} appended to ${filePath}`);

            return { success: true, path: filePath, backup: backupPath };
        } catch (error) {
            logger.error(`Agent ${agentId} failed to append to ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * Delete a file
     */
    async deleteFile(agentId, filePath) {
        if (!this.isPathAllowed(filePath)) {
            throw new Error(`Access denied: ${filePath} is not in allowed paths`);
        }

        try {
            const backupPath = await this.backupFile(filePath);
            await fs.unlink(filePath);

            this.logChange(agentId, filePath, 'delete', backupPath);
            logger.info(`Agent ${agentId} deleted ${filePath}`);

            return { success: true, path: filePath, backup: backupPath };
        } catch (error) {
            logger.error(`Agent ${agentId} failed to delete ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * List files in a directory
     */
    async listFiles(agentId, dirPath) {
        if (!this.isPathAllowed(dirPath)) {
            throw new Error(`Access denied: ${dirPath} is not in allowed paths`);
        }

        try {
            const files = await fs.readdir(dirPath, { withFileTypes: true });
            this.logChange(agentId, dirPath, 'list', null);

            return files.map(file => ({
                name: file.name,
                isDirectory: file.isDirectory(),
                isFile: file.isFile()
            }));
        } catch (error) {
            logger.error(`Agent ${agentId} failed to list ${dirPath}:`, error);
            throw error;
        }
    }

    /**
     * Rollback a file to a backup
     */
    async rollback(backupPath, originalPath) {
        try {
            const content = await fs.readFile(backupPath, 'utf-8');
            await fs.writeFile(originalPath, content, 'utf-8');
            logger.info(`Rolled back ${originalPath} from ${backupPath}`);
            return { success: true };
        } catch (error) {
            logger.error(`Rollback failed for ${originalPath}:`, error);
            throw error;
        }
    }

    /**
     * Log file system changes
     */
    logChange(agentId, filePath, operation, backupPath) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            agentId,
            filePath,
            operation,
            backupPath
        };

        this.changeLog.push(logEntry);

        // Keep only last 1000 entries
        if (this.changeLog.length > 1000) {
            this.changeLog.shift();
        }
    }

    /**
     * Get change history for a file or agent
     */
    getChangeHistory(filter = {}) {
        let filtered = this.changeLog;

        if (filter.agentId) {
            filtered = filtered.filter(log => log.agentId === filter.agentId);
        }

        if (filter.filePath) {
            filtered = filtered.filter(log => log.filePath === filter.filePath);
        }

        if (filter.operation) {
            filtered = filtered.filter(log => log.operation === filter.operation);
        }

        return filtered;
    }
}

// Singleton instance
const agentFileSystem = new AgentFileSystem();

export default agentFileSystem;
