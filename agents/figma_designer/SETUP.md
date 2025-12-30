# Figma Designer Agent Setup Guide

## Quick Start

1. **Start the MCP WebSocket Server**
   ```bash
   cd claude-talk-to-figma-mcp
   export PATH="$HOME/.bun/bin:$PATH"
   bun socket
   ```

2. **Install Figma Plugin**
   - Open Figma Desktop
   - Menu → Plugins → Development
   - Import: `claude-talk-to-figma-mcp/src/claude_mcp_plugin/manifest.json`
   - Open the plugin and copy the channel ID

3. **Configure Agent**
   - Edit `config/agents.yaml`
   - Set `channel` to your channel ID from step 2

4. **Test the Agent**
   ```python
   from agents.figma_designer import FigmaDesignerAgent
   
   agent = FigmaDesignerAgent()
   result = agent.execute({
       "action": "get_document_info",
       "parameters": {}
   })
   print(result)
   ```

## Verifying Setup

### Check WebSocket Server
```bash
curl http://localhost:3055/status
```

Should return:
```json
{"status":"running","uptime":123.45,"stats":{...}}
```

### Check Agent Connection
```python
from agents.figma_designer import FigmaDesignerAgent

agent = FigmaDesignerAgent()
print(f"Connected: {agent._ensure_connected()}")
print(f"Capabilities: {agent.get_capabilities()}")
```

## Common Issues

- **Port 3055 in use**: Change port in `config/agents.yaml` and restart server
- **Plugin not connecting**: Restart Figma and re-open the plugin
- **Channel not found**: Make sure you copied the channel ID correctly from the plugin
