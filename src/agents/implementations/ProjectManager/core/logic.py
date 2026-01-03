import os
import sys
import json
from typing import Optional, Dict, List

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../core')))
from base_agent import PythonBaseAgent


class ProjectManager(PythonBaseAgent):
    """
    Enhanced Project Manager with autonomous orchestration capabilities
    
    New capabilities:
    - Intelligent task decomposition using LLM
    - Autonomous agent delegation
    - Progress monitoring
    - Result integration
    - Learning from outcomes
    """
    
    def __init__(self):
        super().__init__('pm', 'Project Manager')
        self.projects = {}
        self.active_orchestrations = {}  # Track ongoing feature implementations

    def execute_task(self, task):
        """Enhanced task execution with feature detection"""
        task_type = task.get('type', 'general')
        if not isinstance(task_type, str):
            task_type = 'general'
        
        task_type = task_type.lower()
        description = task.get('description', '')
        title = task.get('title', '')
        
        # Detect feature implementation requests
        if task_type == 'feature' or 'implement' in description.lower() or 'create' in description.lower():
            return self.orchestrate_feature_implementation(task)
        elif task_type == 'create_feature':
            return self.create_feature(description, task.get('requirements', ''))
        elif task_type == 'decompose_task':
            return self.decompose_task(description)
        else:
            # Direct routing for other task types
            subtask = {
                'id': task.get('id', 'direct-1'),
                'type': task_type,
                'desc': description or task.get('desc', '')
            }
            res = self.assign_subtask(subtask)
            if res['assigned_to']:
                return res
            
            return {
                'success': True,
                'result': f"PM coordinated task: {title or 'Untitled'}",
                'message': f"Task type '{task_type}' processed by Project Manager"
            }

    def orchestrate_feature_implementation(self, task) -> Dict:
        """
        Autonomous feature implementation orchestration
        
        This is the main orchestration method that:
        1. Analyzes the feature requirements
        2. Checks for similar past implementations
        3. Decomposes into subtasks
        4. Delegates to specialized agents
        5. Monitors progress
        6. Integrates results
        7. Learns from the outcome
        """
        task_id = task.get('id', 'unknown')
        title = task.get('title', 'Untitled Feature')
        description = task.get('description', '')
        
        self.log(f"🎯 PM: Starting autonomous orchestration for '{title}'")
        self.update_status('thinking')
        
        # Step 1: Check if we've done something similar before
        self.log("📚 Checking past implementations...")
        past_approach = self.recall_best_approach('feature_implementation', title)
        
        if past_approach:
            self.log(f"✅ Found similar past implementation: {past_approach.get('description')}")
        
        # Step 2: Analyze and decompose the feature
        self.log("🔍 Analyzing feature requirements...")
        subtasks = self.intelligent_decomposition(title, description)
        
        self.log(f"📋 Decomposed into {len(subtasks)} subtasks")
        
        # Step 3: Delegate to specialized agents
        self.log("👥 Delegating to specialized agents...")
        delegations = []
        
        for subtask in subtasks:
            agent_id = self._determine_best_agent(subtask)
            
            if agent_id:
                # Use new collaboration protocol
                delegation = self.request_work_from(
                    agent_id=agent_id,
                    task_spec={
                        'type': subtask['type'],
                        'description': subtask['desc'],
                        'parent_task_id': task_id,
                        'requirements': subtask.get('requirements', {})
                    },
                    priority=subtask.get('priority', 'medium')
                )
                
                delegations.append({
                    'subtask_id': subtask['id'],
                    'agent': agent_id,
                    'delegation': delegation
                })
                
                self.log(f"  ✓ Assigned '{subtask['desc'][:50]}...' to {agent_id}")
        
        # Step 4: Store orchestration state
        self.active_orchestrations[task_id] = {
            'title': title,
            'subtasks': subtasks,
            'delegations': delegations,
            'status': 'in_progress',
            'started_at': self._get_timestamp()
        }
        
        # Step 5: Record this orchestration for learning
        self.remember_success(
            task_type='feature_orchestration',
            description=title,
            approach=f"Decomposed into {len(subtasks)} subtasks, delegated to {len(delegations)} agents",
            outcome={
                'subtasks_created': len(subtasks),
                'agents_involved': len(delegations),
                'orchestration_id': task_id
            }
        )
        
        self.update_status('idle')
        
        return {
            'success': True,
            'orchestrated': True,
            'status': 'in_progress',
            'feature': title,
            'subtasks': len(subtasks),
            'agents_assigned': len(delegations),
            'message': f'Orchestrated {title} with {len(subtasks)} subtasks across {len(delegations)} agents'
        }

    def intelligent_decomposition(self, title: str, description: str) -> List[Dict]:
        """
        Use LLM to intelligently decompose a feature into subtasks
        """
        # Try to use LLM for smart decomposition
        if self.llm_manager:
            prompt = f"""
Decompose this feature into specific, actionable subtasks:

Feature: {title}
Description: {description}

Create a list of subtasks with:
- type: (frontend, backend, design, qa, etc.)
- description: What needs to be done
- priority: (high, medium, low)
- dependencies: Which subtasks must complete first

Return as JSON array with format:
[{{"type": "...", "desc": "...", "priority": "...", "dependencies": []}}]

Focus on practical implementation steps. Be specific.
"""
            
            try:
                response = self.llm_manager.generate_response(
                    prompt=prompt,
                    system_context="You are a technical project manager. Decompose features into clear, actionable subtasks."
                )
                
                # Try to parse JSON from response
                import re
                json_match = re.search(r'\[.*\]', response, re.DOTALL)
                if json_match:
                    subtasks_data = json.loads(json_match.group())
                    
                    # Add IDs
                    import uuid
                    subtasks = []
                    for st in subtasks_data:
                        st['id'] = str(uuid.uuid4())[:8]
                        subtasks.append(st)
                    
                    self.log(f"✨ LLM generated {len(subtasks)} intelligent subtasks")
                    return subtasks
                    
            except Exception as e:
                self.log(f"⚠️ LLM decomposition failed: {str(e)}, using fallback")
        
        # Fallback to rule-based decomposition
        return self._fallback_decomposition(title, description)

    def _fallback_decomposition(self, title: str, description: str) -> List[Dict]:
        """Fallback rule-based decomposition"""
        import uuid
        subtasks = []
        
        # Detect what kind of feature this is
        desc_lower = description.lower()
        
        # Frontend feature
        if any(word in desc_lower for word in ['component', 'ui', 'interface', 'react', 'jsx']):
            subtasks.append({
                'id': str(uuid.uuid4())[:8],
                'type': 'design',
                'desc': f'Design UI/UX for {title}',
                'priority': 'high',
                'dependencies': []
            })
            subtasks.append({
                'id': str(uuid.uuid4())[:8],
                'type': 'frontend',
                'desc': f'Implement React components for {title}',
                'priority': 'high',
                'dependencies': [subtasks[0]['id']]
            })
        
        # Backend feature
        if any(word in desc_lower for word in ['api', 'endpoint', 'backend', 'database', 'server']):
            subtasks.append({
                'id': str(uuid.uuid4())[:8],
                'type': 'backend',
                'desc': f'Implement API endpoints for {title}',
                'priority': 'high',
                'dependencies': []
            })
        
        # Always add QA
        subtasks.append({
            'id': str(uuid.uuid4())[:8],
            'type': 'qa',
            'desc': f'Test and verify {title}',
            'priority': 'medium',
            'dependencies': [st['id'] for st in subtasks]
        })
        
        return subtasks if subtasks else self._default_decomposition(title)

    def _default_decomposition(self, title: str) -> List[Dict]:
        """Default SDLC decomposition"""
        import uuid
        return [
            {
                'id': str(uuid.uuid4())[:8],
                'type': 'design',
                'desc': f'Design specifications for {title}',
                'priority': 'high',
                'dependencies': []
            },
            {
                'id': str(uuid.uuid4())[:8],
                'type': 'frontend',
                'desc': f'Implement frontend for {title}',
                'priority': 'high',
                'dependencies': []
            },
            {
                'id': str(uuid.uuid4())[:8],
                'type': 'backend',
                'desc': f'Implement backend for {title}',
                'priority': 'high',
                'dependencies': []
            },
            {
                'id': str(uuid.uuid4())[:8],
                'type': 'qa',
                'desc': f'Test {title}',
                'priority': 'medium',
                'dependencies': []
            }
        ]

    def _determine_best_agent(self, subtask: Dict) -> Optional[str]:
        """Determine the best agent for a subtask"""
        agent_mapping = {
            'design': 'design',
            'ui': 'frontend',
            'frontend': 'frontend',
            'react': 'frontend',
            'component': 'frontend',
            'backend': 'backend',
            'api': 'backend',
            'endpoint': 'backend',
            'database': 'db',
            'db': 'db',
            'schema': 'db',
            'testing': 'qa',
            'qa': 'qa',
            'test': 'qa',
            'verify': 'qa',
            'devops': 'devops',
            'deployment': 'devops',
            'security': 'security',
            'research': 'research'
        }
        
        task_type = subtask.get('type', '').lower()
        agent_id = agent_mapping.get(task_type)
        
        if not agent_id:
            # Check description
            desc = subtask.get('desc', '').lower()
            for key, val in agent_mapping.items():
                if key in desc:
                    return val
        
        return agent_id

    def _get_timestamp(self):
        """Get current timestamp"""
        from datetime import datetime
        return datetime.utcnow().isoformat()

    # Keep existing methods for compatibility
    def handle_message(self, message):
        return {'acknowledged': True, 'agent': self.name}

    def _get_system_context(self) -> str:
        return """You are an enhanced Project Manager AI with autonomous orchestration capabilities.
You can decompose complex features, delegate to specialized agents, and coordinate implementation.
Be professional, concise, and proactive. Respond in the user's language."""

    def handle_chat_message(self, user_message: str, history=None) -> dict:
        """Handle chat with task deletion support"""
        msg = user_message.lower()
        
        # Task deletion
        if any(w in msg for w in ["delet", "remov", "apag", "limp"]) and any(w in msg for w in ["task", "taref"]):
            status_filter = None
            if "done" in msg or "concluída" in msg:
                status_filter = "done"
            elif "in_progress" in msg or "processo" in msg:
                status_filter = "in_progress"
            
            try:
                res = self.call_mcp_tool(None, "task_delete", {"status": status_filter})
                if res and res.get('success'):
                    count = res.get('count', 0)
                    return {'success': True, 'response': f"Apaguei {count} tarefas com sucesso! 🧹"}
            except Exception as e:
                self.log(f"Deletion failed: {str(e)}")
        
        return super().handle_chat_message(user_message, history)

    def create_feature(self, description, requirements):
        """Legacy method - redirects to new orchestration"""
        return self.orchestrate_feature_implementation({
            'title': description,
            'description': requirements,
            'type': 'feature'
        })

    def assign_subtask(self, subtask):
        """Assign subtask to agent"""
        agent_id = self._determine_best_agent(subtask)
        desc_log = subtask.get('desc') or subtask.get('description') or 'Unknown task'
        
        if agent_id:
            self.log(f"PM: Assigning '{desc_log}' to {agent_id}")
            
            self.send_to_bridge({
                'type': 'assign_task',
                'targetAgent': agent_id,
                'task': {
                    'type': subtask['type'],
                    'description': desc_log,
                    'id': subtask.get('id', 'auto-1'),
                    'path': subtask.get('path')
                }
            })
            
            return {
                'subtask_id': subtask.get('id'),
                'assigned_to': agent_id,
                'status': 'assigned'
            }
        else:
            return {
                'subtask_id': subtask.get('id'),
                'assigned_to': None,
                'status': 'pending'
            }
