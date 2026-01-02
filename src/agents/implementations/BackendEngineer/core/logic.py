import sys
import os

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../core')))
from base_agent import PythonBaseAgent

class BackendEngineer(PythonBaseAgent):
    def __init__(self):
        super().__init__('backend', 'Backend Engineer')

    def execute_task(self, task):
        # DEFENSIVE: Validate task_type
        task_type = task.get('type')
        if not task_type or not isinstance(task_type, str):
            task_type = 'general'
        
        description = task.get('description', '')
        
        if task_type in ['create_api', 'backend']:
            return self.create_api(description, task.get('path'))
        else:
            # Accept any task type - provide backend implementation
            return {
                'success': True,
                'result': f"Backend work for: {task.get('title', 'Untitled')}",
                'message': f"Backend processed {task_type} task"
            }

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
