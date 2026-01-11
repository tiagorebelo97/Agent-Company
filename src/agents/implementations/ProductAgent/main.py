import sys
import os

# Ensure the local core directory is in the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../core')))
from base_agent import PythonBaseAgent
from features.feature_improvement import FeatureImprovementSkill

class ProductAgent(PythonBaseAgent):
    def __init__(self):
        super().__init__('product', 'Product Agent')
        self.role = "Product Optimization & Strategy"
        self.category = 'business'
        
        # Initialize Skills
        self.feature_improvement_skill = FeatureImprovementSkill(self)
        
    def execute_task(self, task):
        task_type = task.get('type')
        description = task.get('description', '').lower()
        
        self.log(f"Product Agent received task: {task_type}")
        self.log(f"Task description: {description}")
        self.log(f"Full task keys: {list(task.keys())}")
        self.update_status('working')
        
        # Check conditions
        has_improve = 'improve' in description
        has_melhorar = 'melhorar' in description
        has_feature = 'feature' in description
        is_analysis = task_type == 'agent_analysis'
        
        self.log(f"Condition check: improve={has_improve}, melhorar={has_melhorar}, feature={has_feature}, agent_analysis={is_analysis}")
        
        if has_improve or has_melhorar or has_feature or is_analysis:
            self.log("Executing FeatureImprovementSkill")
            result = self.feature_improvement_skill.execute(task)
        else:
            self.log("Falling back to generic handler")
            result = {
                "success": True,
                "message": "Product Agent processed general task",
                "result": f"I've analyzed the request for: {task.get('title', 'Untitled')}"
            }
            
        self.update_status('idle')
        return result

    def handle_message(self, message):
        return {'acknowledged': True, 'agent': self.name}

    def _get_system_context(self) -> str:
        return """You are the Product Agent. Your expertise is in product management, feature prioritization, and optimization.
Your goal is to ensure the product features align perfectly with the target audience and business model.
You focus on making existing features better and identifying incremental improvements."""

if __name__ == "__main__":
    agent = ProductAgent()
    agent.run()
