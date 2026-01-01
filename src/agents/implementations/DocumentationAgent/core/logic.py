import sys
import os

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../core')))

from base_agent import PythonBaseAgent
from features.a_p_i_docs import APIDocsSkill
from features.tutorials import TutorialsSkill
from features.r_e_a_d_m_e import READMESkill

class DocumentationAgent(PythonBaseAgent):
    def __init__(self):
        super().__init__('docs', 'Documentation Agent')
        self.skill_definitions = ["API Docs", "Tutorials", "README"]
        self.category = 'content'
        self.skills_registry = {}
        
        # Initialize Skills
        self.skills_registry['API Docs'] = APIDocsSkill(self)
        self.skills_registry['Tutorials'] = TutorialsSkill(self)
        self.skills_registry['README'] = READMESkill(self)
        
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
                "message": f"Task handled by base logic of DocumentationAgent"
            }
            
        import time
        time.sleep(1) # Simulate work
        
        self.update_status('idle')
        
        return result

    def handle_message(self, message):
        return {'acknowledged': True, 'agent': self.name}
