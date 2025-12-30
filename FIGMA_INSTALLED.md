# ✅ Figma Desktop Successfully Installed!

## Installation Complete

Figma Desktop (version 0.11.5-0) has been successfully installed!

## How to Launch Figma

### Method 1: Command Line
```bash
/usr/bin/figma-linux
```

Or create an alias in your `~/.bashrc`:
```bash
alias figma='/usr/bin/figma-linux'
```

### Method 2: Application Menu
- Look for "Figma" in your application menu
- It should appear under Graphics or Design category

### Method 3: Desktop File
The desktop file is located at:
```
/opt/figma-linux/figma-linux.desktop
```

## Installation Details

- **Package**: figma-linux 0.11.5-0
- **Location**: `/opt/figma-linux/`
- **Executable**: `/usr/bin/figma-linux`
- **Size**: 266.30 MiB

## Next Steps: Install the Plugin

Now that Figma Desktop is installed, you can install the MCP plugin:

1. **Launch Figma Desktop:**
   ```bash
   /usr/bin/figma-linux
   ```

2. **Install the Plugin:**
   - In Figma: **Menu → Plugins → Development → Import plugin from manifest...**
   - Navigate to and select:
     ```
     /home/tiago/Repositoty/Agent-Company/claude-talk-to-figma-mcp/src/claude_mcp_plugin/manifest.json
     ```

3. **Get Channel ID:**
   - Open the plugin: **Plugins → Development → Claude MCP Plugin**
   - Copy the Channel ID shown in the plugin

4. **Configure Agent:**
   - Edit `config/agents.yaml`
   - Set `channel: "your-channel-id-here"`

## Verify Installation

Check if Figma is installed:
```bash
pacman -Q figma-linux
```

Check if executable exists:
```bash
ls -la /usr/bin/figma-linux
```

## Troubleshooting

### Can't find Figma in application menu
- The desktop file should be automatically registered
- Try logging out and back in
- Or manually add to menu if needed

### Executable not in PATH
- The executable is `/usr/bin/figma-linux` (not just `figma`)
- Create an alias or symlink if you prefer:
  ```bash
  sudo ln -s /usr/bin/figma-linux /usr/local/bin/figma
  ```

## Ready to Use!

Figma Desktop is ready. Launch it and install the plugin to complete the setup! 🎨

