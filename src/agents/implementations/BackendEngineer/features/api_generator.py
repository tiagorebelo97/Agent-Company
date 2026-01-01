import os

class APIGenerator:
    def __init__(self, agent):
        self.agent = agent

    def generate(self, description, path=None):
        """Generates an Express API route file using MCP"""
        
        file_path = path or f"src/routes/{self._sanitize_filename(description)}.js"
        code = self._get_template(description)
        
        try:
            self.agent.log(f"Writing API route to {file_path}")
            result = self.agent.call_mcp_tool('filesystem', 'write_file', {
                'path': file_path,
                'content': code
            })
            return {'status': 'success', 'file': file_path}
        except Exception as e:
            self.agent.log(f"Error writing file: {e}")
            return {'status': 'error', 'message': str(e)}

    def _sanitize_filename(self, description):
        words = description.replace('Create ', '').replace('Build ', '').split()
        clean_words = [w for w in words if w.isalnum()]
        return "_".join(w.lower() for w in clean_words) or "generated_api"

    def _get_template(self, description):
        name = self._sanitize_filename(description)
        return f"""import express from 'express';
const router = express.Router();

// Route: {name}
// Description: {description}

// GET /api/{name}
router.get('/', async (req, res) => {{
    try {{
        // TODO: Implement actual logic for {description}
        res.json({{
            success: true,
            data: {{
                message: "Endpoint '{name}' is working",
                timestamp: new Date().toISOString()
            }}
        }});
    }} catch (error) {{
        res.status(500).json({{ success: false, error: error.message }});
    }}
}});

// POST /api/{name}
router.post('/', async (req, res) => {{
    try {{
        const payload = req.body;
        // Process payload
        res.json({{
            success: true,
            message: "Resource created",
            data: payload
        }});
    }} catch (error) {{
        res.status(500).json({{ success: false, error: error.message }});
    }}
}});

export default router;
"""
