"""
EnhancedCodeGenerator - Intelligent code generation for agents

This utility enables agents to generate production-ready code using LLM,
with proper imports, styling, error handling, and best practices.
"""

import os
import sys
import json
from typing import Dict, List, Optional

# Add parent directory to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from core.llm_manager import LLMManager
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    print("WARNING: LLMManager not available", file=sys.stderr)


class EnhancedCodeGenerator:
    """
    Generates high-quality code using LLM with context awareness
    """
    
    def __init__(self):
        self.llm_manager = LLMManager() if LLM_AVAILABLE else None
    
    def generate_react_component(
        self,
        name: str,
        description: str,
        props: Optional[Dict] = None,
        features: Optional[List[str]] = None,
        styling: str = "tailwind"
    ) -> str:
        """
        Generate a complete React component with all best practices
        
        Args:
            name: Component name (e.g., "TaskSubtasks")
            description: What the component does
            props: Expected props and their types
            features: List of features to implement
            styling: "tailwind" or "css"
        
        Returns:
            Complete component code as string
        """
        if not self.llm_manager:
            return self._fallback_component(name)
        
        prompt = f"""
Generate a production-ready React component with the following specifications:

Component Name: {name}
Description: {description}
Props: {json.dumps(props or {}, indent=2)}
Features: {json.dumps(features or [], indent=2)}
Styling: {styling}

Requirements:
1. Use modern React (functional component with hooks)
2. Include proper PropTypes or TypeScript types
3. Add comprehensive error handling
4. Include accessibility features (ARIA labels, keyboard navigation)
5. Use {styling} for styling
6. Add helpful comments for complex logic
7. Include loading and error states where appropriate
8. Follow React best practices (memo, useCallback, etc.)

Return ONLY the complete component code, no explanations.
Start with imports and end with export default.
"""
        
        try:
            code = self.llm_manager.generate_response(
                prompt=prompt,
                system_context="You are an expert React developer. Generate clean, production-ready code."
            )
            
            # Basic validation
            if not code or 'import' not in code:
                return self._fallback_component(name)
            
            return code
            
        except Exception as e:
            print(f"Code generation failed: {e}", file=sys.stderr)
            return self._fallback_component(name)
    
    def generate_api_endpoint(
        self,
        method: str,
        path: str,
        description: str,
        request_body: Optional[Dict] = None,
        response: Optional[Dict] = None
    ) -> str:
        """
        Generate Express.js API endpoint
        
        Args:
            method: HTTP method (GET, POST, etc.)
            path: Endpoint path (e.g., "/api/tasks/:id/subtasks")
            description: What the endpoint does
            request_body: Expected request body schema
            response: Expected response schema
        
        Returns:
            Complete endpoint code
        """
        if not self.llm_manager:
            return self._fallback_endpoint(method, path)
        
        prompt = f"""
Generate a production-ready Express.js API endpoint:

Method: {method}
Path: {path}
Description: {description}
Request Body: {json.dumps(request_body or {}, indent=2)}
Response: {json.dumps(response or {}, indent=2)}

Requirements:
1. Include proper error handling (try-catch)
2. Validate request parameters
3. Use Prisma for database operations
4. Return consistent response format
5. Add logging for important operations
6. Include appropriate HTTP status codes
7. Add comments for complex logic

Return ONLY the endpoint code (app.{method.lower()}(...)).
"""
        
        try:
            code = self.llm_manager.generate_response(
                prompt=prompt,
                system_context="You are an expert Node.js/Express developer. Generate clean, production-ready code."
            )
            return code
        except Exception as e:
            print(f"Endpoint generation failed: {e}", file=sys.stderr)
            return self._fallback_endpoint(method, path)
    
    def improve_code(self, code: str, improvements: List[str]) -> str:
        """
        Improve existing code based on specific requirements
        
        Args:
            code: Existing code to improve
            improvements: List of improvements to make
        
        Returns:
            Improved code
        """
        if not self.llm_manager:
            return code
        
        prompt = f"""
Improve the following code with these specific improvements:

Improvements needed:
{chr(10).join(f"- {imp}" for imp in improvements)}

Original code:
```
{code}
```

Return ONLY the improved code, maintaining the same structure but with the requested improvements.
"""
        
        try:
            improved = self.llm_manager.generate_response(
                prompt=prompt,
                system_context="You are an expert code reviewer. Improve code while maintaining functionality."
            )
            return improved
        except Exception as e:
            print(f"Code improvement failed: {e}", file=sys.stderr)
            return code
    
    def _fallback_component(self, name: str) -> str:
        """Basic fallback component when LLM is unavailable"""
        return f"""import React from 'react';

const {name} = (props) => {{
    return (
        <div className="p-4">
            <h2>{name}</h2>
            <p>Component generated without LLM. Please implement manually.</p>
        </div>
    );
}};

export default {name};
"""
    
    def _fallback_endpoint(self, method: str, path: str) -> str:
        """Basic fallback endpoint when LLM is unavailable"""
        return f"""app.{method.lower()}('{path}', async (req, res) => {{
    try {{
        // TODO: Implement endpoint logic
        res.json({{ success: true, message: 'Endpoint not implemented' }});
    }} catch (error) {{
        res.status(500).json({{ success: false, error: error.message }});
    }}
}});
"""
