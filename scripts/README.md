# Scripts Directory

Helper scripts for managing the Agent Company project.

## Available Scripts

### `start_mcp_server.sh`
Starts the Figma MCP WebSocket server.

**Usage:**
```bash
./scripts/start_mcp_server.sh
```

The server will run on `ws://localhost:3055`. Keep this running while using the Figma Designer agent.

### `install_dependencies.sh`
Installs Python dependencies from `requirements.txt`.

**Usage:**
```bash
./scripts/install_dependencies.sh
```

### `test_agent.py`
Tests the Figma Designer Agent connection and basic functionality.

**Usage:**
```bash
python3 scripts/test_agent.py
```

**Prerequisites:**
- MCP server must be running (`./scripts/start_mcp_server.sh`)
- Figma plugin must be installed and running
- Channel ID must be configured in `config/agents.yaml`

## Quick Start

1. **Install dependencies:**
   ```bash
   ./scripts/install_dependencies.sh
   ```

2. **Start MCP server (in a separate terminal):**
   ```bash
   ./scripts/start_mcp_server.sh
   ```

3. **Install Figma plugin:**
   - Open Figma Desktop
   - Menu → Plugins → Development
   - Import: `claude-talk-to-figma-mcp/src/claude_mcp_plugin/manifest.json`
   - Open the plugin and copy the channel ID

4. **Configure channel:**
   - Edit `config/agents.yaml`
   - Set `channel` to your channel ID

5. **Test the agent:**
   ```bash
   python3 scripts/test_agent.py
   ```

