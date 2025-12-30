"""
Configuration loader for Agent Company project.
"""

import yaml
import os
from pathlib import Path
from typing import Dict, Any, Optional
from dotenv import load_dotenv


def load_config(config_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Load configuration from YAML file.
    
    Args:
        config_path: Path to config file. Defaults to config/agents.yaml
        
    Returns:
        Configuration dictionary
    """
    if config_path is None:
        config_path = Path(__file__).parent.parent / "config" / "agents.yaml"
    
    # Load environment variables
    load_dotenv()
    
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    # Replace environment variable placeholders
    config = _replace_env_vars(config)
    
    return config


def _replace_env_vars(obj: Any) -> Any:
    """
    Recursively replace environment variable placeholders in config.
    
    Args:
        obj: Configuration object (dict, list, or str)
        
    Returns:
        Object with environment variables replaced
    """
    if isinstance(obj, dict):
        return {k: _replace_env_vars(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_replace_env_vars(item) for item in obj]
    elif isinstance(obj, str) and obj.startswith("${") and obj.endswith("}"):
        env_var = obj[2:-1]
        return os.getenv(env_var, obj)
    else:
        return obj


def get_agent_config(agent_name: str, config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Get configuration for a specific agent.
    
    Args:
        agent_name: Name of the agent
        config: Full configuration dict. If None, loads from file.
        
    Returns:
        Agent-specific configuration
    """
    if config is None:
        config = load_config()
    
    agents = config.get("agents", {})
    return agents.get(agent_name, {})
