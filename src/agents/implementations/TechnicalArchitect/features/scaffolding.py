import os
import json
import logging

logger = logging.getLogger(__name__)

class AgentScaffoldingSkill:
    def __init__(self, agent):
        self.agent = agent

    def execute(self, task):
        config = task.get('requirements', {})
        if not config:
             # Try to extract from description if not in requirements
             description = task.get('description', '')
             # For now, we expect structured requirements
             return {"status": "error", "message": "Missing structured requirements for scaffolding"}

        agent_id = config.get('id')
        name = config.get('name')
        role = config.get('role', 'Specialized Assistant')
        category = config.get('category', 'general')
        
        if not agent_id or not name:
            return {"status": "error", "message": "Agent ID and Name are required"}

        # 1. Create directory structure
        agent_dir = os.path.join('src', 'agents', 'implementations', name.replace(" ", ""))
        os.makedirs(agent_dir, exist_ok=True)
        os.makedirs(os.path.join(agent_dir, 'core'), exist_ok=True)
        os.makedirs(os.path.join(agent_dir, 'features'), exist_ok=True)

        # 2. Create main.py
        main_py_content = f'''import sys
import os

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../core')))

from base_agent import PythonBaseAgent
from core.logic import {name.replace(" ", "")}

if __name__ == "__main__":
    agent = {name.replace(" ", "")}()
    agent.run()
'''
        with open(os.path.join(agent_dir, 'main.py'), 'w', encoding='utf-8') as f:
            f.write(main_py_content)

        # 3. Create logic.py
        logic_py_content = f'''from base_agent import PythonBaseAgent

class {name.replace(" ", "")}(PythonBaseAgent):
    def __init__(self):
        super().__init__('{agent_id}', '{name}')
        self.role = '{role}'
        self.category = '{category}'

    def execute_task(self, task):
        self.log(f"Agent {{self.name}} executing task: {{task.get('type')}}")
        self.update_status('working')
        # Implementation goes here
        self.update_status('idle')
        return {{"status": "success", "message": f"Task handled by {{self.name}}"}}

    def handle_message(self, message):
        return {{"acknowledged": True, "agent": self.name}}
'''
        with open(os.path.join(agent_dir, 'core', 'logic.py'), 'w', encoding='utf-8') as f:
            f.write(logic_py_content)

        # 4. Update config/agents.json
        config_path = os.path.join('config', 'agents.json')
        with open(config_path, 'r', encoding='utf-8') as f:
            agents_config = json.load(f)

        # Check if already exists
        if not any(a['id'] == agent_id for a in agents_config):
            agents_config.append({
                "id": agent_id,
                "name": name,
                "role": role,
                "skills": config.get('skills', []),
                "category": category,
                "mcps": config.get('mcps', ["filesystem"])
            })
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(agents_config, f, indent=4)

        return {
            "status": "success",
            "message": f"Agent {name} scaffolded and registered successfully",
            "path": agent_dir
        }
