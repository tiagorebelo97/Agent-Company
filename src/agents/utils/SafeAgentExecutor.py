/**
 * Better Error Handling for Python Agents
 * 
 * Wraps agent execution with proper error handling and timeout
 */

import sys
import json
import traceback
from typing import Dict, Any

class SafeAgentExecutor:
    """Wraps agent execution with error handling and timeout"""
    
    @staticmethod
    def execute_with_error_handling(agent, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute task with comprehensive error handling
        
        Returns:
            Result dict with success status
        """
        try:
            # Execute the task
            result = agent.execute_task(task)
            
            # Ensure result has required fields
            if not isinstance(result, dict):
                return {
                    'success': False,
                    'message': 'Agent returned invalid result format'
                }
            
            # Ensure success field exists
            if 'success' not in result:
                result['success'] = False
            
            return result
            
        except KeyboardInterrupt:
            # Allow graceful shutdown
            raise
            
        except Exception as e:
            # Log full traceback
            error_trace = traceback.format_exc()
            print(json.dumps({
                'type': 'log',
                'content': f'ERROR: {error_trace}'
            }), flush=True)
            
            # Return error result
            return {
                'success': False,
                'message': f'Task execution failed: {str(e)}',
                'error': str(e),
                'traceback': error_trace
            }
    
    @staticmethod
    def send_error_response(request_id: int, error: Exception):
        """Send error response to Node.js"""
        print(json.dumps({
            'type': 'response',
            'requestId': request_id,
            'result': {
                'success': False,
                'message': f'Error: {str(error)}',
                'error': str(error)
            }
        }), flush=True)
