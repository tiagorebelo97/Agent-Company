import sys
import os

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../core')))
from base_agent import PythonBaseAgent

class FrontendEngineer(PythonBaseAgent):
    def __init__(self):
        super().__init__('frontend', 'Frontend Engineer')

    def execute_task(self, task):
        task_type = task.get('type')
        description = task.get('description')
        
        if task_type in ['create_component', 'frontend', 'ui']:
            return self.create_component(description, task.get('path'))
        else:
            return {'success': False, 'error': f"Unknown task type for Frontend: {task_type}"}

    def handle_message(self, message):
        return {'acknowledged': True, 'agent': self.name}

    def create_component(self, description, path=None):
        self.log(f"Frontend: Creating React component for: {description}")
        self.update_status('busy')
        
        # Import feature dynamically or lazily to avoid circular issues
        from features.component_generator import ComponentGenerator
        generator = ComponentGenerator(self)
        
        # Generate using the skill (which uses MCP)
        result = generator.generate(description, path)
        
        self.update_status('idle')
        
        return {
            'status': result['status'],
            'message': f'Component created: {description}',
            'file': result.get('file'),
            'agent': 'Frontend Engineer'
        }
