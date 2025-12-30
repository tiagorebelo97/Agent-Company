# Install Figma Desktop - Final Step

## ✅ Good News!

The Figma Desktop package has been **successfully built**! It just needs to be installed with sudo privileges.

## Quick Install Command

Run this command in your terminal (it will ask for your password):

```bash
sudo pacman -U ~/.cache/yay/figma-linux/figma-linux-0.11.5-0-x86_64.pkg.tar.zst
```

Or simply run yay again (it will use the already-built package):

```bash
yay -S figma-linux
```

When prompted:
- Press Enter to skip showing diffs
- Enter your sudo password when asked

## After Installation

### Verify Installation

```bash
# Check if Figma is installed
which figma
figma --version

# Or check with our script
./scripts/check_figma_installation.sh
```

### Launch Figma Desktop

```bash
figma
```

Or find it in your application menu.

## Next Steps After Figma is Installed

1. **Open Figma Desktop**
2. **Install the plugin:**
   - Menu → Plugins → Development → Import plugin from manifest...
   - Select: `/home/tiago/Repositoty/Agent-Company/claude-talk-to-figma-mcp/src/claude_mcp_plugin/manifest.json`
3. **Get Channel ID:**
   - Open the plugin: Plugins → Development → Claude MCP Plugin
   - Copy the Channel ID shown
4. **Configure agent:**
   - Edit `config/agents.yaml`
   - Set `channel: "your-channel-id-here"`

## Package Location

The built package is ready at:
```
~/.cache/yay/figma-linux/figma-linux-0.11.5-0-x86_64.pkg.tar.zst
```

You can install it directly with the sudo command above, or let yay handle it.

