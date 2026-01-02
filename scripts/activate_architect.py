import sys
import os
import json

# Add implementation path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/agents/implementations/TechnicalArchitect')))
from main import TechnicalArchitect

def activate_architect():
    print("🚀 Activating Technical Architect Agent...")
    architect = TechnicalArchitect()
    
    # Task: Generate implementation plan for Phase 1 Stabilization
    task = {
        'type': 'generate_implementation_plan',
        'description': 'Centralized state management (Redis/PostgreSQL) and Event-driven messaging system.'
    }
    
    print("\n📝 Requesting Implementation Plan from Agent...")
    result = architect.execute_task(task)
    
    if result.get('success'):
        print("\n✅ Agent Response Received:")
        print("-" * 40)
        print(result.get('plan'))
        print("-" * 40)
        
        # Save the agent-generated plan to a file
        plan_dir = "planning/generated"
        os.makedirs(plan_dir, exist_ok=True)
        plan_path = os.path.join(plan_dir, "phase1_stabilization_plan.md")
        
        with open(plan_path, "w") as f:
            f.write(result.get('plan'))
        
        print(f"\n📁 Plan saved to {plan_path}")
    else:
        print(f"\n❌ Error: {result.get('error')}")

if __name__ == "__main__":
    activate_architect()
