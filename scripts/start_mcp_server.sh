#!/bin/bash
# Script to start the Figma MCP WebSocket server

cd "$(dirname "$0")/../claude-talk-to-figma-mcp" || exit 1

# Ensure Bun is in PATH
export PATH="$HOME/.bun/bin:$PATH"

# Check if Bun is available
if ! command -v bun &> /dev/null; then
    echo "Error: Bun is not installed or not in PATH"
    echo "Install Bun: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Check if server is already running
if curl -s http://localhost:3055/status > /dev/null 2>&1; then
    echo "MCP server is already running on port 3055"
    exit 0
fi

echo "Starting Figma MCP WebSocket server on port 3055..."
echo "Server will be accessible at: ws://localhost:3055"
echo "Status endpoint: http://localhost:3055/status"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

bun socket

