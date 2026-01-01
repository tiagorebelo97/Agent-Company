import sys
import os

# Add path to Agent-Company core for base_agent
# Current dir: expert_design_agent/
# Target: src/agents/core/
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/agents/core')))

try:
    from base_agent import PythonBaseAgent
except ImportError:
    # Fallback if path mapping fails (e.g. strict isolation)
    # Copy minimal base_agent logic if needed, but path append should work
    sys.exit("Failed to import BaseAgent")

from core.agent import DesignAgent

class DesignAgentBridge(PythonBaseAgent):
    def __init__(self):
        super().__init__('design', 'Expert Design Agent')
        self.engine = DesignAgent()

    def execute_task(self, task):
        task_type = task.get('type')
        description = task.get('description')
        
        if task_type == 'analyze_inspiration':
            path = task.get('path') or task.get('image_path')
            return self.engine.analyze_inspiration(path)
            
        elif task_type == 'implement_design' or task_type == 'design':
            return self.engine.implement_design(description)
            
        elif task_type == 'critique':
            success = self.engine.critique_and_refine()
            return {'success': success}
            
        else:
            return {'success': False, 'error': f"Unknown task type: {task_type}"}

    def handle_message(self, message):
        return {'acknowledged': True}

if __name__ == "__main__":
    agent = DesignAgentBridge()
    agent.run()
