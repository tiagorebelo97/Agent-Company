"""
Python client for communicating with the Figma MCP server via WebSocket.

This client connects to the WebSocket server (port 3055) and allows
the Python agent to interact with Figma through the MCP server.
"""

import json
import uuid
import asyncio
import logging
from typing import Dict, Any, Optional, Callable
from websockets.client import connect, WebSocketClientProtocol
from websockets.exceptions import ConnectionClosed, WebSocketException


class FigmaMCPClient:
    """
    Client for communicating with Figma via the MCP WebSocket server.
    """
    
    def __init__(self, ws_url: str = "ws://localhost:3055", channel: Optional[str] = None):
        """
        Initialize the Figma MCP client.
        
        Args:
            ws_url: WebSocket server URL
            channel: Optional channel ID to connect to
        """
        self.ws_url = ws_url
        self.channel = channel
        self.ws: Optional[WebSocketClientProtocol] = None
        self.connected = False
        self.logger = logging.getLogger(f"agent.figma_mcp_client")
        self.pending_requests: Dict[str, Dict[str, Any]] = {}
        self.response_handlers: Dict[str, Callable] = {}
        
    async def connect(self) -> bool:
        """
        Connect to the WebSocket server.
        
        Returns:
            True if connection successful
        """
        try:
            self.logger.info(f"Connecting to {self.ws_url}...")
            self.ws = await connect(self.ws_url)
            self.connected = True
            self.logger.info("Connected to Figma WebSocket server")
            
            # Start listening for messages
            asyncio.create_task(self._listen())
            
            # Join channel if provided
            if self.channel:
                await self.join_channel(self.channel)
            
            return True
        except Exception as e:
            self.logger.error(f"Failed to connect: {e}")
            self.connected = False
            return False
    
    async def _listen(self):
        """Listen for incoming messages from the WebSocket."""
        try:
            async for message in self.ws:
                await self._handle_message(message)
        except ConnectionClosed:
            self.logger.warning("WebSocket connection closed")
            self.connected = False
        except Exception as e:
            self.logger.error(f"Error in message listener: {e}")
            self.connected = False
    
    async def _handle_message(self, message: str):
        """Handle incoming WebSocket message."""
        try:
            data = json.loads(message)
            msg_type = data.get("type")
            
            if msg_type == "system":
                self.logger.info(f"System message: {data.get('message')}")
            elif msg_type == "broadcast":
                self.logger.debug(f"Broadcast message: {data.get('message')}")
            elif msg_type == "error":
                self.logger.error(f"Error message: {data.get('message')}")
                # Check if this is a response to a pending request
                if "id" in data.get("message", {}):
                    request_id = data["message"]["id"]
                    if request_id in self.pending_requests:
                        self.pending_requests[request_id]["future"].set_exception(
                            Exception(data["message"].get("error", "Unknown error"))
                        )
                        del self.pending_requests[request_id]
            else:
                # Handle response to a request
                msg_data = data.get("message", {})
                if "id" in msg_data and msg_data["id"] in self.pending_requests:
                    request_id = msg_data["id"]
                    request = self.pending_requests[request_id]
                    
                    if "error" in msg_data:
                        request["future"].set_exception(Exception(msg_data["error"]))
                    elif "result" in msg_data:
                        request["future"].set_result(msg_data["result"])
                    
                    del self.pending_requests[request_id]
        except json.JSONDecodeError as e:
            self.logger.error(f"Failed to parse message: {e}")
        except Exception as e:
            self.logger.error(f"Error handling message: {e}")
    
    async def join_channel(self, channel: str) -> bool:
        """
        Join a Figma channel.
        
        Args:
            channel: Channel ID to join
            
        Returns:
            True if successfully joined
        """
        if not self.connected or not self.ws:
            raise Exception("Not connected to WebSocket server")
        
        try:
            request_id = str(uuid.uuid4())
            request = {
                "id": request_id,
                "type": "join",
                "channel": channel
            }
            
            future = asyncio.Future()
            self.pending_requests[request_id] = {"future": future}
            
            await self.ws.send(json.dumps(request))
            
            # Wait for response with timeout
            try:
                result = await asyncio.wait_for(future, timeout=10.0)
                self.channel = channel
                self.logger.info(f"Joined channel: {channel}")
                return True
            except asyncio.TimeoutError:
                self.logger.error("Timeout waiting for channel join response")
                if request_id in self.pending_requests:
                    del self.pending_requests[request_id]
                return False
        except Exception as e:
            self.logger.error(f"Failed to join channel: {e}")
            return False
    
    async def send_command(
        self,
        command: str,
        params: Optional[Dict[str, Any]] = None,
        timeout: float = 30.0
    ) -> Any:
        """
        Send a command to Figma.
        
        Args:
            command: Command name (e.g., "create_rectangle", "get_document_info")
            params: Command parameters
            timeout: Timeout in seconds
            
        Returns:
            Command result
        """
        if not self.connected or not self.ws:
            raise Exception("Not connected to WebSocket server")
        
        if not self.channel:
            raise Exception("Must join a channel before sending commands")
        
        if params is None:
            params = {}
        
        request_id = str(uuid.uuid4())
        request = {
            "id": request_id,
            "type": "message",
            "channel": self.channel,
            "message": {
                "id": request_id,
                "command": command,
                "params": {
                    **params,
                    "commandId": request_id
                }
            }
        }
        
        future = asyncio.Future()
        self.pending_requests[request_id] = {"future": future}
        
        try:
            await self.ws.send(json.dumps(request))
            self.logger.info(f"Sending command: {command}")
            
            result = await asyncio.wait_for(future, timeout=timeout)
            return result
        except asyncio.TimeoutError:
            self.logger.error(f"Command {command} timed out")
            if request_id in self.pending_requests:
                del self.pending_requests[request_id]
            raise Exception(f"Command {command} timed out after {timeout} seconds")
        except Exception as e:
            self.logger.error(f"Error sending command {command}: {e}")
            if request_id in self.pending_requests:
                del self.pending_requests[request_id]
            raise
    
    async def disconnect(self):
        """Disconnect from the WebSocket server."""
        if self.ws:
            await self.ws.close()
            self.connected = False
            self.logger.info("Disconnected from WebSocket server")
    
    def is_connected(self) -> bool:
        """Check if connected to the WebSocket server."""
        return self.connected and self.ws is not None


# Synchronous wrapper for easier use in non-async contexts
class FigmaMCPClientSync:
    """
    Synchronous wrapper for FigmaMCPClient.
    """
    
    def __init__(self, ws_url: str = "ws://localhost:3055", channel: Optional[str] = None):
        self.client = FigmaMCPClient(ws_url, channel)
        self.loop: Optional[asyncio.AbstractEventLoop] = None
    
    def _get_loop(self):
        """Get or create event loop."""
        try:
            self.loop = asyncio.get_event_loop()
        except RuntimeError:
            self.loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self.loop)
        return self.loop
    
    def connect(self) -> bool:
        """Connect to WebSocket server."""
        loop = self._get_loop()
        return loop.run_until_complete(self.client.connect())
    
    def join_channel(self, channel: str) -> bool:
        """Join a Figma channel."""
        loop = self._get_loop()
        return loop.run_until_complete(self.client.join_channel(channel))
    
    def send_command(
        self,
        command: str,
        params: Optional[Dict[str, Any]] = None,
        timeout: float = 30.0
    ) -> Any:
        """Send a command to Figma."""
        loop = self._get_loop()
        return loop.run_until_complete(self.client.send_command(command, params, timeout))
    
    def disconnect(self):
        """Disconnect from WebSocket server."""
        loop = self._get_loop()
        loop.run_until_complete(self.client.disconnect())
    
    def is_connected(self) -> bool:
        """Check if connected."""
        return self.client.is_connected()
