# Quick Start Guide

## Step 1: Activate Virtual Environment

Make sure you're in the project directory:
```bash
cd /home/tiago/Repositoty/Agent-Company
```

Then activate the virtual environment:
```bash
source venv/bin/activate
```

You should see `(venv)` in your prompt.

## Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

Or install manually:
```bash
pip install websockets python-dotenv pyyaml
```

## Step 3: Verify Installation

```bash
python -c "import websockets; import yaml; from dotenv import load_dotenv; print('✓ All dependencies installed!')"
```

## Step 4: Start MCP Server (if not already running)

In a separate terminal:
```bash
cd /home/tiago/Repositoty/Agent-Company
./scripts/start_mcp_server.sh
```

Or manually:
```bash
cd claude-talk-to-figma-mcp
export PATH="$HOME/.bun/bin:$PATH"
bun socket
```

## Step 5: Install Figma Plugin

1. Open **Figma Desktop** (not browser)
2. **Menu → Plugins → Development**
3. Click **Import plugin from manifest...**
4. Select: `claude-talk-to-figma-mcp/src/claude_mcp_plugin/manifest.json`
5. Open the plugin in Figma
6. **Copy the channel ID** from the plugin UI

## Step 6: Configure Channel

Edit `config/agents.yaml`:
```yaml
agents:
  figma_designer:
    config:
      channel: "paste-your-channel-id-here"
```

## Step 7: Test the Agent

```bash
# Make sure venv is activated
source venv/bin/activate

# Run test
python scripts/test_agent.py
```

## Troubleshooting

### "venv/bin/activate: No such file or directory"

Make sure you're in the correct directory:
```bash
cd /home/tiago/Repositoty/Agent-Company
ls -la venv/bin/activate  # Should show the file
```

If the file doesn't exist, create the venv:
```bash
python3 -m venv venv
source venv/bin/activate
```

### "pip: command not found"

Use Python's pip module:
```bash
python -m pip install -r requirements.txt
```

### MCP Server Not Running

Check if it's running:
```bash
curl http://localhost:3055/status
```

If not, start it:
```bash
./scripts/start_mcp_server.sh
```

