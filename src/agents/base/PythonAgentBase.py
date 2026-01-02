"""
PythonAgentBase - Base class for all Python agents

Provides:
- File system access via Node.js bridge
- Task execution framework
- Communication with Node.js via JSON-RPC
- Status updates and logging
"""

import sys
import json
from typing import Dict, Any, Optional, List

class PythonAgentBase:
    """Base class for all Python agents with file system and task execution"""
    
    def __init__(self, agent_id: str, name: str):
        self.agent_id = agent_id
        self.name = name
        self.status = "idle"
        self._pending_requests = {}
        self._request_counter = 0
    
    # ============================================
    # File System Operations (via Node.js bridge)
    # ============================================
    
    def read_file(self, file_path: str) -> str:
        """Read file via AgentFileSystem"""
        response = self._call_node_tool('file_system_read', {
            'agentId': self.agent_id,
            'filePath': file_path
        })
        return response.get('content', '') if response else ''
    
    def write_file(self, file_path: str, content: str) -> Dict[str, Any]:
        """Write file via AgentFileSystem (creates backup automatically)"""
        result = self._call_node_tool('file_system_write', {
            'agentId': self.agent_id,
            'filePath': file_path,
            'content': content
        })
        return result if result else {'success': False}
    
    def list_files(self, dir_path: str) -> List[Dict]:
        """List files in directory"""
        response = self._call_node_tool('file_system_list', {
            'agentId': self.agent_id,
            'dirPath': dir_path
        })
        return response.get('files', []) if response else []
    
    # ============================================
    # Task Execution
    # ============================================
    
    def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main task execution method - override in subclasses
        
        Args:
            task: Task object with description, requirements, etc.
        
        Returns:
            {
                'success': bool,
                'result': Any,
                'files_modified': List[str],
                'message': str
            }
        """
        raise NotImplementedError("Subclasses must implement execute_task")
    
    # ============================================
    # Communication with Node.js
    # ============================================
    
    def _call_node_tool(self, tool_name: str, args: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Call a Node.js tool via JSON-RPC
        
        Note: This is a simplified synchronous version.
        In production, should use async or proper request/response matching.
        """
        request_id = self._request_counter
        self._request_counter += 1
        
        message = {
            'type': 'tool_call',
            'toolName': tool_name,
            'args': args,
            'requestId': request_id
        }
        
        # Send to Node.js via stdout
        self._send_to_node(message)
        
        # For now, return success placeholder
        # In real implementation, would wait for response
        return {'success': True}
    
    def _send_to_node(self, message: Dict[str, Any]):
        """Send message to Node.js via stdout"""
        print(json.dumps(message), flush=True)
    
    def update_status(self, status: str):
        """Update agent status"""
        self.status = status
        self._send_to_node({
            'type': 'status_update',
            'status': status
        })
    
    def update_progress(self, progress: int, activity: str = ''):
        """
        Update task progress (0-100%)
        
        Args:
            progress: Progress percentage (0-100)
            activity: Current activity description
        """
        self._send_to_node({
            'type': 'progress_update',
            'progress': min(100, max(0, progress)),  # Clamp to 0-100
            'activity': activity
        })
    
    def log_activity(self, message: str):
        """
        Log activity for task tracking
        
        Args:
            message: Activity message to log
        """
        import time
        self._send_to_node({
            'type': 'activity_log',
            'message': message,
            'timestamp': time.time()
        })
    
    def log(self, message: str):
        """Log message to Node.js"""
        self._send_to_node({
            'type': 'log',
            'content': f"[{self.name}] {message}"
        })
    
    # ============================================
    # Main Loop
    # ============================================
    
    def run(self):
        """Main execution loop - listen for messages from Node.js"""
        self.log(f"{self.name} started and ready")
        
        for line in sys.stdin:
            try:
                message = json.loads(line.strip())
                self._handle_message(message)
            except json.JSONDecodeError:
                # Not JSON, might be a log line
                continue
            except Exception as e:
                self.log(f"Error processing message: {str(e)}")
    
    def _handle_message(self, message: Dict[str, Any]):
        """Handle incoming message from Node.js"""
        msg_type = message.get('type')
        
        if msg_type == 'execute_task':
            task = message.get('task', {})
            request_id = message.get('requestId')
            
            try:
                result = self.execute_task(task)
                
                # Send response back to Node.js
                self._send_to_node({
                    'type': 'response',
                    'requestId': request_id,
                    'result': result
                })
            except Exception as e:
                self.log(f"Task execution failed: {str(e)}")
                self._send_to_node({
                    'type': 'response',
                    'requestId': request_id,
                    'result': {
                        'success': False,
                        'message': f'Error: {str(e)}'
                    }
                })
        
        elif msg_type == 'tool_response':
            # Handle response from Node.js tool call
            request_id = message.get('requestId')
            result = message.get('result')
            # Store for future async implementation
            self._pending_requests[request_id] = result
