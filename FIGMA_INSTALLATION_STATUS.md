# Figma Installation Status

## Current Status: ⚠️ Partially Found

### Found:
- ✅ `.desktop` file exists at: `~/.local/share/applications/Figma.desktop`
  - This suggests Figma was installed at some point
  - The desktop file may point to an executable

### Not Found:
- ❌ Figma executable not in PATH
- ❌ Figma not currently running
- ❌ Not installed via package manager (pacman/flatpak/snap)
- ❌ Not found in common installation locations

## What This Means

The `.desktop` file suggests Figma was installed, but:
1. The executable may have been moved or deleted
2. The installation may be incomplete
3. The desktop file may be pointing to a non-existent location

## Next Steps

### Option 1: Check the Desktop File
The desktop file should tell us where Figma is supposed to be:
```bash
cat ~/.local/share/applications/Figma.desktop
```

### Option 2: Install Figma Desktop

Since Figma doesn't appear to be properly installed, you'll need to install it:

#### For Arch Linux:
```bash
# Check AUR for figma-linux
yay -S figma-linux

# Or search for other options
yay -Ss figma
```

#### Download from Official Site:
1. Go to: https://www.figma.com/downloads/
2. Download the Linux version (usually .AppImage or .deb)
3. Make it executable and run it

#### AppImage Method:
```bash
# Download AppImage
wget https://www.figma.com/downloads/linux -O ~/Downloads/figma.AppImage

# Make executable
chmod +x ~/Downloads/figma.AppImage

# Run it
~/Downloads/figma.AppImage
```

## Important Notes

⚠️ **You MUST use Figma Desktop** (not browser version)
- Browser version doesn't support development plugins
- Development plugins are required for the MCP integration

## After Installation

Once Figma Desktop is installed:
1. Open Figma Desktop
2. Go to: **Menu → Plugins → Development → Import plugin from manifest...**
3. Select: `/home/tiago/Repositoty/Agent-Company/claude-talk-to-figma-mcp/src/claude_mcp_plugin/manifest.json`
4. Get the Channel ID from the plugin
5. Configure it in `config/agents.yaml`

