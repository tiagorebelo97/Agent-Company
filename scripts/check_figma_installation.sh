#!/bin/bash
# Check if Figma Desktop is installed

echo "=========================================="
echo "Checking Figma Desktop Installation"
echo "=========================================="
echo ""

FOUND=false

# Check if running
echo "1. Checking if Figma is running..."
if pgrep -x "Figma" > /dev/null 2>&1 || pgrep -x "figma" > /dev/null 2>&1; then
    echo "   ✓ Figma is currently RUNNING"
    pgrep -a -i figma | head -3
    FOUND=true
else
    echo "   ✗ Figma is not currently running"
fi
echo ""

# Check PATH
echo "2. Checking PATH for Figma executable..."
if command -v figma &> /dev/null; then
    echo "   ✓ Found in PATH: $(which figma)"
    FOUND=true
else
    echo "   ✗ Not found in PATH"
fi
echo ""

# Check common locations
echo "3. Checking common installation locations..."
LOCATIONS=(
    "/usr/bin/figma"
    "/usr/local/bin/figma"
    "$HOME/.local/bin/figma"
    "$HOME/Applications/Figma"
    "$HOME/.figma"
    "/opt/figma"
    "/Applications/Figma.app"  # macOS location
)

for loc in "${LOCATIONS[@]}"; do
    if [ -f "$loc" ] || [ -d "$loc" ]; then
        echo "   ✓ Found: $loc"
        FOUND=true
    fi
done
if [ "$FOUND" = false ]; then
    echo "   ✗ Not found in common locations"
fi
echo ""

# Check .desktop files
echo "4. Checking application menu entries..."
if [ -f "$HOME/.local/share/applications/figma.desktop" ] || \
   [ -f "/usr/share/applications/figma.desktop" ]; then
    echo "   ✓ Found .desktop file"
    FOUND=true
else
    echo "   ✗ No .desktop file found"
fi
echo ""

# Check package managers
echo "5. Checking package managers..."

# Pacman (Arch Linux)
if pacman -Q figma &> /dev/null; then
    echo "   ✓ Installed via pacman: $(pacman -Q figma)"
    FOUND=true
elif pacman -Q | grep -i figma &> /dev/null; then
    echo "   ✓ Found in pacman: $(pacman -Q | grep -i figma)"
    FOUND=true
else
    echo "   ✗ Not installed via pacman"
fi

# Flatpak
if flatpak list 2>/dev/null | grep -i figma &> /dev/null; then
    echo "   ✓ Installed via flatpak: $(flatpak list | grep -i figma)"
    FOUND=true
else
    echo "   ✗ Not installed via flatpak"
fi

# Snap
if snap list 2>/dev/null | grep -i figma &> /dev/null; then
    echo "   ✓ Installed via snap: $(snap list | grep -i figma)"
    FOUND=true
else
    echo "   ✗ Not installed via snap"
fi
echo ""

# Summary
echo "=========================================="
if [ "$FOUND" = true ]; then
    echo "RESULT: Figma appears to be installed"
    echo ""
    echo "To start Figma, try:"
    echo "  - Open from application menu"
    echo "  - Run: figma (if in PATH)"
    echo "  - Or find the executable and run it"
else
    echo "RESULT: Figma Desktop NOT FOUND"
    echo ""
    echo "Installation options:"
    echo "  1. Download from: https://www.figma.com/downloads/"
    echo "  2. Install via package manager:"
    echo "     - Arch: yay -S figma-linux (or check AUR)"
    echo "     - Or download .AppImage from Figma website"
    echo ""
    echo "NOTE: You need Figma DESKTOP (not browser version)"
    echo "      Browser version doesn't support development plugins"
fi
echo "=========================================="

