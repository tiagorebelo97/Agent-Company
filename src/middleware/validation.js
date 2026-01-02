/**
 * Request Validation Middleware
 * Validates common request parameters and body fields
 */

import logger from '../utils/logger.js';

/**
 * Validate task creation/update payload
 */
export const validateTaskPayload = (req, res, next) => {
    const { title, priority, status, tags, agentIds } = req.body;

    // Title validation (required for POST, optional for PATCH)
    if (req.method === 'POST' && (!title || typeof title !== 'string' || title.trim().length === 0)) {
        return res.status(400).json({
            success: false,
            error: 'Title is required and must be a non-empty string'
        });
    }

    // Priority validation
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({
            success: false,
            error: 'Priority must be one of: low, medium, high'
        });
    }

    // Status validation
    if (status && !['todo', 'in_progress', 'review', 'done', 'completed'].includes(status)) {
        return res.status(400).json({
            success: false,
            error: 'Status must be one of: todo, in_progress, review, done'
        });
    }

    // Tags validation
    if (tags && !Array.isArray(tags)) {
        return res.status(400).json({
            success: false,
            error: 'Tags must be an array'
        });
    }

    // Agent IDs validation
    if (agentIds && !Array.isArray(agentIds)) {
        return res.status(400).json({
            success: false,
            error: 'agentIds must be an array'
        });
    }

    next();
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (req, res, next) => {
    const { page, limit } = req.query;

    if (page) {
        const pageNum = parseInt(page);
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                success: false,
                error: 'Page must be a positive integer'
            });
        }
        req.query.page = pageNum;
    }

    if (limit) {
        const limitNum = parseInt(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({
                success: false,
                error: 'Limit must be between 1 and 100'
            });
        }
        req.query.limit = limitNum;
    }

    next();
};

/**
 * Validate UUID parameter
 */
export const validateUUID = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(id)) {
            return res.status(400).json({
                success: false,
                error: `Invalid ${paramName}: must be a valid UUID`
            });
        }

        next();
    };
};

/**
 * Sanitize string inputs to prevent XSS
 */
export const sanitizeStrings = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            // Remove potential XSS patterns
            return obj
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
        }
        if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                obj[key] = sanitize(obj[key]);
            }
        }
        return obj;
    };

    if (req.body) {
        req.body = sanitize(req.body);
    }

    next();
};

/**
 * Log all requests
 */
export const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

        logger[logLevel]({
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
    });

    next();
};

export default {
    validateTaskPayload,
    validatePagination,
    validateUUID,
    sanitizeStrings,
    requestLogger
};
