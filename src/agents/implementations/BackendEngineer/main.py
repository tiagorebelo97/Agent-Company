"""
Backend Engineer Agent - Creates and modifies backend code

Capabilities:
- Generate Express.js API endpoints
- Create Prisma database services
- Build middleware and utilities
- Follow REST API best practices
"""

import sys
import json
from pathlib import Path

# Add parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent.parent))

from agents.base.PythonAgentBase import PythonAgentBase
from agents.utils.CodeGenerator import CodeGenerator

class BackendEngineer(PythonAgentBase):
    """Backend Engineer Agent - Creates backend services and APIs"""
    
    def __init__(self):
        super().__init__('backend', 'Backend Engineer')
        try:
            self.code_generator = CodeGenerator()
            self.log("CodeGenerator initialized successfully")
        except Exception as e:
            self.log(f"Warning: CodeGenerator initialization failed: {str(e)}")
            self.code_generator = None
    
    def execute_task(self, task: dict) -> dict:
        """Execute a backend task"""
        
        self.update_status('thinking')
        self.log(f"Received task: {task.get('description', 'No description')}")
        
        try:
            requirements = task.get('requirements', {})
            title = requirements.get('title', task.get('description', ''))
            description = requirements.get('description', '')
            
            self.log(f"Task title: {title}")
            
            title_lower = title.lower()
            
            if 'api' in title_lower or 'endpoint' in title_lower:
                return self._create_api(title, description, requirements)
            elif 'service' in title_lower or 'utility' in title_lower:
                return self._create_service(title, description, requirements)
            elif 'middleware' in title_lower:
                return self._create_middleware(title, description, requirements)
            else:
                # Default to service creation
                return self._create_service(title, description, requirements)
        
        except Exception as e:
            self.update_status('idle')
            self.log(f"Task execution error: {str(e)}")
            return {
                'success': False,
                'message': f'Error: {str(e)}'
            }
    
    def _create_api(self, title: str, description: str, requirements: dict) -> dict:
        """Create API endpoints"""
        
        self.update_status('busy')
        self.log('Creating API endpoints...')
        
        service_name = self._extract_service_name(title)
        self.log(f'Service name: {service_name}')
        
        if not self.code_generator:
            code = self._create_api_template(service_name, description)
        else:
            try:
                prompt = f"""Generate Express.js API endpoints for {service_name}.

Description: {description}

Requirements:
- Use Express Router
- Include error handling
- Add input validation
- Use async/await
- Follow REST conventions
- Include JSDoc comments

Return ONLY the router code with imports."""

                response = self.code_generator.model.generate_content(prompt)
                code = response.text
                
                # Clean markdown
                if code.startswith('```'):
                    lines = code.split('\n')
                    if lines[0].startswith('```'):
                        lines = lines[1:]
                    if lines and lines[-1].startswith('```'):
                        lines = lines[:-1]
                    code = '\n'.join(lines)
                
                self.log(f'Code generated ({len(code)} characters)')
            except Exception as e:
                self.log(f'Generation failed: {str(e)}, using template')
                code = self._create_api_template(service_name, description)
        
        file_path = f'src/routes/{service_name.lower()}.routes.js'
        self.log(f'Writing to {file_path}...')
        
        result = self.write_file(file_path, code)
        
        if result.get('success'):
            self.log(f'✅ API created at {file_path}')
        
        self.update_status('idle')
        
        return {
            'success': result.get('success', False),
            'result': {
                'service': service_name,
                'file': file_path,
                'code_length': len(code)
            },
            'files_modified': [file_path],
            'message': f'Created {service_name} API at {file_path}'
        }
    
    def _create_service(self, title: str, description: str, requirements: dict) -> dict:
        """Create service/utility module"""
        
        self.update_status('busy')
        self.log('Creating service module...')
        
        service_name = self._extract_service_name(title)
        
        if not self.code_generator:
            code = self._create_service_template(service_name, description)
        else:
            try:
                prompt = f"""Generate a Node.js service module for {service_name}.

Description: {description}

Requirements:
- Export functions as module
- Include error handling
- Add JSDoc comments
- Use async/await where appropriate
- Follow Node.js best practices

Return ONLY the service code."""

                response = self.code_generator.model.generate_content(prompt)
                code = response.text
                
                if code.startswith('```'):
                    lines = code.split('\n')
                    if lines[0].startswith('```'):
                        lines = lines[1:]
                    if lines and lines[-1].startswith('```'):
                        lines = lines[:-1]
                    code = '\n'.join(lines)
                
            except Exception as e:
                self.log(f'Generation failed: {str(e)}')
                code = self._create_service_template(service_name, description)
        
        file_path = f'src/services/{service_name}.service.js'
        result = self.write_file(file_path, code)
        
        self.update_status('idle')
        
        return {
            'success': result.get('success', False),
            'result': {'service': service_name, 'file': file_path},
            'files_modified': [file_path],
            'message': f'Created {service_name} service'
        }
    
    def _create_middleware(self, title: str, description: str, requirements: dict) -> dict:
        """Create middleware"""
        self.log("Middleware creation not yet implemented")
        return {'success': False, 'message': 'Not implemented'}
    
    def _extract_service_name(self, title: str) -> str:
        """Extract service name from title"""
        stop_words = {'create', 'implement', 'build', 'add', 'api', 'service', 'system', 'the', 'a'}
        words = [w.capitalize() for w in title.split() if w.lower() not in stop_words]
        return ''.join(words) if words else 'NewService'
    
    def _create_api_template(self, name: str, description: str) -> str:
        """Simple API template"""
        return f"""import express from 'express';

const router = express.Router();

/**
 * {name} API
 * {description}
 */

// GET all
router.get('/', async (req, res) => {{
    try {{
        // TODO: Implement logic
        res.json({{ message: '{name} - GET all' }});
    }} catch (error) {{
        res.status(500).json({{ error: error.message }});
    }}
}});

// GET by ID
router.get('/:id', async (req, res) => {{
    try {{
        const {{ id }} = req.params;
        // TODO: Implement logic
        res.json({{ message: `{name} - GET ${{id}}` }});
    }} catch (error) {{
        res.status(500).json({{ error: error.message }});
    }}
}});

// POST create
router.post('/', async (req, res) => {{
    try {{
        // TODO: Implement logic
        res.status(201).json({{ message: '{name} - POST' }});
    }} catch (error) {{
        res.status(500).json({{ error: error.message }});
    }}
}});

export default router;
"""
    
    def _create_service_template(self, name: str, description: str) -> str:
        """Simple service template"""
        return f"""/**
 * {name} Service
 * {description}
 */

class {name}Service {{
    constructor() {{
        // Initialize service
    }}
    
    async execute() {{
        // TODO: Implement service logic
        return {{ success: true }};
    }}
}}

export default new {name}Service();
"""

# Main execution
if __name__ == '__main__':
    agent = BackendEngineer()
    agent.run()
