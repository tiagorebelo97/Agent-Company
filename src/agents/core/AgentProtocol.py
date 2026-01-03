"""
AgentProtocol - Standard communication protocol for agent collaboration

Defines message formats and workflows for agents to work together effectively.
"""

import json
from typing import Dict, Any, Optional, List
from datetime import datetime


class AgentProtocol:
    """
    Standard protocol for agent-to-agent communication and collaboration
    """
    
    @staticmethod
    def request_work(
        from_agent_id: str,
        to_agent_id: str,
        task_spec: Dict[str, Any],
        priority: str = "medium",
        deadline: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Request another agent to perform work
        
        Args:
            from_agent_id: ID of requesting agent
            to_agent_id: ID of target agent
            task_spec: Task specification (description, requirements, etc.)
            priority: "low", "medium", "high", "urgent"
            deadline: ISO timestamp or relative time (e.g., "2h")
        
        Returns:
            Formatted work request message
        """
        return {
            'type': 'work_request',
            'from': from_agent_id,
            'to': to_agent_id,
            'task': task_spec,
            'priority': priority,
            'deadline': deadline,
            'timestamp': datetime.utcnow().isoformat(),
            'request_id': f"{from_agent_id}_{to_agent_id}_{int(datetime.utcnow().timestamp())}"
        }
    
    @staticmethod
    def submit_work(
        from_agent_id: str,
        to_agent_id: str,
        request_id: str,
        deliverable: Dict[str, Any],
        tests_passed: bool = True,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Submit completed work back to requesting agent
        
        Args:
            from_agent_id: ID of agent submitting work
            to_agent_id: ID of agent who requested work
            request_id: Original request ID
            deliverable: The completed work (code, files, results, etc.)
            tests_passed: Whether automated tests passed
            notes: Additional notes or warnings
        
        Returns:
            Formatted work submission message
        """
        return {
            'type': 'work_submission',
            'from': from_agent_id,
            'to': to_agent_id,
            'request_id': request_id,
            'deliverable': deliverable,
            'tests_passed': tests_passed,
            'notes': notes,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def request_review(
        from_agent_id: str,
        to_agent_id: str,
        code: str,
        files: List[str],
        review_type: str = "code_review"
    ) -> Dict[str, Any]:
        """
        Request code review from another agent
        
        Args:
            from_agent_id: ID of agent requesting review
            to_agent_id: ID of reviewer agent
            code: Code to review (or file paths)
            files: List of file paths
            review_type: "code_review", "security_review", "performance_review"
        
        Returns:
            Formatted review request message
        """
        return {
            'type': 'review_request',
            'from': from_agent_id,
            'to': to_agent_id,
            'review_type': review_type,
            'code': code,
            'files': files,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def submit_review(
        from_agent_id: str,
        to_agent_id: str,
        approved: bool,
        feedback: List[Dict[str, str]],
        suggestions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Submit review feedback
        
        Args:
            from_agent_id: ID of reviewer
            to_agent_id: ID of agent who requested review
            approved: Whether the code is approved
            feedback: List of feedback items (file, line, severity, message)
            suggestions: Optional improvement suggestions
        
        Returns:
            Formatted review submission message
        """
        return {
            'type': 'review_submission',
            'from': from_agent_id,
            'to': to_agent_id,
            'approved': approved,
            'feedback': feedback,
            'suggestions': suggestions or [],
            'timestamp': datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def request_help(
        from_agent_id: str,
        to_agent_id: str,
        problem: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Request help from another agent
        
        Args:
            from_agent_id: ID of agent requesting help
            to_agent_id: ID of agent who can help
            problem: Description of the problem
            context: Relevant context (error messages, code snippets, etc.)
        
        Returns:
            Formatted help request message
        """
        return {
            'type': 'help_request',
            'from': from_agent_id,
            'to': to_agent_id,
            'problem': problem,
            'context': context,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def provide_help(
        from_agent_id: str,
        to_agent_id: str,
        solution: str,
        code_examples: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Provide help/solution to another agent
        
        Args:
            from_agent_id: ID of agent providing help
            to_agent_id: ID of agent who requested help
            solution: Solution description
            code_examples: Optional code examples
        
        Returns:
            Formatted help response message
        """
        return {
            'type': 'help_response',
            'from': from_agent_id,
            'to': to_agent_id,
            'solution': solution,
            'code_examples': code_examples or [],
            'timestamp': datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def status_update(
        from_agent_id: str,
        to_agent_id: str,
        task_id: str,
        status: str,
        progress: int,
        message: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send status update on ongoing work
        
        Args:
            from_agent_id: ID of agent sending update
            to_agent_id: ID of agent to notify
            task_id: Task ID
            status: "started", "in_progress", "blocked", "completed", "failed"
            progress: Progress percentage (0-100)
            message: Optional status message
        
        Returns:
            Formatted status update message
        """
        return {
            'type': 'status_update',
            'from': from_agent_id,
            'to': to_agent_id,
            'task_id': task_id,
            'status': status,
            'progress': progress,
            'message': message,
            'timestamp': datetime.utcnow().isoformat()
        }
