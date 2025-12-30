#!/bin/bash
# Quick script to complete Figma installation

echo "=========================================="
echo "Completing Figma Desktop Installation"
echo "=========================================="
echo ""

# Find the built package
PKG_FILE=$(find ~/.cache/yay/figma-linux -name "*.pkg.tar.zst" 2>/dev/null | head -1)

if [ -z "$PKG_FILE" ]; then
    echo "Package file not found. Building package..."
    yay -S figma-linux --noconfirm
    PKG_FILE=$(find ~/.cache/yay/figma-linux -name "*.pkg.tar.zst" 2>/dev/null | head -1)
fi

if [ -n "$PKG_FILE" ] && [ -f "$PKG_FILE" ]; then
    echo "Found package: $PKG_FILE"
    echo ""
    echo "Installing with sudo (you'll be prompted for password)..."
    echo ""
    sudo pacman -U "$PKG_FILE"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "=========================================="
        echo "✓ Figma Desktop installed successfully!"
        echo "=========================================="
        echo ""
        echo "You can now:"
        echo "  1. Launch Figma: figma"
        echo "  2. Or find it in your application menu"
        echo ""
        echo "Next: Install the plugin (see FIGMA_PLUGIN_INSTALL.md)"
    else
        echo ""
        echo "Installation failed. Try running manually:"
        echo "  sudo pacman -U $PKG_FILE"
    fi
else
    echo "Error: Could not find package file"
    echo "Try running: yay -S figma-linux"
fi

