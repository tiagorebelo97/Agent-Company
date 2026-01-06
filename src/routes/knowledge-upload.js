/**
 * File Upload Endpoint for Agent Knowledge Learning
 * Add this to server.js in the Agent Knowledge Management API Routes section
 */

// Add multer import at the top of server.js:
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/agent-knowledge');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|txt|md|doc|docx|png|jpg|jpeg|gif|mp4|mov|avi/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Allowed: PDF, TXT, MD, DOC, DOCX, PNG, JPG, MP4, MOV'));
        }
    }
});

/**
 * POST /api/agents/:id/learn
 * Upload a file for the agent to learn from
 */
app.post('/api/agents/:id/learn', upload.single('file'), async (req, res) => {
    try {
        const { id: agentId } = req.params;
        const { title, description, skillTags } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        // Determine content type based on file extension
        const ext = path.extname(req.file.originalname).toLowerCase();
        let contentType = 'document';
        if (['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
            contentType = 'image';
        } else if (['.mp4', '.mov', '.avi'].includes(ext)) {
            contentType = 'video';
        }

        // Store knowledge reference in database
        const knowledge = await prisma.agentKnowledge.create({
            data: {
                agentId,
                title: title || req.file.originalname,
                description: description || '',
                type: contentType,
                content: req.file.path, // Store file path
                metadata: JSON.stringify({
                    originalName: req.file.originalname,
                    size: req.file.size,
                    mimeType: req.file.mimetype,
                    uploadedAt: new Date()
                }),
                skillTags: skillTags || '[]'
            }
        });

        logger.info(`Knowledge file uploaded for agent ${agentId}: ${req.file.originalname}`);

        // TODO: Trigger agent to analyze the file and extract skills
        // This would involve reading the file content and using AI to extract key concepts

        res.json({
            success: true,
            knowledge,
            message: 'File uploaded successfully. Agent will analyze and learn from it.'
        });
    } catch (error) {
        logger.error('Error uploading knowledge file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Export for use in server.js
module.exports = { upload };
