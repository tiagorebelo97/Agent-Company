import sys
import os

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../core')))

from base_agent import PythonBaseAgent
from features.blog_posts import BlogPostsSkill
from features.s_e_o_writing import SEOWritingSkill
from features.copywriting import CopywritingSkill

class ContentWriterAgent(PythonBaseAgent):
    def __init__(self):
        super().__init__('content', 'Content Writer Agent')
        self.skill_definitions = ["Blog Posts", "SEO Writing", "Copywriting"]
        self.category = 'content'
        self.skills_registry = {}
        
        # Initialize Skills
        self.skills_registry['Blog Posts'] = BlogPostsSkill(self)
        self.skills_registry['SEO Writing'] = SEOWritingSkill(self)
        self.skills_registry['Copywriting'] = CopywritingSkill(self)
        
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
                "message": f"Task handled by base logic of ContentWriterAgent"
            }
            
        import time
        time.sleep(1) # Simulate work
        
        self.update_status('idle')
        
        return result

    def handle_message(self, message):
        return {'acknowledged': True, 'agent': self.name}
