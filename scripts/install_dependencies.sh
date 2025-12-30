#!/bin/bash
# Script to install Python dependencies

cd "$(dirname "$0")/.." || exit 1

echo "Installing Python dependencies..."

# Try different pip commands
if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
elif command -v pip &> /dev/null; then
    pip install -r requirements.txt
elif python3 -m pip --version &> /dev/null; then
    python3 -m pip install -r requirements.txt
else
    echo "Error: pip is not available. Please install pip first."
    echo "On Ubuntu/Debian: sudo apt-get install python3-pip"
    echo "On Arch: sudo pacman -S python-pip"
    exit 1
fi

echo ""
echo "Dependencies installed successfully!"

