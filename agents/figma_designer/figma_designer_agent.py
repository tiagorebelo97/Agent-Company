"""
Figma Designer Agent implementation.

This agent is responsible for designing applications and UI/UX mockups on Figma.
Uses the Figma MCP server for communication with Figma.
"""

import sys
from pathlib import Path

# Add parent directories to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from shared.base_agent import BaseAgent
from shared.config_loader import get_agent_config
from shared.figma_mcp_client import FigmaMCPClientSync
from typing import Dict, Any, Optional


class FigmaDesignerAgent(BaseAgent):
    """
    Agent that designs applications and UI/UX mockups on Figma.
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize the Figma Designer Agent.
        
        Args:
            config: Configuration dictionary. If None, loads from config file.
        """
        if config is None:
            config = get_agent_config("figma_designer")
        
        super().__init__(
            name="Figma Designer",
            config=config
        )
        
        # MCP server configuration
        mcp_config = self.config.get("config", {})
        self.ws_url = mcp_config.get("ws_url", "ws://localhost:3055")
        self.channel = mcp_config.get("channel")
        self.mcp_client: Optional[FigmaMCPClientSync] = None
        self._connected = False
        
        # Legacy API key (kept for compatibility, but MCP doesn't require it)
        self.api_key = mcp_config.get("api_key")
        
        # Initialize MCP client
        self._init_mcp_client()
    
    def _init_mcp_client(self):
        """Initialize the MCP client connection."""
        try:
            self.mcp_client = FigmaMCPClientSync(
                ws_url=self.ws_url,
                channel=self.channel
            )
            self.logger.info("MCP client initialized")
        except Exception as e:
            self.logger.error(f"Failed to initialize MCP client: {e}")
            self.mcp_client = None
    
    def _ensure_connected(self) -> bool:
        """
        Ensure connection to MCP server is established.
        
        Returns:
            True if connected, False otherwise
        """
        if not self.mcp_client:
            self.logger.error("MCP client not initialized")
            return False
        
        if not self.mcp_client.is_connected():
            try:
                if self.mcp_client.connect():
                    self._connected = True
                    self.logger.info("Connected to Figma MCP server")
                    
                    # Join channel if specified
                    if self.channel and not self.mcp_client.client.channel:
                        if self.mcp_client.join_channel(self.channel):
                            self.logger.info(f"Joined channel: {self.channel}")
                        else:
                            self.logger.warning(f"Failed to join channel: {self.channel}")
                    
                    return True
                else:
                    self.logger.error("Failed to connect to MCP server")
                    return False
            except Exception as e:
                self.logger.error(f"Error connecting to MCP server: {e}")
                return False
        
        return True
    
    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a design task.
        
        Args:
            task: Task description containing:
                - action: Action to perform (e.g., "create_design", "update_design")
                - parameters: Task-specific parameters
                
        Returns:
            Result dictionary with status and output
        """
        action = task.get("action", "unknown")
        parameters = task.get("parameters", {})
        
        self.logger.info(f"Executing action: {action}")
        
        # Ensure connection before executing
        if not self._ensure_connected():
            return {
                "status": "error",
                "message": "Not connected to Figma MCP server. Make sure the WebSocket server is running (bun socket) and the Figma plugin is connected."
            }
        
        # Map actions to methods
        action_map = {
            "create_design": self._create_design,
            "update_design": self._update_design,
            "get_design": self._get_design,
            "get_document_info": self._get_document_info,
            "get_selection": self._get_selection,
            "create_rectangle": self._create_rectangle,
            "create_frame": self._create_frame,
            "create_text": self._create_text,
            "set_fill_color": self._set_fill_color,
            "set_stroke_color": self._set_stroke_color,
            "mcp_command": self._mcp_command,  # Generic MCP command passthrough
        }
        
        handler = action_map.get(action)
        if handler:
            return handler(parameters)
        else:
            return {
                "status": "error",
                "message": f"Unknown action: {action}. Available actions: {list(action_map.keys())}"
            }
    
    def _create_design(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new design in Figma.
        
        Args:
            parameters: Design parameters including:
                - name: Name of the design
                - description: Design description
                - components: List of components to include
                - width: Frame width (default: 1440)
                - height: Frame height (default: 1024)
                
        Returns:
            Result dictionary
        """
        try:
            name = parameters.get("name", "Untitled Design")
            width = parameters.get("width", 1440)
            height = parameters.get("height", 1024)
            
            self.logger.info(f"Creating design frame: {name}")
            
            # Create a frame as the main design container
            result = self.mcp_client.send_command(
                "create_frame",
                {
                    "x": 0,
                    "y": 0,
                    "width": width,
                    "height": height,
                    "name": name
                }
            )
            
            return {
                "status": "success",
                "message": f"Design '{name}' created successfully",
                "frame_id": result.get("id") if isinstance(result, dict) else str(result),
                "result": result
            }
        except Exception as e:
            self.logger.error(f"Error creating design: {e}")
            return {
                "status": "error",
                "message": f"Failed to create design: {str(e)}"
            }
    
    def _update_design(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing design in Figma.
        
        Args:
            parameters: Update parameters including:
                - node_id: ID of the node to update
                - updates: Dictionary of updates to apply
                
        Returns:
            Result dictionary
        """
        try:
            node_id = parameters.get("node_id")
            updates = parameters.get("updates", {})
            
            if not node_id:
                return {
                    "status": "error",
                    "message": "node_id is required"
                }
            
            self.logger.info(f"Updating node: {node_id}")
            
            # Apply updates based on what's provided
            results = []
            for key, value in updates.items():
                if key == "fill_color":
                    result = self.mcp_client.send_command("set_fill_color", {
                        "nodeId": node_id,
                        "color": value
                    })
                    results.append({"action": "set_fill_color", "result": result})
                elif key == "stroke_color":
                    result = self.mcp_client.send_command("set_stroke_color", {
                        "nodeId": node_id,
                        "color": value
                    })
                    results.append({"action": "set_stroke_color", "result": result})
                # Add more update types as needed
            
            return {
                "status": "success",
                "message": "Design updated successfully",
                "node_id": node_id,
                "updates": results
            }
        except Exception as e:
            self.logger.error(f"Error updating design: {e}")
            return {
                "status": "error",
                "message": f"Failed to update design: {str(e)}"
            }
    
    def _get_design(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get information about an existing design.
        
        Args:
            parameters: Parameters including:
                - node_id: ID of the node to retrieve (optional, uses selection if not provided)
                
        Returns:
            Result dictionary with design information
        """
        try:
            node_id = parameters.get("node_id")
            
            if node_id:
                self.logger.info(f"Retrieving node info: {node_id}")
                result = self.mcp_client.send_command("get_node_info", {"nodeId": node_id})
            else:
                self.logger.info("Retrieving current selection")
                result = self.mcp_client.send_command("get_selection")
            
            return {
                "status": "success",
                "design_data": result
            }
        except Exception as e:
            self.logger.error(f"Error retrieving design: {e}")
            return {
                "status": "error",
                "message": f"Failed to retrieve design: {str(e)}"
            }
    
    def _get_document_info(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Get document information."""
        try:
            result = self.mcp_client.send_command("get_document_info")
            return {
                "status": "success",
                "document_info": result
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    def _get_selection(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Get current selection."""
        try:
            result = self.mcp_client.send_command("get_selection")
            return {
                "status": "success",
                "selection": result
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    def _create_rectangle(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Create a rectangle."""
        try:
            result = self.mcp_client.send_command("create_rectangle", parameters)
            return {
                "status": "success",
                "result": result
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    def _create_frame(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Create a frame."""
        try:
            result = self.mcp_client.send_command("create_frame", parameters)
            return {
                "status": "success",
                "result": result
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    def _create_text(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Create text element."""
        try:
            result = self.mcp_client.send_command("create_text", parameters)
            return {
                "status": "success",
                "result": result
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    def _set_fill_color(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Set fill color."""
        try:
            result = self.mcp_client.send_command("set_fill_color", parameters)
            return {
                "status": "success",
                "result": result
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    def _set_stroke_color(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Set stroke color."""
        try:
            result = self.mcp_client.send_command("set_stroke_color", parameters)
            return {
                "status": "success",
                "result": result
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    def _mcp_command(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generic MCP command passthrough.
        
        Args:
            parameters:
                - command: MCP command name
                - params: Command parameters
        """
        try:
            command = parameters.get("command")
            params = parameters.get("params", {})
            
            if not command:
                return {
                    "status": "error",
                    "message": "command is required"
                }
            
            result = self.mcp_client.send_command(command, params)
            return {
                "status": "success",
                "result": result
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    def get_capabilities(self) -> Dict[str, Any]:
        """
        Get the capabilities of this agent.
        
        Returns:
            Dictionary describing agent capabilities
        """
        return {
            "name": self.name,
            "description": "Designs applications and UI/UX mockups on Figma using MCP server",
            "actions": [
                "create_design",
                "update_design",
                "get_design",
                "get_document_info",
                "get_selection",
                "create_rectangle",
                "create_frame",
                "create_text",
                "set_fill_color",
                "set_stroke_color",
                "mcp_command"  # Generic passthrough for any MCP command
            ],
            "supported_formats": ["figma"],
            "mcp_configured": self.mcp_client is not None,
            "mcp_connected": self._connected or (self.mcp_client and self.mcp_client.is_connected())
        }
    
    def validate_config(self) -> bool:
        """
        Validate agent configuration.
        
        Returns:
            True if configuration is valid
        """
        # MCP doesn't require API key, but we check if client is initialized
        if not self.mcp_client:
            self.logger.warning("MCP client not initialized - some features may not work")
            return False
        
        return True
    
    def __del__(self):
        """Cleanup on deletion."""
        if self.mcp_client:
            try:
                self.mcp_client.disconnect()
            except:
                pass


if __name__ == "__main__":
    # Example usage
    agent = FigmaDesignerAgent()
    print(f"Agent: {agent}")
    print(f"Capabilities: {agent.get_capabilities()}")
    
    # Example task
    task = {
        "action": "create_design",
        "parameters": {
            "name": "My App Design",
            "description": "A beautiful app design",
            "components": ["header", "navigation", "content"]
        }
    }
    
    result = agent.execute(task)
    print(f"Result: {result}")
