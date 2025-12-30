# Figma Designer Agent

## Overview

The Figma Designer Agent is responsible for creating and managing UI/UX designs and mockups on Figma. It uses the **Figma MCP Server** to communicate with Figma through a WebSocket connection.

## Architecture

The agent communicates with Figma through the MCP (Model Context Protocol) server:
```
Python Agent ↔ WebSocket Client ↔ MCP Server (port 3055) ↔ Figma Plugin
```

## Prerequisites

1. **Bun runtime** - Installed and available in PATH
2. **Figma Desktop** - Must be running
3. **Figma Plugin** - The MCP plugin must be installed in Figma
4. **MCP Server** - The WebSocket server must be running

## Setup

### 1. Install MCP Server Dependencies

The MCP server is located in `claude-talk-to-figma-mcp/`. It's already cloned and built, but if you need to rebuild:

```bash
cd claude-talk-to-figma-mcp
export PATH="$HOME/.bun/bin:$PATH"
bun install
bun run build
```

### 2. Start the WebSocket Server

```bash
cd claude-talk-to-figma-mcp
export PATH="$HOME/.bun/bin:$PATH"
bun socket
```

The server will run on `ws://localhost:3055`. Verify it's running by visiting `http://localhost:3055/status`.

### 3. Install Figma Plugin

1. Open Figma Desktop
2. Go to Menu → Plugins → Development
3. Import the plugin manifest: `claude-talk-to-figma-mcp/src/claude_mcp_plugin/manifest.json`
4. Open the plugin in Figma and copy the channel ID

### 4. Configure the Agent

Configure the agent in `config/agents.yaml`:

```yaml
agents:
  figma_designer:
    config:
      ws_url: "ws://localhost:3055"  # WebSocket server URL
      channel: "your-channel-id"     # Channel ID from Figma plugin
```

Or set the channel dynamically when using the agent.

## Capabilities

The agent supports all MCP server commands:

### Document Tools
- `get_document_info` - Get document information
- `get_selection` - Get current selection
- `get_node_info` - Get node details
- `export_node_as_image` - Export as image

### Creation Tools
- `create_rectangle` - Create rectangles
- `create_frame` - Create frames
- `create_text` - Create text elements
- `create_ellipse` - Create circles/ovals
- `create_polygon` - Create polygons
- `create_star` - Create star shapes

### Modification Tools
- `set_fill_color` - Set fill colors
- `set_stroke_color` - Set stroke colors
- `move_node` - Move elements
- `resize_node` - Resize elements
- `set_corner_radius` - Set rounded corners
- `set_auto_layout` - Set auto-layout
- `set_effects` - Set shadows/blurs

### Text Tools
- `set_text_content` - Update text
- `set_font_name` - Change fonts
- `set_font_size` - Change font size
- `set_font_weight` - Change font weight

### Component Tools
- `get_local_components` - Get project components
- `get_remote_components` - Get team library components
- `create_component_instance` - Use components

## Usage

### Basic Usage

```python
from agents.figma_designer import FigmaDesignerAgent

# Initialize agent (loads config from agents.yaml)
agent = FigmaDesignerAgent()

# Create a design
task = {
    "action": "create_design",
    "parameters": {
        "name": "My App Design",
        "width": 1440,
        "height": 1024
    }
}

result = agent.execute(task)
print(result)
```

### Using MCP Commands Directly

```python
# Get document info
task = {
    "action": "get_document_info",
    "parameters": {}
}

result = agent.execute(task)

# Create a rectangle
task = {
    "action": "create_rectangle",
    "parameters": {
        "x": 100,
        "y": 100,
        "width": 200,
        "height": 100,
        "name": "My Rectangle"
    }
}

result = agent.execute(task)

# Generic MCP command passthrough
task = {
    "action": "mcp_command",
    "parameters": {
        "command": "set_fill_color",
        "params": {
            "nodeId": "node-id-here",
            "color": {"r": 1, "g": 0, "b": 0, "a": 1}
        }
    }
}

result = agent.execute(task)
```

### Setting Channel Dynamically

```python
from agents.figma_designer import FigmaDesignerAgent

# Initialize without channel
agent = FigmaDesignerAgent()

# Connect and join channel
if agent._ensure_connected():
    if agent.channel:
        agent.mcp_client.join_channel(agent.channel)
    else:
        # Join a specific channel
        agent.mcp_client.join_channel("your-channel-id")
```

## Troubleshooting

### Connection Issues

1. **"Not connected to Figma MCP server"**
   - Ensure the WebSocket server is running: `bun socket` in the `claude-talk-to-figma-mcp` directory
   - Check that port 3055 is not blocked

2. **"Must join a channel before sending commands"**
   - Get the channel ID from the Figma plugin
   - Set it in `config/agents.yaml` or join it programmatically

3. **"Failed to connect"**
   - Verify the WebSocket server is running: `curl http://localhost:3055/status`
   - Check that the Figma plugin is open and connected

### Plugin Issues

- Make sure the Figma plugin is installed and running
- The plugin must be open in Figma to receive commands
- Check the Figma console for plugin errors

## MCP Server Location

The MCP server is located at:
- **Path**: `claude-talk-to-figma-mcp/`
- **WebSocket Server**: `src/socket.ts` (compiled to `dist/socket.js`)
- **MCP Server**: `src/talk_to_figma_mcp/server.ts` (compiled to `dist/talk_to_figma_mcp/server.js`)
- **Figma Plugin**: `src/claude_mcp_plugin/`

## References

- [MCP Server Repository](https://github.com/arinspunk/claude-talk-to-figma-mcp)
- Original project by [Sonny Lazuardi](https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp)
