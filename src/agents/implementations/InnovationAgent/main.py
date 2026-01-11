import sys
import os

# Ensure the local core directory is in the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../core')))
from base_agent import PythonBaseAgent
from features.radical_innovation import RadicalInnovationSkill

class InnovationAgent(PythonBaseAgent):
    def __init__(self):
        super().__init__('innovation', 'Innovation Agent')
        self.role = "Radical Innovation & Disruption"
        self.category = 'research'
        
        # Initialize Skills
        self.innovation_skill = RadicalInnovationSkill(self)
        
    def execute_task(self, task):
        task_type = task.get('type')
        description = task.get('description', '').lower()
        
        self.log(f"Innovation Agent received task: {task_type}")
        self.update_status('working')
        
        if any(w in description for w in ['new', 'novo', 'create', 'criar', 'disrupt', 'innovation', 'inovação']) or task_type == 'agent_analysis':
            result = self.innovation_skill.execute(task)
        else:
            result = {
                "success": True,
                "message": "Innovation Agent processed general task",
                "result": f"I've explored disruptive ideas for: {task.get('title', 'Untitled')}"
            }
            
        self.update_status('idle')
        return result

    def handle_message(self, message):
        return {'acknowledged': True, 'agent': self.name}

    def _get_system_context(self) -> str:
        return """You are the Innovation Agent. Your purpose is to think OUTSIDE the box.
You identify radical new features, moonshot ideas, and disruptive pivots that can redefine the industry.
You don't care about incremental improvements; you care about the NEXT BIG THING."""

if __name__ == "__main__":
    agent = InnovationAgent()
    agent.run()
