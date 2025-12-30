"""
Base agent class that all agents should inherit from.
"""

from abc import ABC, abstractmethod
import logging
from typing import Dict, Any, Optional


class BaseAgent(ABC):
    """Base class for all agents in the Agent Company project."""
    
    def __init__(self, name: str, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the base agent.
        
        Args:
            name: Name of the agent
            config: Configuration dictionary for the agent
        """
        self.name = name
        self.config = config or {}
        self.logger = logging.getLogger(f"agent.{name}")
        self.logger.setLevel(logging.INFO)
        
    @abstractmethod
    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a task. Must be implemented by each agent.
        
        Args:
            task: Task description and parameters
            
        Returns:
            Result of the task execution
        """
        pass
    
    @abstractmethod
    def get_capabilities(self) -> Dict[str, Any]:
        """
        Get the capabilities of this agent.
        
        Returns:
            Dictionary describing agent capabilities
        """
        pass
    
    def validate_config(self) -> bool:
        """
        Validate agent configuration.
        
        Returns:
            True if configuration is valid
        """
        return True
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(name='{self.name}')"
