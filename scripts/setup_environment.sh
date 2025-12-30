#!/bin/bash
# Complete setup script for Agent Company project

set -e

cd "$(dirname "$0")/.." || exit 1

echo "=========================================="
echo "Agent Company - Environment Setup"
echo "=========================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo "✓ Virtual environment activated"
echo ""

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip > /dev/null 2>&1
echo "✓ pip upgraded"
echo ""

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt
echo "✓ Dependencies installed"
echo ""

# Check Bun
if ! command -v bun &> /dev/null; then
    echo "⚠ Warning: Bun is not installed"
    echo "  Install Bun: curl -fsSL https://bun.sh/install | bash"
    echo "  Or add to PATH: export PATH=\"\$HOME/.bun/bin:\$PATH\""
    echo ""
else
    echo "✓ Bun found: $(bun --version)"
    echo ""
fi

# Check MCP server
echo "Checking MCP server..."
if [ -d "claude-talk-to-figma-mcp" ]; then
    echo "✓ MCP server directory found"
    
    if [ -d "claude-talk-to-figma-mcp/node_modules" ]; then
        echo "✓ MCP server dependencies installed"
    else
        echo "⚠ MCP server dependencies not installed"
        echo "  Run: cd claude-talk-to-figma-mcp && bun install"
    fi
    
    if [ -d "claude-talk-to-figma-mcp/dist" ]; then
        echo "✓ MCP server built"
    else
        echo "⚠ MCP server not built"
        echo "  Run: cd claude-talk-to-figma-mcp && bun run build"
    fi
else
    echo "✗ MCP server directory not found"
fi
echo ""

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Start MCP server: ./scripts/start_mcp_server.sh"
echo "3. Install Figma plugin (see agents/figma_designer/SETUP.md)"
echo "4. Configure channel in config/agents.yaml"
echo "5. Test agent: python3 scripts/test_agent.py"
echo ""

