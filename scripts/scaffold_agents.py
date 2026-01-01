import json
import os
import re

def to_pascal_case(name):
    # Remove special characters except spaces
    name = re.sub(r'[^a-zA-Z0-9\s]', '', name)
    # Split by space and capitalize each word
    return ''.join(word.capitalize() for word in name.split())

def to_snake_case(name):
    name = re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()
    return re.sub(r'[^a-z0-9_]', '', name)

def scaffold_agents():
    # Read config
    with open('config/agents.json', 'r', encoding='utf-8') as f:
        agents = json.load(f)

    base_path = 'src/agents/implementations'
    
    for agent in agents:
        if agent.get('skipScaffold'):
            print(f"Skipping existing agent: {agent['name']}")
            continue
            
        folder_name = to_pascal_case(agent['name'])
        agent_dir = os.path.join(base_path, folder_name)
        
        print(f"Scaffolding {agent['name']} at {agent_dir}...")
        
        # Create directories
        os.makedirs(os.path.join(agent_dir, 'core'), exist_ok=True)
        os.makedirs(os.path.join(agent_dir, 'features'), exist_ok=True)
        
        # Create main.py (Bridge)
        class_name = folder_name
        main_content = f"""import sys
import os

# Add parent directories to path to import components
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../core')))

from base_agent import PythonBaseAgent
from core.logic import {class_name}

if __name__ == "__main__":
    # Initialize and run the agent
    agent = {class_name}()
    agent.run()
"""
        with open(os.path.join(agent_dir, 'main.py'), 'w', encoding='utf-8') as f:
            f.write(main_content)
        
        # Generate Feature Files from Skills
        skill_imports = []
        skill_initializations = []
        
        for skill in agent.get('skills', []):
            skill_slug = to_snake_case(skill.replace(' ', ''))
            skill_class = skill.replace(' ', '') + 'Skill'
            skill_file = f"features/{skill_slug}.py"
            
            # Create feature file
            feature_content = f"""
class {skill_class}:
    def __init__(self, agent):
        self.agent = agent
        
    def execute(self, params):
        self.agent.log(f"Executing skill: {{self.__class__.__name__}}")
        # TODO: Implement logic for {skill}
        return {{
            "skill": "{skill}",
            "status": "simulated_success",
            "params": params
        }}
"""
            with open(os.path.join(agent_dir, 'features', f"{skill_slug}.py"), 'w', encoding='utf-8') as f:
                f.write(feature_content)
            
            skill_imports.append(f"from features.{skill_slug} import {skill_class}")
            skill_initializations.append(f"self.skills_registry['{skill}'] = {skill_class}(self)")

        # Create core/logic.py (Engine)
        imports_str = '\n'.join(skill_imports)
        inits_str = '\n        '.join(skill_initializations)
        
        logic_content = f"""import sys
import os

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../core')))

from base_agent import PythonBaseAgent
{imports_str}

class {class_name}(PythonBaseAgent):
    def __init__(self):
        super().__init__('{agent['id']}', '{agent['name']}')
        self.skill_definitions = {json.dumps(agent.get('skills', []))}
        self.category = '{agent.get('category', 'general')}'
        self.skills_registry = {{}}
        
        # Initialize Skills
        {inits_str}
        
    def execute_task(self, task):
        task_type = task.get('type')
        description = task.get('description')
        
        self.log(f"Received task: {{task_type}} - {{description}}")
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
            result = {{
                "status": "success",
                "message": f"Task handled by base logic of {class_name}"
            }}
            
        import time
        time.sleep(1) # Simulate work
        
        self.update_status('idle')
        
        return result

    def handle_message(self, message):
        return {{'acknowledged': True, 'agent': self.name}}
"""
        with open(os.path.join(agent_dir, 'core', 'logic.py'), 'w', encoding='utf-8') as f:
            f.write(logic_content)
            
        # Create empty __init__.py files
        with open(os.path.join(agent_dir, '__init__.py'), 'w') as f: pass
        with open(os.path.join(agent_dir, 'core', '__init__.py'), 'w') as f: pass
        with open(os.path.join(agent_dir, 'features', '__init__.py'), 'w') as f: pass

    print("Scaffolding complete!")

if __name__ == "__main__":
    scaffold_agents()
