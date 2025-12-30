# Detailed Figma Plugin Installation Guide

## Finding the Development Plugins Menu

The location can vary depending on your Figma version. Here are all the possible ways to access it:

### Method 1: Main Menu (Most Common)
1. Click the **Menu icon** (☰) in the **top-left corner** of Figma
2. Look for **"Plugins"** in the dropdown menu
3. Click **"Plugins"**
4. Look for **"Development"** or **"Manage plugins..."**
5. Click **"Development"** → **"Import plugin from manifest..."**

### Method 2: Right-Click Context Menu
1. **Right-click** anywhere on the canvas (empty area)
2. Look for **"Plugins"** in the context menu
3. Click **"Plugins"** → **"Development"** → **"Import plugin from manifest..."**

### Method 3: Keyboard Shortcut
1. Press **`Ctrl + /`** (or **`Cmd + /`** on Mac) to open the command palette
2. Type **"plugin"** or **"development"**
3. Look for **"Import plugin from manifest"** or **"Development plugins"**

### Method 4: Plugins Menu (Top Bar)
1. Look at the **top menu bar** in Figma
2. Find **"Plugins"** menu (may be between "Object" and "Text")
3. Click **"Plugins"** → **"Development"** → **"Import plugin from manifest..."**

### Method 5: If "Development" is Not Visible
If you don't see "Development" option, you may need to enable it:

1. Go to **Menu** → **Settings** (or **Preferences**)
2. Look for **"Enable development plugins"** or similar option
3. Enable it and restart Figma

## Alternative: Direct File Installation

Some Figma versions allow direct file installation:

1. In Figma, go to **Menu** → **Plugins** → **Browse all plugins**
2. Look for a **"Development"** or **"Local plugins"** section
3. Or try: **Menu** → **Help** → **Plugins** → **Development**

## Step-by-Step with Screenshots Reference

Based on the MCP project documentation, the exact path is:

1. **Menu** (top-left) → **Plugins** → **Development** → **Import plugin from manifest...**

The manifest file to select is:
```
/home/tiago/Repositoty/Agent-Company/claude-talk-to-figma-mcp/src/claude_mcp_plugin/manifest.json
```

## Troubleshooting

### "Development" Option Not Showing
- Make sure you're using **Figma Desktop** (not browser)
- Try updating Figma to the latest version
- Check if you have developer mode enabled

### Can't Find "Import plugin from manifest"
- This option is only available in Figma Desktop
- Make sure you're not using Figma in a browser
- Try the keyboard shortcut: `Ctrl + /` and search for "import"

### File Dialog Not Opening
- Make sure the manifest.json file exists at the path above
- Try navigating manually to: `claude-talk-to-figma-mcp/src/claude_mcp_plugin/`
- Select `manifest.json`

## Visual Guide Locations

The menu structure should look like this:
```
Menu (☰)
  └── Plugins
      └── Development
          └── Import plugin from manifest...
```

Or:
```
Right-click on canvas
  └── Plugins
      └── Development
          └── Import plugin from manifest...
```

## Still Can't Find It?

If none of these methods work:

1. **Check Figma version**: Make sure you have the latest Figma Desktop
2. **Check if you're in Desktop**: Browser version doesn't support development plugins
3. **Try searching**: Use `Ctrl + /` and type "import plugin"
4. **Check permissions**: Some organizations disable development plugins

## Quick Test

To verify you're in the right place, the "Import plugin from manifest" dialog should:
- Allow you to browse files
- Accept `.json` files
- Show a file picker dialog

## Next Steps After Finding It

Once you find the import option:

1. Navigate to: `/home/tiago/Repositoty/Agent-Company/claude-talk-to-figma-mcp/src/claude_mcp_plugin/`
2. Select: `manifest.json`
3. Click **Open** or **Import**
4. The plugin should appear in your plugins list
5. Open it to get the Channel ID

