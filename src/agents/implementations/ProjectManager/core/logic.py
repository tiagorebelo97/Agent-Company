import sys
import os

# Add parent directories to path to import PythonBaseAgent
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../core')))
from base_agent import PythonBaseAgent

class ProjectManager(PythonBaseAgent):
    def __init__(self):
        super().__init__('pm', 'Project Manager')
        self.projects = {}

    def execute_task(self, task):
        task_type = task.get('type')
        description = task.get('description')
        requirements = task.get('requirements', '')

        if task_type == 'create_feature':
            return self.create_feature(description, requirements)
        elif task_type == 'decompose_task':
            return self.decompose_task(description)
        else:
            # Try Direct Routing
            subtask = {
                'id': task.get('id', 'direct-1'),
                'type': task_type,
                'desc': description or task.get('desc', '')
            }
            res = self.assign_subtask(subtask)
            if res['assigned_to']:
                 return res
            return {'success': False, 'error': f"Unknown task type: {task_type}"}

    def handle_message(self, message):
        return {'acknowledged': True, 'agent': self.name}

    def create_feature(self, description, requirements):
        self.log(f"PM: Analyzing feature '{description}'")
        self.update_status('thinking')
        
        # Step 1: Decompose into subtasks
        subtasks = self.decompose_into_subtasks(description, requirements)
        
        # Step 2: Assign subtasks to agents
        assignments = []
        for subtask in subtasks:
            assignment = self.assign_subtask(subtask)
            assignments.append(assignment)
        
        self.update_status('idle')
        
        return {
            'status': 'in_progress',
            'feature': description,
            'subtasks': subtasks,
            'assignments': assignments,
            'message': f'Created plan with {len(subtasks)} subtasks and assigned to agents'
        }

    def assign_subtask(self, subtask):
        """Assign a subtask to the appropriate agent"""
        
        # Comprehensive mapping of task types to agent IDs
        agent_mapping = {
            'design': 'design',
            'ui': 'frontend',
            'frontend': 'frontend',
            'create_component': 'frontend', # Map create_component to frontend
            'backend': 'backend',
            'api': 'backend',
            'database': 'db',
            'db': 'db',
            'schema': 'db',
            'testing': 'qa',
            'qa': 'qa',
            'test': 'qa',
            'devops': 'devops',
            'deployment': 'devops',
            'infrastructure': 'devops',
            'architecture': 'architecture',
            'system': 'architecture',
            'security': 'security',
            'audit': 'security',
            'research': 'research',
            'analysis': 'analyst',
            'content': 'content',
            'docs': 'docs',
            'mobile': 'mobile',
            'app': 'mobile'
        }
        
        task_type = subtask.get('type', '').lower()
        agent_id = agent_mapping.get(task_type)
        
        # Fallback heuristic if exact type match fails
        if not agent_id:
            desc = (subtask.get('desc') or subtask.get('description') or '').lower()
            for key, val in agent_mapping.items():
                if key in desc:
                    agent_id = val
                    break
        
        desc_log = subtask.get('desc') or subtask.get('description') or 'Unknown task'
        
        if agent_id:
            self.log(f"PM: Assigning '{desc_log}' to {agent_id}")
            
            # Send assignment via bridge (Node will route to the agent)
            self.send_to_bridge({
                'type': 'assign_task',
                'targetAgent': agent_id,
                'task': {
                    'type': subtask['type'],
                    'description': desc_log,
                    'id': subtask.get('id', 'auto-1'),
                    'path': subtask.get('path') # Pass path if exists
                }
            })
            
            return {
                'subtask_id': subtask.get('id'),
                'assigned_to': agent_id,
                'status': 'assigned'
            }
        else:
            self.log(f"PM: Could not assign subtask '{desc_log}' - keeping pending")
            return {
                'subtask_id': subtask.get('id'),
                'assigned_to': None,
                'status': 'pending'
            }

    def decompose_into_subtasks(self, description, requirements):
        subtasks = []
        import uuid
        
        # Generate a standard software development lifecycle plan
        
        # 1. Architecture & Analysis Phase
        subtasks.append({
            'id': str(uuid.uuid4())[:8],
            'type': 'architecture',
            'desc': f'Define system architecture and technical requirements for: {description}',
            'phase': 'planning'
        })
        
        # 2. Design Phase
        subtasks.append({
            'id': str(uuid.uuid4())[:8],
            'type': 'design',
            'desc': f'Create UI/UX designs and component specifications for: {description}',
            'phase': 'design'
        })

        # 3. Security Assessment (Early)
        subtasks.append({
            'id': str(uuid.uuid4())[:8],
            'type': 'security',
            'desc': f'Perform initial security risk assessment for: {description}',
            'phase': 'design'
        })
        
        # 4. Implementation Phase - Backend
        subtasks.append({
            'id': str(uuid.uuid4())[:8],
            'type': 'backend',
            'desc': f'Implement API endpoints and business logic for: {description}',
            'phase': 'implementation'
        })

        # 5. Implementation Phase - Frontend
        subtasks.append({
            'id': str(uuid.uuid4())[:8],
            'type': 'frontend',
            'desc': f'Implement React components and pages for: {description}',
            'phase': 'implementation'
        })
        
        # 6. QA & Testing
        subtasks.append({
            'id': str(uuid.uuid4())[:8],
            'type': 'qa',
            'desc': f'Execute comprehensive test plan for: {description}',
            'phase': 'verification'
        })
        
        return subtasks
