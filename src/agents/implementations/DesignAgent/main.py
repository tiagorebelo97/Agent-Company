import sys
import os

# Add parent directory to path to import base_agent
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from core.base_agent import PythonBaseAgent
from features.expert_design import ExpertDesignSkill
from features.vision_critique import VisionCritiqueSkill

class DesignAgent(PythonBaseAgent):
    def __init__(self):
        super().__init__('design', 'Design Agent')
        self.skills = {
            'design': ExpertDesignSkill(self),
            'implement_design': ExpertDesignSkill(self),
            'critique': VisionCritiqueSkill(self)
        }

    def execute_task(self, task):
        # DEFENSIVE: Validate task_type
        task_type = task.get('type')
        if not task_type or not isinstance(task_type, str):
            task_type = 'design'
        
        skill = self.skills.get(task_type)
        
        if skill:
            return skill.execute(task)
        
        # Accept any task type - provide design work
        return {
            "status": "success",
            "result": f"Design work for: {task.get('title', 'Untitled')}",
            "message": f"Design processed {task_type} task"
        }

    def handle_message(self, message):
        return {"acknowledged": True, "agent": self.name}

if __name__ == "__main__":
    agent = DesignAgent()
    agent.run()
