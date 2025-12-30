#!/bin/bash
# Simple script to activate the virtual environment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_ACTIVATE="$SCRIPT_DIR/venv/bin/activate"

if [ ! -f "$VENV_ACTIVATE" ]; then
    echo "Error: Virtual environment not found at $VENV_ACTIVATE"
    echo "Creating virtual environment..."
    cd "$SCRIPT_DIR"
    python3 -m venv venv
    echo "Virtual environment created!"
fi

echo "Activating virtual environment..."
source "$VENV_ACTIVATE"
echo "✓ Virtual environment activated!"
echo ""
echo "You can now install dependencies:"
echo "  pip install -r requirements.txt"
echo ""

