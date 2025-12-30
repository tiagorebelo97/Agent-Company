#!/bin/bash
# Helper script to guide Figma plugin installation

PLUGIN_MANIFEST="$(dirname "$0")/../claude-talk-to-figma-mcp/src/claude_mcp_plugin/manifest.json"
MANIFEST_ABS="$(realpath "$PLUGIN_MANIFEST")"

echo "=========================================="
echo "Figma Plugin Installation Guide"
echo "=========================================="
echo ""
echo "Plugin manifest location:"
echo "  $MANIFEST_ABS"
echo ""

# Check if manifest exists
if [ ! -f "$PLUGIN_MANIFEST" ]; then
    echo "❌ Error: Plugin manifest not found at:"
    echo "   $PLUGIN_MANIFEST"
    exit 1
fi

echo "✓ Plugin manifest found!"
echo ""

# Check if Figma is running (optional check)
if pgrep -x "Figma" > /dev/null 2>&1 || pgrep -x "figma" > /dev/null 2>&1; then
    echo "✓ Figma Desktop appears to be running"
else
    echo "⚠ Figma Desktop doesn't appear to be running"
    echo "  Please make sure Figma Desktop is open"
fi
echo ""

echo "=========================================="
echo "Installation Steps:"
echo "=========================================="
echo ""
echo "1. Open Figma Desktop (not the browser version)"
echo ""
echo "2. In Figma, go to:"
echo "   Menu → Plugins → Development → Import plugin from manifest..."
echo ""
echo "3. Navigate to and select this file:"
echo "   $MANIFEST_ABS"
echo ""
echo "4. The plugin will appear in your plugins list"
echo ""
echo "5. To use the plugin:"
echo "   - Go to: Menu → Plugins → Development → Claude MCP Plugin"
echo "   - Or use: Plugins → Development → Claude MCP Plugin"
echo ""
echo "6. When you open the plugin, it will show a Channel ID"
echo "   Copy that Channel ID!"
echo ""
echo "7. Update config/agents.yaml with the channel ID:"
echo "   channel: \"paste-channel-id-here\""
echo ""
echo "=========================================="
echo ""
echo "Quick copy command for the manifest path:"
echo ""
echo "echo '$MANIFEST_ABS' | xclip -selection clipboard"
echo "  (or manually copy the path above)"
echo ""
echo "=========================================="

# Try to open the directory in file manager (optional)
read -p "Would you like to open the plugin directory in your file manager? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "$(dirname "$MANIFEST_ABS")"
    elif command -v open &> /dev/null; then
        open "$(dirname "$MANIFEST_ABS")"
    else
        echo "Could not open file manager automatically"
    fi
fi

