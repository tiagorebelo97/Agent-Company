from core.logic import ProjectManager
import json

pm = ProjectManager()
test_task = {
    'id': 'test-analysis',
    'type': 'project_analysis',
    'title': 'Test Analysis',
    'projectId': 'test-id',
    'requirements': json.dumps({
        'local_path': '.',
        'repo_url': None
    })
}

# We need to mock call_mcp_tool because it requires a bridge
def mock_call(mcp, tool, args):
    print(f"Mock Call: {mcp}.{tool}({args})")
    if tool == "project_list_files" or tool == "list_directory":
        return {"files": [{"name": "package.json", "isDirectory": False}]}
    if tool == "project_read_file" or tool == "read_file":
        return {"content": "{\"name\": \"test\"}"}
    if tool == "project_update":
        return {"success": True}
    return {}

pm.call_mcp_tool = mock_call
pm.llm_manager = None # Use fallback or mock

res = pm.execute_task(test_task)
print("Result:", res)
