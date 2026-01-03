import sys
import json
import logging
import threading
from abc import ABC, abstractmethod

# Configure basic logging to stderr so it doesn't interfere with stdout JSON
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s', stream=sys.stderr)
logger = logging.getLogger(__name__)

class PythonBaseAgent(ABC):
    """
    Base class for Python-implemented agents.
    Handles JSON-RPC communication with the Node.js bridge via StdIn/StdOut.
    """
    def __init__(self, agent_id, name):
        self.agent_id = agent_id
        self.name = name
        self.pending_tool_calls = {}
        self.request_id_counter = 0

    def run(self):
        """Main loop to read from stdin and process commands"""
        logger.info(f"Python agent {self.name} started and waiting for commands.")
        
        # Start input listener in a separate thread to allow blocking tool calls
        import threading
        self.input_thread = threading.Thread(target=self._input_listener, daemon=True)
        self.input_thread.start()
        
        # Keep main thread alive
        try:
            while self.input_thread.is_alive():
                self.input_thread.join(1.0)
        except KeyboardInterrupt:
            logger.info("Agent stopping...")

    def _input_listener(self):
        """Reads stdin in a separate thread"""
        for line in sys.stdin:
            try:
                line = line.strip()
                if not line: continue
                message = json.loads(line)
                self._handle_bridge_message(message)
            except json.JSONDecodeError:
                logger.error(f"Failed to decode message: {line}")
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")

    def _handle_bridge_message(self, message):
        msg_type = message.get('type')
        request_id = message.get('requestId')

        if msg_type == 'execute_task':
            task = message.get('task')
            # Execute task in a thread to not block input
            executor_thread = threading.Thread(
                target=self._on_execute_task, 
                args=(request_id, task)
            )
            executor_thread.start()
            
        elif msg_type == 'handle_message':
            agent_message = message.get('message')
            executor_thread = threading.Thread(
                target=self._on_handle_message, 
                args=(request_id, agent_message)
            )
            executor_thread.start()
            
        elif msg_type == 'tool_response':
            self._on_tool_response(request_id, message)
        else:
            logger.warning(f"Unknown message type from bridge: {msg_type}")

    def _on_execute_task(self, request_id, task):
        try:
            logger.info(f"Executing task: {task.get('description')}")
            result = self.execute_task(task)
            self.send_to_bridge({
                'type': 'response',
                'requestId': request_id,
                'result': result
            })
        except Exception as e:
            logger.error(f"Task execution failed: {str(e)}")
            self.send_to_bridge({
                'type': 'response',
                'requestId': request_id,
                'error': str(e)
            })

    def _on_handle_message(self, request_id, message):
        try:
            result = self.handle_message(message)
            self.send_to_bridge({
                'type': 'response',
                'requestId': request_id,
                'result': result
            })
        except Exception as e:
            self.send_to_bridge({
                'type': 'response',
                'requestId': request_id,
                'error': str(e)
            })

    def call_mcp_tool(self, mcp_name, tool_name, args=None):
        """Call an MCP tool via the Node.js bridge (Synchronous from caller perspective)"""
        request_id = self.request_id_counter
        self.request_id_counter += 1
        
        # Create a condition variable to wait on
        import threading
        condition = threading.Condition()
        future = {'ready': False, 'result': None, 'error': None, 'condition': condition}
        
        # Use a lock to safely modify pending_tool_calls
        # (Assuming simple GIL protection is enough for dict ops, but explicit is better if complex)
        self.pending_tool_calls[request_id] = future
        
        self.send_to_bridge({
            'type': 'tool_call',
            'requestId': request_id,
            'mcpName': mcp_name,
            'toolName': tool_name,
            'args': args or {}
        })
        
        # Wait for response
        with condition:
            # 60s timeout
            if not condition.wait(60):
                del self.pending_tool_calls[request_id]
                raise TimeoutError(f"Tool call {mcp_name}.{tool_name} timed out")
            
        if future['error']:
            raise Exception(future['error'])
        return future['result']
        
    def _on_tool_response(self, request_id, message):
        if request_id in self.pending_tool_calls:
            future = self.pending_tool_calls.pop(request_id)
            
            with future['condition']:
                if 'error' in message:
                    future['error'] = message['error']
                else:
                    future['result'] = message['result']
                future['ready'] = True
                future['condition'].notify()

    def send_to_bridge(self, message):
        """Send JSON message to Node.js bridge via stdout"""
        sys.stdout.write(json.dumps(message) + '\n')
        sys.stdout.flush()

    def log(self, content):
        """Send log message to Node.js logger"""
        self.send_to_bridge({
            'type': 'log',
            'content': content
        })

    def update_status(self, status):
        """Update agent status (e.g., 'thinking', 'busy', 'idle')"""
        self.send_to_bridge({
            'type': 'status_update',
            'status': status
        })

    @abstractmethod
    def execute_task(self, task):
        """To be implemented by subclasses"""
        pass

    @abstractmethod
    def handle_message(self, message):
        """To be implemented by subclasses"""
        pass

    # ============================================
    # Project File Access Methods (Real Files)
    # ============================================
    
    def read_project_file(self, file_path):
        """Read a file from the actual project (not sandboxed)"""
        return self.call_mcp_tool(None, 'project_read_file', {'filePath': file_path})
    
    def write_project_file(self, file_path, content):
        """Write a file to the actual project (not sandboxed)"""
        return self.call_mcp_tool(None, 'project_write_file', {
            'filePath': file_path,
            'content': content
        })
    
    def list_project_files(self, dir_path):
        """List files in a project directory"""
        return self.call_mcp_tool(None, 'project_list_files', {'dirPath': dir_path})
    
    def run_command(self, command, cwd=None):
        """Execute a shell command with safety controls"""
        return self.call_mcp_tool(None, 'run_command', {
            'command': command,
            'cwd': cwd or '.'
        })

    # ============================================
    # Code Generation Methods
    # ============================================
    
    def generate_react_component(self, name, description, props=None, features=None):
        """Generate a React component using EnhancedCodeGenerator"""
        try:
            from utils.EnhancedCodeGenerator import EnhancedCodeGenerator
            generator = EnhancedCodeGenerator()
            return generator.generate_react_component(name, description, props, features)
        except Exception as e:
            self.log(f"Component generation failed: {str(e)}")
            return None
    
    def generate_api_endpoint(self, method, path, description, request_body=None, response=None):
        """Generate an Express.js API endpoint"""
        try:
            from utils.EnhancedCodeGenerator import EnhancedCodeGenerator
            generator = EnhancedCodeGenerator()
            return generator.generate_api_endpoint(method, path, description, request_body, response)
        except Exception as e:
            self.log(f"Endpoint generation failed: {str(e)}")
            return None
    
    # ============================================
    # Agent Collaboration Methods
    # ============================================
    
    def request_work_from(self, agent_id, task_spec, priority="medium"):
        """Request work from another agent"""
        from core.AgentProtocol import AgentProtocol
        message = AgentProtocol.request_work(
            from_agent_id=self.agent_id,
            to_agent_id=agent_id,
            task_spec=task_spec,
            priority=priority
        )
        # Send via bridge (will be routed to target agent)
        self.send_to_bridge({
            'type': 'assign_task',
            'targetAgent': agent_id,
            'task': task_spec
        })
        return message
    
    def submit_work_to(self, agent_id, request_id, deliverable, tests_passed=True):
        """Submit completed work to requesting agent"""
        from core.AgentProtocol import AgentProtocol
        message = AgentProtocol.submit_work(
            from_agent_id=self.agent_id,
            to_agent_id=agent_id,
            request_id=request_id,
            deliverable=deliverable,
            tests_passed=tests_passed
        )
        self.send_to_bridge(message)
        return message
    
    def request_review_from(self, agent_id, code, files):
        """Request code review from another agent"""
        from core.AgentProtocol import AgentProtocol
        message = AgentProtocol.request_review(
            from_agent_id=self.agent_id,
            to_agent_id=agent_id,
            code=code,
            files=files
        )
        self.send_to_bridge(message)
        return message

    # ============================================
    # Verification & Testing Methods
    # ============================================
    
    def verify_component(self, component_path):
        """Verify a React component for errors and best practices"""
        try:
            from utils.AgentVerifier import AgentVerifier
            verifier = AgentVerifier()
            return verifier.verify_react_component(component_path)
        except Exception as e:
            self.log(f"Component verification failed: {str(e)}")
            return {'valid': False, 'error': str(e)}
    
    def verify_endpoint(self, url, method="GET"):
        """Test if an API endpoint works"""
        try:
            from utils.AgentVerifier import AgentVerifier
            verifier = AgentVerifier()
            return verifier.verify_api_endpoint(url, method)
        except Exception as e:
            self.log(f"Endpoint verification failed: {str(e)}")
            return {'working': False, 'error': str(e)}
    
    def run_tests(self, test_pattern=None):
        """Run automated tests"""
        try:
            from utils.AgentVerifier import AgentVerifier
            verifier = AgentVerifier()
            return verifier.run_tests(test_pattern)
        except Exception as e:
            self.log(f"Test execution failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # ============================================
    # Learning & Memory Methods
    # ============================================
    
    def _get_memory(self):
        """Get or create agent memory"""
        if not hasattr(self, '_memory'):
            from core.AgentMemory import AgentMemory
            self._memory = AgentMemory(self.agent_id)
        return self._memory
    
    def remember_success(self, task_type, description, approach, outcome, duration=None):
        """Record a successful task completion for learning"""
        memory = self._get_memory()
        memory.record_success(task_type, description, approach, outcome, duration)
        self.log(f"Recorded success: {task_type}")
    
    def remember_failure(self, task_type, description, approach, error, lessons=None):
        """Record a failed attempt to learn from it"""
        memory = self._get_memory()
        memory.record_failure(task_type, description, approach, error, lessons)
        self.log(f"Recorded failure: {task_type} - {error}")
    
    def learn_best_practice(self, category, practice, context=None):
        """Store a discovered best practice"""
        memory = self._get_memory()
        memory.add_best_practice(category, practice, context)
    
    def recall_best_approach(self, task_type, similar_to=None):
        """Retrieve the best known approach for a task"""
        memory = self._get_memory()
        return memory.get_best_approach(task_type, similar_to)
    
    def get_my_stats(self):
        """Get performance statistics"""
        memory = self._get_memory()
        return memory.get_stats()
