# Agent Company

An AI work team project where specialized agents collaborate to build applications.

## Overview

This project implements a team of AI agents, each with specialized capabilities, working together to create complete software solutions.

## Agents

- **Figma Designer**: Creates UI/UX designs and mockups on Figma

## Project Structure

```
Agent-Company/
├── agents/              # Individual agent implementations
│   └── figma_designer/  # Figma design agent
├── shared/              # Shared utilities and modules
├── config/              # Configuration files
├── tests/               # Test files
└── docs/                # Documentation
```

## Installation

### Quick Setup

Run the setup script:
```bash
./scripts/setup_environment.sh
```

### Manual Setup

1. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start MCP WebSocket server:**
   ```bash
   ./scripts/start_mcp_server.sh
   ```
   Or manually:
   ```bash
   cd claude-talk-to-figma-mcp
   export PATH="$HOME/.bun/bin:$PATH"
   bun socket
   ```

4. **Install Figma Plugin:**
   - Open Figma Desktop
   - Menu → Plugins → Development
   - Import: `claude-talk-to-figma-mcp/src/claude_mcp_plugin/manifest.json`
   - Open the plugin and copy the channel ID

5. **Configure the agent:**
   - Edit `config/agents.yaml`
   - Set `channel` to your channel ID from the Figma plugin

## Usage

### Testing the Agent

```bash
# Activate virtual environment first
source venv/bin/activate

# Run test script
python3 scripts/test_agent.py
```

### Using the Agent in Python

```python
from agents.figma_designer import FigmaDesignerAgent

# Initialize agent
agent = FigmaDesignerAgent()

# Execute a task
result = agent.execute({
    "action": "get_document_info",
    "parameters": {}
})

print(result)
```

See `agents/figma_designer/README.md` for detailed usage examples.

## Contributing

(To be documented)

## License

(To be specified)
