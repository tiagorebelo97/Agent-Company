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
