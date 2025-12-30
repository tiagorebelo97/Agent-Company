#!/bin/bash
# Script to install Figma Desktop on Arch Linux

echo "=========================================="
echo "Installing Figma Desktop"
echo "=========================================="
echo ""

# Check if yay is available
if ! command -v yay &> /dev/null; then
    echo "Error: yay is not installed"
    echo "Install yay first: https://github.com/Jguer/yay"
    exit 1
fi

echo "Searching for Figma packages in AUR..."
echo ""

# Search for figma packages
yay -Ss figma | grep -E "^aur/|^community/" | head -10

echo ""
echo "=========================================="
echo "Recommended package: figma-linux"
echo "=========================================="
echo ""

read -p "Do you want to install figma-linux from AUR? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Installing figma-linux..."
    yay -S figma-linux
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "=========================================="
        echo "✓ Figma Desktop installed successfully!"
        echo "=========================================="
        echo ""
        echo "You can now:"
        echo "  1. Launch Figma: figma"
        echo "  2. Install the plugin (see FIGMA_PLUGIN_INSTALL.md)"
        echo ""
    else
        echo ""
        echo "Installation failed. You may need to:"
        echo "  - Check your internet connection"
        echo "  - Update yay: yay -Syu"
        echo "  - Try manual installation from AUR"
    fi
else
    echo ""
    echo "Installation cancelled."
    echo ""
    echo "You can install manually with:"
    echo "  yay -S figma-linux"
    echo ""
    echo "Or download AppImage from:"
    echo "  https://www.figma.com/downloads/"
fi

