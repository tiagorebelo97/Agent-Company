import sys
import os

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../core')))

from base_agent import PythonBaseAgent
from features.architecture_review import ArchitectureReviewSkill
from features.dependency_mapping import DependencyMappingSkill
from features.code_complexity import CodeComplexitySkill

class ProjectAnalyst(PythonBaseAgent):
    def __init__(self):
        super().__init__('analyst', 'Project Analyst')
        self.skill_definitions = ["Architecture Review", "Dependency Mapping", "Code Complexity"]
        self.category = 'research'
        self.skills_registry = {}
        
        # Initialize Skills
        self.skills_registry['Architecture Review'] = ArchitectureReviewSkill(self)
        self.skills_registry['Dependency Mapping'] = DependencyMappingSkill(self)
        self.skills_registry['Code Complexity'] = CodeComplexitySkill(self)
        
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
                "message": f"Task handled by base logic of ProjectAnalyst"
            }
            
        import time
        time.sleep(1) # Simulate work
        
        self.update_status('idle')
        
        return result

    def handle_message(self, message):
        return {'acknowledged': True, 'agent': self.name}
