"""
Frontend Engineer Agent - Creates and modifies React components

Capabilities:
- Generate new React components
- Modify existing components
- Integrate with design system
- Follow best practices
"""

import sys
import json
from pathlib import Path

# Add parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent.parent))

from agents.base.PythonAgentBase import PythonAgentBase
from agents.utils.CodeGenerator import CodeGenerator

class FrontendEngineer(PythonAgentBase):
    """Frontend Engineer Agent - Creates and modifies React components"""
    
    def __init__(self):
        super().__init__('frontend', 'Frontend Engineer')
        try:
            self.code_generator = CodeGenerator()
            self.log("CodeGenerator initialized successfully")
        except Exception as e:
            self.log(f"Warning: CodeGenerator initialization failed: {str(e)}")
            self.code_generator = None
    
    def execute_task(self, task: dict) -> dict:
        """Execute a frontend task"""
        
        self.update_status('thinking')
        self.log(f"Received task: {task.get('description', 'No description')}")
        
        try:
            # Extract task details
            requirements = task.get('requirements', {})
            title = requirements.get('title', task.get('description', ''))
            description = requirements.get('description', '')
            
            self.log(f"Task title: {title}")
            self.log(f"Task description: {description}")
            
            # Determine what to build
            title_lower = title.lower()
            
            if 'component' in title_lower or 'widget' in title_lower:
                return self._create_component(title, description, requirements)
            elif 'modify' in title_lower or 'update' in title_lower:
                return self._modify_existing(title, description, requirements)
            else:
                # Default to creating a component
                self.log("Task type unclear, defaulting to component creation")
                return self._create_component(title, description, requirements)
        
        except Exception as e:
            self.update_status('idle')
            self.log(f"Task execution error: {str(e)}")
            return {
                'success': False,
                'message': f'Error: {str(e)}'
            }
    
    def _create_component(self, title: str, description: str, requirements: dict) -> dict:
        """Create a new React component"""
        
        self.update_status('busy')
        self.update_progress(0, 'Starting component creation')
        self.log_activity(f'Creating component: {title}')
        
        # Extract component name
        component_name = self._extract_component_name(title)
        self.update_progress(20, f'Extracted component name: {component_name}')
        self.log_activity(f'Component name: {component_name}')
        
        # Generate code
        if not self.code_generator:
            self.update_progress(30, 'Using template (no CodeGenerator)')
            self.log_activity('CodeGenerator not available, creating simple component template')
            code = self._create_simple_template(component_name, description) # Kept original method name
        else:
            try:
                self.update_progress(30, 'Generating code with Gemini Flash...')
                self.log_activity('Calling Gemini API for code generation')
                code = self.code_generator.generate_react_component(
                    component_name=component_name,
                    description=description,
                    requirements=requirements.get('features', []) # Updated requirements argument
                )
                self.update_progress(70, 'Code generated successfully')
                self.log_activity(f'Generated {len(code)} characters of code')
            except Exception as e:
                self.update_progress(40, f'Generation failed: {str(e)}, using template')
                self.log_activity(f'Code generation failed: {str(e)}, using template')
                code = self._create_simple_template(component_name, description) # Kept original method name
        
        # Write file
        file_path = f'apps/dashboard/src/components/{component_name}.jsx'
        self.update_progress(80, f'Writing file to {file_path}...')
        self.log_activity(f'Writing to {file_path}')
        
        result = self.write_file(file_path, code)
        
        if result.get('success'):
            self.log(f'✅ Component created successfully at {file_path}')
        else:
            self.log(f'❌ Failed to write file: {result}')
        
        self.update_status('idle')
        
        return {
            'success': result.get('success', False),
            'result': {
                'component': component_name,
                'file': file_path,
                'code_length': len(code)
            },
            'files_modified': [file_path],
            'message': f'Created {component_name} component at {file_path}'
        }
    
    def _extract_component_name(self, title: str) -> str:
        """Extract component name from task title"""
        # Remove common words
        stop_words = {'add', 'create', 'implement', 'build', 'to', 'the', 'a', 'an', 'for', 'in', 'on', 'at'}
        
        words = title.split()
        name_words = []
        
        for word in words:
            # Keep capitalized words or words not in stop list
            if word[0].isupper() or word.lower() not in stop_words:
                # Capitalize first letter
                name_words.append(word.capitalize())
        
        # Join and remove spaces
        component_name = ''.join(name_words)
        
        # Ensure it doesn't end with common suffixes we'll add
        for suffix in ['Component', 'Widget', 'Panel']:
            if component_name.endswith(suffix):
                return component_name
        
        # If name is too short or generic, add 'Component'
        if len(component_name) < 4:
            component_name += 'Component'
        
        return component_name if component_name else 'NewComponent'
    
    def _create_simple_template(self, component_name: str, description: str) -> str:
        """Create a simple component template when CodeGenerator is unavailable"""
        return f"""import React from 'react';

const {component_name} = () => {{
    const colors = {{
        bg: '#000000',
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        primary: '#2B81FF'
    }};

    return (
        <div style={{{{
            padding: '24px',
            backgroundColor: colors.card,
            border: `1px solid ${{colors.border}}`,
            borderRadius: '16px'
        }}}}>
            <h3 style={{{{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: 700,
                color: colors.textMain
            }}}}>
                {component_name}
            </h3>
            <p style={{{{
                margin: 0,
                fontSize: '14px',
                color: colors.textMuted
            }}}}>
                {description}
            </p>
        </div>
    );
}};

export default {component_name};
"""
    
    def _modify_existing(self, title: str, description: str, requirements: dict) -> dict:
        """Modify existing component"""
        self.log("Component modification not yet implemented")
        return {
            'success': False,
            'message': 'Component modification not yet implemented'
        }

# Main execution
if __name__ == '__main__':
    agent = FrontendEngineer()
    agent.run()
