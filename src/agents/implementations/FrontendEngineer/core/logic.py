import sys
import os

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../core')))
from base_agent import PythonBaseAgent

class FrontendEngineer(PythonBaseAgent):
    def __init__(self):
        super().__init__('frontend', 'Frontend Engineer')

    def execute_task(self, task):
        # DEFENSIVE: Validate task_type
        task_type = task.get('type')
        if not task_type or not isinstance(task_type, str):
            task_type = 'general'
        
        description = task.get('description', '')
        
        if task_type in ['create_component', 'frontend', 'ui']:
            return self.create_component(description, task.get('path'))
        else:
            # Accept any task type - provide frontend implementation
            return {
                'success': True,
                'result': f"Frontend work for: {task.get('title', 'Untitled')}",
                'message': f"Frontend processed {task_type} task"
            }

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
