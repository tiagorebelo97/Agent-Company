"""
CodeGenerator - Generate code using Google Gemini API

Provides code generation capabilities for agents using Gemini (free tier available)
"""

import os
from typing import List, Optional

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    genai = None

class CodeGenerator:
    """Generate code using Google Gemini API"""
    
    def __init__(self):
        if not GENAI_AVAILABLE:
            raise ValueError("google.generativeai not installed. Install with: pip install google-generativeai")
        
        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        # Use gemini-2.5-flash for fast, free code generation
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def generate_react_component(self, 
                                 component_name: str,
                                 description: str,
                                 requirements: Optional[List[str]] = None) -> str:
        """
        Generate a React component
        
        Args:
            component_name: Name of component (e.g., "TaskStats")
            description: What the component should do
            requirements: List of specific requirements
        
        Returns:
            Generated component code
        """
        
        requirements = requirements or []
        requirements_text = '\n'.join(f"- {req}" for req in requirements)
        
        prompt = f"""Generate a React functional component called {component_name}.

Description: {description}

Requirements:
{requirements_text}

Design Guidelines:
- Use the existing design system with these colors:
  - bg: '#000000'
  - card: '#0a0a0a'
  - border: 'rgba(255,255,255,0.08)'
  - textMain: '#ffffff'
  - textMuted: '#8A8A8A'
  - primary: '#2B81FF'
- Use inline styles (no CSS modules)
- Follow the sandbox aesthetic (dark theme, glassmorphism, smooth animations)
- Make it responsive
- Use React hooks (useState, useEffect as needed)
- Add hover effects and transitions
- Include proper prop validation

Return ONLY the component code with imports, no explanations or markdown code blocks."""

        try:
            response = self.model.generate_content(prompt)
            code = response.text
            
            # Clean up markdown if present
            if code.startswith('```'):
                lines = code.split('\n')
                # Remove first and last lines if they're markdown markers
                if lines[0].startswith('```'):
                    lines = lines[1:]
                if lines and lines[-1].startswith('```'):
                    lines = lines[:-1]
                code = '\n'.join(lines)
            
            return code
        
        except Exception as e:
            raise Exception(f"Code generation failed: {str(e)}")
    
    def modify_code(self,
                   existing_code: str,
                   modification: str,
                   file_path: str = "") -> str:
        """
        Modify existing code
        
        Args:
            existing_code: Current code
            modification: What to change
            file_path: Optional file path for context
        
        Returns:
            Modified code
        """
        
        context = f" in {file_path}" if file_path else ""
        
        prompt = f"""Modify the following code{context}:

```
{existing_code}
```

Modification requested: {modification}

Return ONLY the complete modified code, no explanations or markdown."""

        try:
            response = self.model.generate_content(prompt)
            code = response.text
            
            # Clean up markdown if present
            if code.startswith('```'):
                lines = code.split('\n')
                if lines[0].startswith('```'):
                    lines = lines[1:]
                if lines and lines[-1].startswith('```'):
                    lines = lines[:-1]
                code = '\n'.join(lines)
            
            return code
        
        except Exception as e:
            raise Exception(f"Code modification failed: {str(e)}")
    
    def generate_test(self,
                     component_code: str,
                     component_name: str,
                     test_framework: str = "playwright") -> str:
        """
        Generate tests for a component
        
        Args:
            component_code: The component code to test
            component_name: Name of the component
            test_framework: Testing framework to use
        
        Returns:
            Generated test code
        """
        
        prompt = f"""Generate {test_framework} tests for this React component:

Component: {component_name}

```
{component_code}
```

Requirements:
- Test all major functionality
- Test edge cases
- Test user interactions
- Use best practices for {test_framework}

Return ONLY the test code, no explanations."""

        try:
            response = self.model.generate_content(prompt)
            return response.text
        
        except Exception as e:
            raise Exception(f"Test generation failed: {str(e)}")
