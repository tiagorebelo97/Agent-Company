import sys
import os

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../core')))

from base_agent import PythonBaseAgent
from features.content_scheduling import ContentSchedulingSkill
from features.engagement import EngagementSkill
from features.analytics import AnalyticsSkill

class SocialMediaAgent(PythonBaseAgent):
    def __init__(self):
        super().__init__('social', 'Social Media Agent')
        self.skill_definitions = ["Content Scheduling", "Engagement", "Analytics"]
        self.category = 'content'
        self.skills_registry = {}
        
        # Initialize Skills
        self.skills_registry['Content Scheduling'] = ContentSchedulingSkill(self)
        self.skills_registry['Engagement'] = EngagementSkill(self)
        self.skills_registry['Analytics'] = AnalyticsSkill(self)
        
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
                "message": f"Task handled by base logic of SocialMediaAgent"
            }
            
        import time
        time.sleep(1) # Simulate work
        
        self.update_status('idle')
        
        return result

    def handle_message(self, message):
        return {'acknowledged': True, 'agent': self.name}
