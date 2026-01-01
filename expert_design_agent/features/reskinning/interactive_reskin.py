import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

from expert_design_agent.features.reskinning.crawler import ProjectCrawler

def interactive_session():
    print("🤖 Expert Design Agent: Project Reskinning Interface")
    print("===================================================")
    
    # 1. Get Project Path
    print("\n[?] Please paste the ABSOLUTE PATH of the project directory you want to redesign:")
    # In a real script we would use input(), but in this Agent environment, 
    # we will rely on values passed as arguments or configuration since we can't capture stdin easily in all envs.
    # For now, we will print instructions for the user to provide this to the Agent.
    
    print(">> WAITING FOR USER INPUT via Chat...")
    print("\nPlease tell me:\n1. The Directory Path\n2. The Desired Aesthetic (e.g., 'Modern Dark Hub', 'Cyberpunk', or an Image Description)")

if __name__ == "__main__":
    interactive_session()
