import sys
import os

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../core')))

from base_agent import PythonBaseAgent
from features.react_native import ReactNativeSkill
from features.mobile_u_i import MobileUISkill
from features.app_store import AppStoreSkill

class MobileAgent(PythonBaseAgent):
    def __init__(self):
        super().__init__('mobile', 'Mobile Agent')
        self.skill_definitions = ["React Native", "Mobile UI", "App Store"]
        self.category = 'development'
        self.skills_registry = {}
        
        # Initialize Skills
        self.skills_registry['React Native'] = ReactNativeSkill(self)
        self.skills_registry['Mobile UI'] = MobileUISkill(self)
        self.skills_registry['App Store'] = AppStoreSkill(self)
        
    def execute_task(self, task):
        task_type = task.get('type')
        description = task.get('description')
        
        self.log(f"Received task: {task_type} - {description}")
        self.update_status('working')
        
        # Try to match task to a skill
        # Simple heuristic: matches word in description
        result = None
        for skill_name, skill_instance in self.skills_registry.items():
            if skill_name.lower() in description.lower() or skill_name.lower() in task_type.lower():
                result = skill_instance.execute(task)
                break
                
        if not result:
            # Fallback
            result = {
                "status": "success",
                "message": f"Task handled by base logic of MobileAgent"
            }
            
        import time
        time.sleep(1) # Simulate work
        
        self.update_status('idle')
        
        return result

    def handle_message(self, message):
        return {'acknowledged': True, 'agent': self.name}
