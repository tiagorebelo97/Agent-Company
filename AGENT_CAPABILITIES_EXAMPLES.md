# Example: Agent Using Enhanced Capabilities

## Scenario: Frontend Engineer Agent Implementing Subtasks Feature

```python
from core.base_agent import PythonBaseAgent

class FrontendEngineer(PythonBaseAgent):
    def __init__(self):
        super().__init__('frontend', 'Frontend Engineer')
    
    def implement_subtasks_feature(self, task):
        \"\"\"Implement the subtasks management feature\"\"\"
        
        # Step 1: Generate the React component
        self.log("Generating TaskSubtasks component...")
        
        component_code = self.generate_react_component(
            name="TaskSubtasks",
            description="Subtask management component for TaskModal",
            props={
                "taskId": "string",
                "subtasks": "array",
                "onSubtaskAdd": "function",
                "onSubtaskToggle": "function",
                "onSubtaskDelete": "function"
            },
            features=[
                "Display list of subtasks with checkboxes",
                "Add new subtask input",
                "Progress indicator (X of Y completed)",
                "Edit/delete subtask actions",
                "Keyboard navigation support"
            ]
        )
        
        # Step 2: Write the component to the project
        self.log("Writing component to file...")
        self.write_project_file(
            "apps/dashboard/src/components/TaskSubtasks.jsx",
            component_code
        )
        
        # Step 3: Request review from Code Review Agent
        self.log("Requesting code review...")
        self.request_review_from(
            agent_id="code_review",
            code=component_code,
            files=["apps/dashboard/src/components/TaskSubtasks.jsx"]
        )
        
        # Step 4: Run linter
        self.log("Running ESLint...")
        lint_result = self.run_command(
            "npm run lint apps/dashboard/src/components/TaskSubtasks.jsx"
        )
        
        if not lint_result['success']:
            self.log(f"Lint errors found: {lint_result['stderr']}")
            # Could request help from another agent here
        
        # Step 5: Update TaskModal to import and use the new component
        self.log("Reading TaskModal.jsx...")
        task_modal = self.read_project_file("apps/dashboard/src/components/TaskModal.jsx")
        
        # Add import
        updated_modal = task_modal.replace(
            "import React",
            "import React from 'react';\\nimport TaskSubtasks from './TaskSubtasks'"
        )
        
        # Add component in the modal (simplified)
        updated_modal = updated_modal.replace(
            "</div>\\n</div>",
            "  <TaskSubtasks taskId={task.id} subtasks={task.subtasks} />\\n</div>\\n</div>"
        )
        
        self.write_project_file(
            "apps/dashboard/src/components/TaskModal.jsx",
            updated_modal
        )
        
        return {
            'success': True,
            'files_created': ['TaskSubtasks.jsx'],
            'files_modified': ['TaskModal.jsx'],
            'tests_passed': lint_result['success']
        }
```

## Scenario: Project Manager Orchestrating Multiple Agents

```python
class ProjectManager(PythonBaseAgent):
    def implement_feature(self, feature_description):
        \"\"\"Orchestrate multiple agents to implement a feature\"\"\"
        
        # Step 1: Request UI design from Design Agent
        self.log("Requesting UI design...")
        design_request = self.request_work_from(
            agent_id="design",
            task_spec={
                "type": "ui_design",
                "description": feature_description,
                "deliverable": "mockup_url"
            },
            priority="high"
        )
        
        # Step 2: Request frontend implementation
        self.log("Assigning frontend work...")
        frontend_request = self.request_work_from(
            agent_id="frontend",
            task_spec={
                "type": "component_implementation",
                "description": feature_description,
                "design_ref": design_request['request_id']
            }
        )
        
        # Step 3: Request backend API if needed
        self.log("Assigning backend work...")
        backend_request = self.request_work_from(
            agent_id="backend",
            task_spec={
                "type": "api_endpoint",
                "description": f"API support for {feature_description}"
            }
        )
        
        # Step 4: Request QA testing
        self.log("Assigning QA testing...")
        qa_request = self.request_work_from(
            agent_id="qa",
            task_spec={
                "type": "feature_testing",
                "description": f"Test {feature_description}",
                "frontend_ref": frontend_request['request_id'],
                "backend_ref": backend_request['request_id']
            }
        )
        
        return {
            'success': True,
            'orchestrated': True,
            'agents_involved': ['design', 'frontend', 'backend', 'qa']
        }
```

## Scenario: Backend Agent Generating API Endpoint

```python
class BackendEngineer(PythonBaseAgent):
    def create_subtasks_api(self, task):
        \"\"\"Create API endpoints for subtasks\"\"\"
        
        # Generate POST endpoint for creating subtasks
        post_endpoint = self.generate_api_endpoint(
            method="POST",
            path="/api/tasks/:id/subtasks",
            description="Add a subtask to a task",
            request_body={
                "title": "string",
                "completed": "boolean"
            },
            response={
                "success": "boolean",
                "subtask": "object"
            }
        )
        
        # Read server.js
        server_code = self.read_project_file("src/server.js")
        
        # Find insertion point (after other task endpoints)
        insertion_point = server_code.find("// ============================================\\n// WebSocket")
        
        # Insert the new endpoint
        updated_server = (
            server_code[:insertion_point] +
            "\\n" + post_endpoint + "\\n\\n" +
            server_code[insertion_point:]
        )
        
        # Write back
        self.write_project_file("src/server.js", updated_server)
        
        # Test the endpoint
        test_result = self.run_command(
            "curl -X POST http://localhost:3001/api/tasks/test-id/subtasks -H 'Content-Type: application/json' -d '{\"title\":\"Test subtask\"}'"
        )
        
        return {
            'success': True,
            'endpoint_created': '/api/tasks/:id/subtasks',
            'tested': test_result['success']
        }
```

These examples show how agents can now:
1. Generate production-ready code
2. Read/write real project files
3. Run commands (lint, test, curl)
4. Collaborate with other agents
5. Request reviews and help
