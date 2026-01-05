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
        
        # LLM Manager is automatically initialized by PythonBaseAgent

    def execute_task(self, task):
        """Enhanced task execution with feature detection"""
        task_type = task.get('type', 'general')
        if not isinstance(task_type, str):
            task_type = 'general'
        
        task_type = task_type.lower()
        description = task.get('description', '')
        title = task.get('title', '')
        
        # Detect feature implementation requests
        if task_type == 'project_analysis':
            return self.analyze_project_repository(task)
        elif task_type == 'feature' or 'implement' in description.lower() or 'create' in description.lower():
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

    def analyze_project_repository(self, task) -> Dict:
        """
        Deep analysis of a project repository to understand stack and requirements
        """
        self.log("🚀 DEBUG: UNTRACED ENTRY into analyze_project_repository")
        project_id = task.get('projectId')
        
        # Handle requirements - can be string or dict
        requirements_raw = task.get('requirements', '{}')
        if isinstance(requirements_raw, str):
            requirements = json.loads(requirements_raw)
        else:
            requirements = requirements_raw
            
        local_path = requirements.get('local_path')
        repo_url = requirements.get('repo_url')

        path_to_scan = local_path
        
        # If no local path, try to use repoUrl and clone it
        if not path_to_scan and repo_url:
            self.log(f"🚚 PM: Local path missing for {repo_url}. Attempting to clone...")
            try:
                # Create a local clones directory if it doesn't exist
                clones_dir = "projects_cache"
                repo_name = repo_url.split('/')[-1].replace('.git', '')
                target_path = os.path.join(clones_dir, repo_name)
                
                # Check if already cloned
                self.call_mcp_tool(None, "run_command", {"command": f"mkdir -p {clones_dir}"})
                
                clone_res = self.call_mcp_tool("git", "git_clone", {
                    "url": repo_url,
                    "path": target_path
                })
                
                path_to_scan = target_path
                # Update project with the new local path
                self.call_mcp_tool(None, "project_update", {
                    "projectId": project_id,
                    "localPath": path_to_scan
                })
                self.log(f"✅ PM: Repository cloned to {path_to_scan}")
            except Exception as e:
                self.log(f"⚠️ PM: Failed to clone repository: {str(e)}")
                # Continue with repo_url as fallback, though tools might fail
                path_to_scan = repo_url

        if not path_to_scan:
            return {'success': False, 'error': 'No local path or repository URL provided'}

        self.log(f"🔍 PM: Analyzing project repository at: {path_to_scan}")
        self.update_status('thinking')

        # 1. List files to get a sense of the structure
        try:
            # Note: project_list_files currently lists one level. 
            # We use it on the root to see top-level structure.
            files_res = self.call_mcp_tool(None, "project_list_files", {"dirPath": path_to_scan})
            file_list = files_res.get('files', []) if files_res else []
            
            # 2. Read key entry files (package.json, requirements.txt, etc.)
            key_files = ['package.json', 'requirements.txt', 'README.md', 'prisma/schema.prisma', 'docker-compose.yml']
            context_data = {}
            
            for kf in key_files:
                try:
                    read_res = self.call_mcp_tool(None, "project_read_file", {"filePath": os.path.join(path_to_scan, kf)})
                    if read_res and read_res.get('content'):
                        context_data[kf] = read_res['content']
                except:
                    pass

            # 3. Use LLM to analyze and suggest agents
            prompt = f"""
Analyze this project structure and key file contents:

Project Path: {path_to_scan}
Files: {json.dumps(file_list[:100])} # First 100 files
Context: {json.dumps({k: v[:2000] for k, v in context_data.items()})}

Provide a professional analysis in JSON format ONLY:
{{
  "stack": "Tech stack description",
  "complexity": "Low/Medium/High with brief reason",
  "security": "Initial security observation",
  "recommendations": ["list", "of", "3-5", "technical", "recommendations"],
  "suggested_agents": ["list", "of", "agent_ids", "needed"]
}}

Available specialized agents (mapped by ID):
- frontend: Frontend Engineer (React/Vue/JS)
- backend: Backend Engineer (Node/Python/Go)
- db: Database Architect (SQL/NoSQL/Prisma)
- designer: UI/UX DesignAgent
- qa: QA & Testing Agent
- devops: DevOps & Cloud Agent
- security: Security Audit Agent
- seomarketing: SEO & Marketing Agent
- contentwriter: Documentation & Content Agent
"""
            
            response = self.llm_manager.generate_response(
                prompt=prompt,
                system_context="You are a Technical Project Architect. Analyze repositories to define the perfect agent swarm. Return JSON ONLY."
            )

            if not response:
                 self.log("⚠️ PM: LLM returned empty response for analysis")
                 return {'success': False, 'error': 'Empty LLM response'}

            # 4. Parse response and update database
            import re
            self.log(f"🕵️ DEBUG: Response type: {type(response)}, content: {str(response)[:100]}")
            json_match = re.search(r'\{.*\}', str(response), re.DOTALL)
            analysis_results = {}
            suggested_agents = []
            
            if json_match:
                try:
                    analysis_results = json.loads(json_match.group())
                    suggested_agents = analysis_results.get('suggested_agents', [])
                except Exception as e:
                    self.log(f"⚠️ PM: JSON parse failed: {str(e)}")
                    analysis_results = {"error": "Failed to parse analysis results"}

            # Fallback if empty
            if not suggested_agents:
                suggested_agents = ["frontend", "backend"]

            # Update project in DB using the new project_update tool
            self.call_mcp_tool(None, "project_update", {
                "projectId": project_id,
                "analysisResults": json.dumps(analysis_results),
                "suggestedAgents": json.dumps(suggested_agents)
            })
            
            # Since we don't have a direct "prisma update" tool easily available via CLI with JSON strings, 
            # the server will likely handle the DB update if we return it in the result
            # or we can use a custom tool if implemented.
            
            self.update_status('idle')
            return {
                'success': True,
                'result': analysis_results,
                'suggested_agents': suggested_agents,
                'message': f"Analysis complete for project {project_id}. Identified {analysis_results.get('stack')} stack."
            }

        except Exception as e:
            self.log(f"❌ Analysis failed: {str(e)}")
            self.update_status('error')
            return {'success': False, 'error': str(e)}

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
                        'parentTaskId': task_id,
                        'parent_task_id': task_id,
                        'projectId': getattr(self, 'current_project_id', None),
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
- description: Brief action (e.g., 'Implement User Auth API')
- priority: (high, medium, low)
- dependencies: Which subtasks must complete first

CRITICAL- **English/ASCII Protocol**: ALWAYS use English and plain ASCII characters for technical IDs, file names, and task descriptions. NO special characters or Portuguese names for code assets.
- **Concatenation**: Keep file names and task IDs short and professional (camelCase/PascalCase).
- **Project CRM Management**: You are now in a CRM-style system. Projects (Company X, App Y) are long-lived entities.
  - Use `/api/projects` (GET, POST, PATCH) to manage these high-level projects.
  - When creating tasks, ALWAYS associate them with the relevant `projectId` if one exists.
  - You can query tasks by `projectId` using `/api/tasks?projectId=XYZ`.
  - Maintain the project the status and roadmap as a central command center.
If a subtask involves creating a file, use brief PascalCase (e.g., UserProfile.jsx) or camelCase.
4. Keep descriptions concise and technical.
5. NO LONG SENTENCES as descriptions.

Return as JSON array with format:
[{{"type": "...", "desc": "...", "priority": "...", "dependencies": []}}]
"""
            
            try:
                response = self.llm_manager.generate_response(
                    prompt=prompt,
                    system_context="You are a technical project manager. Decompose features into clear, actionable subtasks."
                )
                
                # Try to parse JSON from response
                import re
                json_match = re.search(r'\[.*\]', str(response), re.DOTALL)
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

    # ============================================
    # Agent Collaboration & Reporting
    # ============================================
    
    def handle_message(self, message):
        """Handle incoming messages (including task completions)"""
        msg_type = message.get('type')
        
        if msg_type == 'agent_task_complete':
            return self._handle_subtask_completion(message.get('data'))
            
        return {'acknowledged': True, 'agent': self.name}

    def _handle_subtask_completion(self, data):
        """Track completion of delegated subtasks"""
        task_id = data.get('taskId')
        parent_id = data.get('parentTaskId')
        agent_name = data.get('agentName')
        
        self.log(f"🏁 PM: Received completion for subtask {task_id} from {agent_name}")
        
        # Find the orchestration this task belongs to
        # In this implementation, we might use parent_id as the orchestration_id
        for orch_id, orch in self.active_orchestrations.items():
            if orch_id == parent_id:
                # Update subtask status
                finished_count = 0
                for delegation in orch['delegations']:
                    if delegation['subtask_id'] == task_id or delegation['delegation'].get('id') == task_id:
                        delegation['status'] = 'completed'
                        delegation['result'] = data.get('result')
                    
                    if delegation.get('status') == 'completed':
                        finished_count += 1
                
                self.log(f"📊 Orchestration '{orch['title']}': {finished_count}/{len(orch['delegations'])} completed")
                
                # Check if all done
                if finished_count == len(orch['delegations']) and orch['status'] != 'reporting':
                    orch['status'] = 'reporting'
                    self.log(f"✅ PM: All subtasks for '{orch['title']}' completed! Generating final report...")
                    self.generate_orchestration_report(orch_id)
                
                break
        
        return {'success': True}

    def generate_orchestration_report(self, orch_id):
        """Generate a final report for the user after orchestration is complete"""
        orch = self.active_orchestrations.get(orch_id)
        if not orch: return

        title = orch['title']
        results = []
        for d in orch['delegations']:
            results.append(f"Agent {d['agent']}: {d.get('result', {}).get('message', 'Concluído')}")

        results_str = "\n".join(results)
        prompt = f"""
Gera um relatório final detalhado para o utilizador sobre a conclusão da funcionalidade: '{title}'.
O trabalho foi decomposto e executado por vários agentes.

Resultados por agente:
{results_str}

O relatório deve:
1. Começar com um tom profissional e de sucesso.
2. Resumir o que foi feito de forma clara (em Português).
3. Listar as componentes principais que foram implementadas.
4. Mostrar entusiasmo pelo resultado.
5. Terminar com opções de 'Próximos Passos' ou 'Ver Ficheiros'.

Formata como uma resposta de chat estruturada.
"""
        try:
            # We use handleChatMessage with a special prompt to simulate the report
            # but since we want it to be proactive, we send it via bridge as a new agent message
            report_data = self.handleChatMessage(f"Relatório final para {title}: {prompt}")
            
            # Send as a proactive message to the chat
            self.send_to_bridge({
                'type': 'agent_message',
                'content': report_data
            })
            
            orch['status'] = 'completed'
            self.log(f"📝 PM: Final report for '{title}' sent to user.")
            
        except Exception as e:
            self.log(f"⚠️ Failed to generate report: {str(e)}")

    def _get_system_context(self) -> str:
        return """You are an enhanced Project Manager AI with autonomous orchestration capabilities.
You can decompose complex features, delegate to specialized agents, and coordinate implementation.
Be professional, concise, and proactive. Respond in the user's language."""

    def handleChatMessage(self, user_message: str, history=None, task_id: str = None, project_id: str = None) -> dict:
        """Handle chat with interactive selection support"""
        msg = user_message.lower()
        
        # 1. Handle selection confirmation from user
        if user_message.startswith("Confirmado:"):
            self.log(f"PM: User confirmed selection: {user_message[11:100]}...")
            
            # Extract what was confirmed for context
            confirmed_details = user_message[11:]
            
            # Start the feature orchestration process
            # We use the recent history to understand the original feature if possible
            feature_title = "Feature from Chat"
            feature_desc = confirmed_details
            
            if history:
                # Look for the last user message before the interactive options (which would be the 3rd last message roughly)
                # history order: [..., user_feature_request, assistant_options_prompt, user_confirmation]
                for h in reversed(history):
                    if h.get('fromId') == 'user' and not h.get('content', '').startswith("Confirmado:"):
                        feature_title = h.get('content', '').split('\n')[0][:50]
                        feature_desc = h.get('content', '') + "\n\nConfirmed details:\n" + confirmed_details
                        break
            
            # Trigger the orchestration
            orchestration_id = task_id or f"chat-{int(self._get_timestamp().split('T')[1].replace(':', '').split('.')[0])}"
            orchestration_result = self.orchestrate_feature_implementation({
                'id': orchestration_id,
                'title': feature_title,
                'description': feature_desc,
                'type': 'feature'
            })
            
            # Return a response that acknowledges the start of work
            return self.send_interactive_list(
                text=f"Excelente! Já dei início à implementação da feature: **{feature_title}**.\n\nDecompus o trabalho em {orchestration_result.get('subtasks', 0)} tarefas e deleguei para {orchestration_result.get('agents_assigned', 0)} agentes especializados. Podes acompanhar o progresso no painel de Tarefas.",
                title="Ações em curso:",
                items=[
                    "Monitorizar progresso dos agentes",
                    "Pedir relatório de estado",
                    "Interromper implementação",
                    "Adicionar mais requisitos"
                ]
            )

        # 2. Task deletion
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

        # General conversation now handled by super().handleChatMessage 
        # which now universally provides interactive lists.
        return super().handleChatMessage(user_message, history, task_id, project_id)

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
