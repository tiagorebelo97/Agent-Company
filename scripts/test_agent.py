#!/usr/bin/env python3
"""
Test script for the Figma Designer Agent.
"""

import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from agents.figma_designer import FigmaDesignerAgent

def test_agent():
    """Test the Figma Designer Agent."""
    print("=" * 60)
    print("Figma Designer Agent Test")
    print("=" * 60)
    print()
    
    # Initialize agent
    print("1. Initializing agent...")
    try:
        agent = FigmaDesignerAgent()
        print(f"   ✓ Agent initialized: {agent}")
        print()
    except Exception as e:
        print(f"   ✗ Failed to initialize agent: {e}")
        return False
    
    # Check capabilities
    print("2. Checking capabilities...")
    try:
        capabilities = agent.get_capabilities()
        print(f"   ✓ Capabilities retrieved:")
        print(f"     - Name: {capabilities['name']}")
        print(f"     - Description: {capabilities['description']}")
        print(f"     - MCP Configured: {capabilities.get('mcp_configured', False)}")
        print(f"     - MCP Connected: {capabilities.get('mcp_connected', False)}")
        print(f"     - Available Actions: {len(capabilities.get('actions', []))}")
        print()
    except Exception as e:
        print(f"   ✗ Failed to get capabilities: {e}")
        return False
    
    # Test connection
    print("3. Testing MCP connection...")
    try:
        connected = agent._ensure_connected()
        if connected:
            print("   ✓ Connected to MCP server")
        else:
            print("   ✗ Failed to connect to MCP server")
            print("   → Make sure the server is running: ./scripts/start_mcp_server.sh")
            print("   → Make sure the Figma plugin is installed and running")
            return False
        print()
    except Exception as e:
        print(f"   ✗ Connection error: {e}")
        print("   → Make sure the server is running: ./scripts/start_mcp_server.sh")
        return False
    
    # Test getting document info
    print("4. Testing get_document_info command...")
    try:
        result = agent.execute({
            "action": "get_document_info",
            "parameters": {}
        })
        
        if result.get("status") == "success":
            print("   ✓ Successfully retrieved document info")
            print(f"     Result keys: {list(result.get('document_info', {}).keys())[:5]}...")
        else:
            print(f"   ✗ Command failed: {result.get('message', 'Unknown error')}")
            if "channel" in result.get("message", "").lower():
                print("   → Make sure you've set the channel in config/agents.yaml")
                print("   → Get the channel ID from the Figma plugin")
        print()
    except Exception as e:
        print(f"   ✗ Error executing command: {e}")
        print()
    
    print("=" * 60)
    print("Test completed!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = test_agent()
    sys.exit(0 if success else 1)

