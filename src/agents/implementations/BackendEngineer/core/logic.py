import sys
import os

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../core')))
from base_agent import PythonBaseAgent

class BackendEngineer(PythonBaseAgent):
    def __init__(self):
        super().__init__('backend', 'Backend Engineer')

    def execute_task(self, task):
        task_type = task.get('type')
        description = task.get('description')
        
        if task_type in ['create_api', 'backend']:
            return self.create_api(description, task.get('path'))
        else:
            return {'success': False, 'error': f"Unknown task type for Backend: {task_type}"}

    def handle_message(self, message):
        return {'acknowledged': True, 'agent': self.name}

    def create_api(self, description, path=None):
        self.log(f"Backend: Creating API endpoint for: {description}")
        self.update_status('busy')
        
        # Import feature dynamically
        from features.api_generator import APIGenerator
        generator = APIGenerator(self)
        
        result = generator.generate(description, path)
        
        self.update_status('idle')
        
        return {
            'status': result['status'],
            'message': f'API endpoint created: {description}',
            'file': result.get('file'),
            'agent': 'Backend Engineer'
        }
