"""
Manual Task Execution Test

Directly execute a task on the Frontend Engineer agent to test code generation
"""

import sys
import json
from pathlib import Path

# Add to path
sys.path.append(str(Path(__file__).parent.parent))

from src.agents.implementations.FrontendEngineer.main import FrontendEngineer

def test_task_execution():
    print("🧪 Testing Frontend Engineer Agent Code Generation\n")
    
    # Create agent
    agent = FrontendEngineer()
    
    # Create test task (simulating what TaskMonitor sends)
    task = {
        'id': 'test-task-001',
        'description': 'Add Task Statistics Widget to Dashboard',
        'requirements': {
            'title': 'Add Task Statistics Widget to Dashboard',
            'description': 'Create a new component that displays task statistics: total tasks, tasks by status (todo, in_progress, review, done), and tasks by priority. Add this widget to the dashboard above the tab navigation.',
            'priority': 'medium',
            'tags': ['frontend', 'dashboard', 'statistics'],
            'collaborators': [
                {'id': 'frontend', 'name': 'Frontend Engineer', 'role': 'Frontend Engineer'},
                {'id': 'design', 'name': 'Design Agent', 'role': 'Design Agent'}
            ]
        }
    }
    
    print("📋 Task Details:")
    print(f"   Title: {task['requirements']['title']}")
    print(f"   Description: {task['requirements']['description'][:80]}...")
    print(f"   Priority: {task['requirements']['priority']}\n")
    
    # Execute task
    print("🚀 Executing task...\n")
    
    try:
        result = agent.execute_task(task)
        
        print("\n✅ Task Execution Complete!\n")
        print("📊 Result:")
        print(f"   Success: {result.get('success')}")
        print(f"   Message: {result.get('message')}")
        
        if result.get('files_modified'):
            print(f"   Files Modified: {', '.join(result.get('files_modified'))}")
        
        if result.get('result'):
            res = result.get('result')
            print(f"   Component: {res.get('component')}")
            print(f"   File: {res.get('file')}")
            print(f"   Code Length: {res.get('code_length')} characters")
        
        return result
    
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == '__main__':
    result = test_task_execution()
    
    if result and result.get('success'):
        print("\n🎉 Test PASSED! Agent successfully generated code.")
        sys.exit(0)
    else:
        print("\n❌ Test FAILED!")
        sys.exit(1)
