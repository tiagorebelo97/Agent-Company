import os
import sys
import json
import asyncio

# Add necessary paths
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/agents/core')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/agents/implementations/ProjectManager')))

from core.logic import ProjectManager

class MockLLM:
    def generate_response(self, prompt, system_context="", history=None):
        print(f"MockLLM: prompt received ({len(prompt)} chars)")
        return None # Return None to trigger the error if it's unhandled

def test_analysis():
    pm = ProjectManager()
    pm.llm_manager = MockLLM()
    
    # Mock call_mcp_tool
    def mock_mcp(mcp, tool, args):
        print(f"Mock MCP: {mcp}.{tool}")
        if tool == "project_list_files":
            return {"files": ["package.json", "index.js"]}
        if tool == "project_read_file":
            return {"content": "{\"name\": \"test-project\"}"}
        return {"success": True}
    
    pm.call_mcp_tool = mock_mcp
    
    task = {
        "projectId": "test-id",
        "requirements": json.dumps({
            "local_path": "projects_cache/mason-manage"
        })
    }
    
    print("Starting analysis...")
    try:
        result = pm.analyze_project_repository(task)
        print("Analysis Result:", result)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_analysis()
