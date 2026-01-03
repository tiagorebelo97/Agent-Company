"""
AgentVerifier - Self-testing and verification capabilities for agents

Enables agents to test their own code, verify functionality, and ensure quality.
"""

import os
import sys
import json
import subprocess
from typing import Dict, List, Optional, Tuple

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


class AgentVerifier:
    """
    Allows agents to verify and test their own work
    """
    
    def __init__(self, project_root: str = None):
        self.project_root = project_root or os.getcwd()
    
    def verify_react_component(self, component_path: str) -> Dict[str, any]:
        """
        Verify a React component for common issues
        
        Args:
            component_path: Relative path to component file
        
        Returns:
            Verification results with errors, warnings, and suggestions
        """
        results = {
            'valid': True,
            'errors': [],
            'warnings': [],
            'suggestions': []
        }
        
        full_path = os.path.join(self.project_root, component_path)
        
        # Check if file exists
        if not os.path.exists(full_path):
            results['valid'] = False
            results['errors'].append(f"File not found: {component_path}")
            return results
        
        # Read component
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            results['valid'] = False
            results['errors'].append(f"Failed to read file: {str(e)}")
            return results
        
        # Basic checks
        if 'import React' not in content and 'from \'react\'' not in content:
            results['warnings'].append("Missing React import")
        
        if 'export default' not in content:
            results['errors'].append("Missing default export")
            results['valid'] = False
        
        if 'PropTypes' not in content and 'interface' not in content:
            results['suggestions'].append("Consider adding PropTypes or TypeScript types")
        
        # Run ESLint
        lint_result = self._run_eslint(component_path)
        if not lint_result['success']:
            results['errors'].extend(lint_result.get('errors', []))
            if lint_result.get('errors'):
                results['valid'] = False
        
        results['warnings'].extend(lint_result.get('warnings', []))
        
        return results
    
    def verify_api_endpoint(self, endpoint_url: str, method: str = "GET") -> Dict[str, any]:
        """
        Test if an API endpoint works
        
        Args:
            endpoint_url: Full URL to test (e.g., "http://localhost:3001/api/tasks")
            method: HTTP method
        
        Returns:
            Test results with status, response time, and any errors
        """
        import time
        try:
            import requests
        except ImportError:
            return {
                'working': False,
                'error': 'requests library not installed'
            }
        
        try:
            start = time.time()
            
            if method.upper() == "GET":
                response = requests.get(endpoint_url, timeout=5)
            elif method.upper() == "POST":
                response = requests.post(endpoint_url, json={}, timeout=5)
            else:
                return {'working': False, 'error': f'Unsupported method: {method}'}
            
            duration = (time.time() - start) * 1000  # ms
            
            return {
                'working': response.status_code < 500,
                'status_code': response.status_code,
                'response_time_ms': round(duration, 2),
                'response_size': len(response.content),
                'content_type': response.headers.get('Content-Type', 'unknown')
            }
        except Exception as e:
            return {
                'working': False,
                'error': str(e)
            }
    
    def run_tests(self, test_pattern: str = None) -> Dict[str, any]:
        """
        Run automated tests
        
        Args:
            test_pattern: Optional test file pattern (e.g., "TaskSubtasks.test.jsx")
        
        Returns:
            Test results
        """
        cmd = ["npm", "test"]
        if test_pattern:
            cmd.append(test_pattern)
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            return {
                'success': result.returncode == 0,
                'output': result.stdout,
                'errors': result.stderr,
                'exit_code': result.returncode
            }
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'Tests timed out after 60 seconds'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def check_imports(self, file_path: str) -> Dict[str, any]:
        """
        Verify all imports in a file can be resolved
        
        Args:
            file_path: Path to file to check
        
        Returns:
            Import verification results
        """
        full_path = os.path.join(self.project_root, file_path)
        
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            return {'valid': False, 'error': str(e)}
        
        # Extract imports (simplified)
        import re
        imports = re.findall(r'import .+ from [\'"](.+)[\'"]', content)
        
        unresolved = []
        for imp in imports:
            # Check if it's a relative import
            if imp.startswith('.'):
                import_path = os.path.join(os.path.dirname(full_path), imp)
                # Try with common extensions
                found = False
                for ext in ['', '.js', '.jsx', '.ts', '.tsx']:
                    if os.path.exists(import_path + ext):
                        found = True
                        break
                if not found:
                    unresolved.append(imp)
        
        return {
            'valid': len(unresolved) == 0,
            'total_imports': len(imports),
            'unresolved': unresolved
        }
    
    def _run_eslint(self, file_path: str) -> Dict[str, any]:
        """Run ESLint on a file"""
        try:
            result = subprocess.run(
                ["npx", "eslint", file_path, "--format", "json"],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.stdout:
                try:
                    lint_results = json.loads(result.stdout)
                    if lint_results and len(lint_results) > 0:
                        messages = lint_results[0].get('messages', [])
                        errors = [m['message'] for m in messages if m.get('severity') == 2]
                        warnings = [m['message'] for m in messages if m.get('severity') == 1]
                        
                        return {
                            'success': len(errors) == 0,
                            'errors': errors,
                            'warnings': warnings
                        }
                except json.JSONDecodeError:
                    pass
            
            return {'success': True, 'errors': [], 'warnings': []}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
