# Install Figma Desktop

## ⚠️ Current Situation

Your system has Figma configured as a **web app** (via `omarchy-launch-webapp`), but you need **Figma Desktop** for development plugins to work.

## Installation Options for Arch Linux

### Option 1: Install from AUR (Recommended)

If you have `yay` or `paru`:

```bash
# Using yay
yay -S figma-linux

# Or using paru
paru -S figma-linux
```

### Option 2: Download AppImage (Easiest)

```bash
# Create directory for AppImages
mkdir -p ~/Applications
cd ~/Applications

# Download Figma AppImage
# Visit: https://www.figma.com/downloads/
# Or use direct download (check for latest version):
wget https://www.figma.com/downloads/linux -O figma.AppImage

# Make executable
chmod +x figma.AppImage

# Run it
./figma.AppImage
```

### Option 3: Download .deb and Convert (Advanced)

If you download a .deb file:
```bash
# Install debtap to convert .deb to Arch package
yay -S debtap
sudo debtap -u

# Convert the .deb file
debtap figma-linux_*.deb

# Install the converted package
sudo pacman -U figma-linux-*.pkg.tar.xz
```

## After Installation

### Verify Installation

```bash
# Check if Figma Desktop is installed
./scripts/check_figma_installation.sh

# Or manually check
which figma
figma --version
```

### Launch Figma Desktop

```bash
# If installed via package manager
figma

# If using AppImage
~/Applications/figma.AppImage
```

### Install the Plugin

Once Figma Desktop is running:

1. **Menu → Plugins → Development → Import plugin from manifest...**
2. Select: `/home/tiago/Repositoty/Agent-Company/claude-talk-to-figma-mcp/src/claude_mcp_plugin/manifest.json`
3. Open the plugin to get the Channel ID
4. Update `config/agents.yaml` with the channel ID

## Quick Install Script

I can create a script to help with installation. Would you like me to:

1. Check for AUR helpers and install via AUR?
2. Download the AppImage automatically?
3. Set up a launcher for the AppImage?

## Important Notes

- ⚠️ The web app version (`omarchy-launch-webapp`) **will NOT work** for plugins
- ✅ You **must** use Figma Desktop application
- ✅ Development plugins are only available in Desktop version

## Troubleshooting

### "Command not found" after installation
- Add to PATH or create a symlink:
  ```bash
  sudo ln -s /path/to/figma /usr/local/bin/figma
  ```

### AppImage won't run
- Make sure it's executable: `chmod +x figma.AppImage`
- Check if you need FUSE: `sudo pacman -S fuse2`

### Plugin menu not showing
- Make sure you're using Desktop version (not web)
- Update Figma to latest version
- Check Menu → Help → Check for updates

