# Figma Plugin Installation Guide

## ⚠️ Important Note

Figma plugins **must be installed manually** through the Figma Desktop application. This cannot be automated via command line.

## Plugin Location

The plugin manifest is located at:
```
/home/tiago/Repositoty/Agent-Company/claude-talk-to-figma-mcp/src/claude_mcp_plugin/manifest.json
```

## Step-by-Step Installation

### Step 1: Open Figma Desktop
- Make sure you're using **Figma Desktop** (not the browser version)
- If you don't have it, download from: https://www.figma.com/downloads/

### Step 2: Access Development Plugins
1. In Figma Desktop, click on the **Menu** (☰ icon in top-left)
2. Go to **Plugins**
3. Click **Development**
4. Click **Import plugin from manifest...**

### Step 3: Select the Manifest File
1. Navigate to:
   ```
   /home/tiago/Repositoty/Agent-Company/claude-talk-to-figma-mcp/src/claude_mcp_plugin/
   ```
2. Select the file: `manifest.json`
3. Click **Open**

### Step 4: Verify Installation
- The plugin should now appear in your plugins list
- You can find it under: **Plugins → Development → Claude MCP Plugin**

### Step 5: Open the Plugin
1. In Figma, go to **Plugins → Development → Claude MCP Plugin**
2. The plugin will open and display a **Channel ID**
3. **Copy this Channel ID** - you'll need it for configuration!

### Step 6: Configure the Agent
1. Edit `config/agents.yaml`
2. Find the `figma_designer` section
3. Set the `channel` value:
   ```yaml
   agents:
     figma_designer:
       config:
         channel: "your-channel-id-here"  # Paste the channel ID here
   ```

## Quick Helper Script

Run this to get the exact path and instructions:
```bash
./scripts/install_figma_plugin.sh
```

## Verification

After installation, you should be able to:
1. See "Claude MCP Plugin" in your plugins list
2. Open the plugin and see a Channel ID
3. The plugin should connect to the MCP server (if it's running)

## Troubleshooting

### Plugin doesn't appear
- Make sure you're using Figma Desktop (not browser)
- Check that you imported the correct `manifest.json` file
- Try restarting Figma

### Can't find Development menu
- Make sure you're using Figma Desktop (not Figma in browser)
- The Development section is only available in Desktop version

### Plugin shows connection error
- Make sure the MCP server is running: `./scripts/start_mcp_server.sh`
- Check server status: `curl http://localhost:3055/status`
- The plugin needs the WebSocket server to be running

### Channel ID not showing
- Make sure the MCP server is running
- Try closing and reopening the plugin
- Check the Figma console for errors (View → Developer → Show Console)

## Next Steps

Once the plugin is installed and you have the channel ID:

1. Update `config/agents.yaml` with the channel ID
2. Test the connection:
   ```bash
   source venv/bin/activate
   python scripts/test_agent.py
   ```

## Need Help?

- Plugin files are in: `claude-talk-to-figma-mcp/src/claude_mcp_plugin/`
- MCP server must be running for the plugin to work
- See `agents/figma_designer/README.md` for more details

