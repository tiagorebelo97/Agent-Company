import sys
import os

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../core')))

from base_agent import PythonBaseAgent
from features.microservices import MicroservicesSkill
from features.service_mesh import ServiceMeshSkill
from features.event_driven_architecture import EventDrivenArchitectureSkill
from features.d_d_d import DDDSkill
from features.kubernetes import KubernetesSkill

class ArchitectureAgent(PythonBaseAgent):
    def __init__(self):
        super().__init__('architecture', 'Architecture Agent')
        self.skill_definitions = ["Microservices", "Service Mesh", "Event-Driven Architecture", "DDD", "Kubernetes"]
        self.category = 'development'
        self.skills_registry = {}
        
        # Initialize Skills
        self.skills_registry['Microservices'] = MicroservicesSkill(self)
        self.skills_registry['Service Mesh'] = ServiceMeshSkill(self)
        self.skills_registry['Event-Driven Architecture'] = EventDrivenArchitectureSkill(self)
        self.skills_registry['DDD'] = DDDSkill(self)
        self.skills_registry['Kubernetes'] = KubernetesSkill(self)
        
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
                "message": f"Task handled by base logic of ArchitectureAgent"
            }
            
        import time
        time.sleep(1) # Simulate work
        
        self.update_status('idle')
        
        return result

    def _get_system_context(self) -> str:
        return """You are the Architecture Agent AI in the Agent-Company platform.
Your expertise: System design, microservices, cloud infrastructure, event-driven architectures, and database modeling.
Style: Technical, analytical, and precise.
Respond naturally to architecture questions and help users design scalable systems."""

    def handle_message(self, message):
        return {'acknowledged': True, 'agent': self.name}
