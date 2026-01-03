"""
AgentMemory - Learning and improvement system for agents

Stores successes and failures, enabling agents to learn from experience
and improve their approaches over time.
"""

import os
import sys
import json
from datetime import datetime
from typing import Dict, List, Optional

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


class AgentMemory:
    """
    Persistent memory system for agent learning
    
    Stores:
    - Successful approaches for different task types
    - Failed approaches and why they failed
    - Performance metrics
    - Best practices discovered
    """
    
    def __init__(self, agent_id: str, memory_file: str = None):
        self.agent_id = agent_id
        self.memory_file = memory_file or f".agent_memory_{agent_id}.json"
        self.memory = self._load_memory()
    
    def _load_memory(self) -> Dict:
        """Load memory from file"""
        if os.path.exists(self.memory_file):
            try:
                with open(self.memory_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Failed to load memory: {e}", file=sys.stderr)
        
        return {
            'successes': [],
            'failures': [],
            'best_practices': [],
            'performance_stats': {
                'total_tasks': 0,
                'successful_tasks': 0,
                'failed_tasks': 0,
                'average_duration': 0
            }
        }
    
    def _save_memory(self):
        """Save memory to file"""
        try:
            with open(self.memory_file, 'w', encoding='utf-8') as f:
                json.dump(self.memory, f, indent=2)
        except Exception as e:
            print(f"Failed to save memory: {e}", file=sys.stderr)
    
    def record_success(
        self,
        task_type: str,
        task_description: str,
        approach: str,
        outcome: Dict,
        duration: float = None
    ):
        """
        Record a successful task completion
        
        Args:
            task_type: Type of task (e.g., "react_component", "api_endpoint")
            task_description: Description of what was done
            approach: The approach/strategy used
            outcome: Results achieved
            duration: Time taken in seconds
        """
        success_record = {
            'timestamp': datetime.utcnow().isoformat(),
            'task_type': task_type,
            'description': task_description,
            'approach': approach,
            'outcome': outcome,
            'duration': duration
        }
        
        self.memory['successes'].append(success_record)
        
        # Update stats
        stats = self.memory['performance_stats']
        stats['total_tasks'] += 1
        stats['successful_tasks'] += 1
        
        if duration:
            n = stats['successful_tasks']
            stats['average_duration'] = (
                (stats['average_duration'] * (n - 1) + duration) / n
            )
        
        self._save_memory()
    
    def record_failure(
        self,
        task_type: str,
        task_description: str,
        approach: str,
        error: str,
        lessons_learned: Optional[str] = None
    ):
        """
        Record a failed task attempt
        
        Args:
            task_type: Type of task
            task_description: What was attempted
            approach: The approach that failed
            error: Error message or reason for failure
            lessons_learned: What was learned from this failure
        """
        failure_record = {
            'timestamp': datetime.utcnow().isoformat(),
            'task_type': task_type,
            'description': task_description,
            'approach': approach,
            'error': error,
            'lessons_learned': lessons_learned
        }
        
        self.memory['failures'].append(failure_record)
        
        # Update stats
        stats = self.memory['performance_stats']
        stats['total_tasks'] += 1
        stats['failed_tasks'] += 1
        
        self._save_memory()
    
    def add_best_practice(self, category: str, practice: str, context: str = None):
        """
        Add a discovered best practice
        
        Args:
            category: Category (e.g., "react_components", "api_design")
            practice: The best practice
            context: When/why this practice is useful
        """
        best_practice = {
            'timestamp': datetime.utcnow().isoformat(),
            'category': category,
            'practice': practice,
            'context': context
        }
        
        self.memory['best_practices'].append(best_practice)
        self._save_memory()
    
    def get_best_approach(self, task_type: str, similar_to: str = None) -> Optional[Dict]:
        """
        Retrieve the best approach for a similar task
        
        Args:
            task_type: Type of task
            similar_to: Optional description to find similar tasks
        
        Returns:
            Best approach found, or None
        """
        # Filter successes by task type
        relevant_successes = [
            s for s in self.memory['successes']
            if s['task_type'] == task_type
        ]
        
        if not relevant_successes:
            return None
        
        # If similarity search requested
        if similar_to:
            # Simple keyword matching (could be enhanced with embeddings)
            similar_to_lower = similar_to.lower()
            scored = []
            for success in relevant_successes:
                desc_lower = success['description'].lower()
                # Count matching words
                score = sum(
                    1 for word in similar_to_lower.split()
                    if word in desc_lower
                )
                if score > 0:
                    scored.append((score, success))
            
            if scored:
                # Return highest scoring
                scored.sort(reverse=True, key=lambda x: x[0])
                return scored[0][1]
        
        # Return most recent success
        return relevant_successes[-1]
    
    def get_failures_to_avoid(self, task_type: str) -> List[Dict]:
        """
        Get failed approaches to avoid for a task type
        
        Args:
            task_type: Type of task
        
        Returns:
            List of failures to learn from
        """
        return [
            f for f in self.memory['failures']
            if f['task_type'] == task_type
        ]
    
    def get_best_practices(self, category: str = None) -> List[Dict]:
        """
        Get best practices, optionally filtered by category
        
        Args:
            category: Optional category filter
        
        Returns:
            List of best practices
        """
        if category:
            return [
                bp for bp in self.memory['best_practices']
                if bp['category'] == category
            ]
        return self.memory['best_practices']
    
    def get_stats(self) -> Dict:
        """Get performance statistics"""
        stats = self.memory['performance_stats'].copy()
        
        if stats['total_tasks'] > 0:
            stats['success_rate'] = (
                stats['successful_tasks'] / stats['total_tasks'] * 100
            )
        else:
            stats['success_rate'] = 0
        
        return stats
    
    def clear_old_entries(self, days: int = 30):
        """
        Clear entries older than specified days
        
        Args:
            days: Number of days to keep
        """
        from datetime import timedelta
        cutoff = datetime.utcnow() - timedelta(days=days)
        cutoff_iso = cutoff.isoformat()
        
        self.memory['successes'] = [
            s for s in self.memory['successes']
            if s['timestamp'] > cutoff_iso
        ]
        
        self.memory['failures'] = [
            f for f in self.memory['failures']
            if f['timestamp'] > cutoff_iso
        ]
        
        self._save_memory()
