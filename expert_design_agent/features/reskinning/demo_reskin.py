import sys
import os

# Ensure we can import from the parent/sister directories
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

from expert_design_agent.features.reskinning.crawler import ProjectCrawler
from expert_design_agent.features.reskinning.engine import ReskinningEngine

def run_demo():
    print("🚀 Starting Project Reskinning Demo...\n")
    
    # 1. Configure
    # Use absolute path to be safe
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../'))
    target_path = os.path.join(base_dir, "expert_design_agent/sandbox/src/components")
    desired_style = "Minimalist Light (Apple Aesthetic)"
    
    # 2. Initialize
    crawler = ProjectCrawler(target_path)
    engine = ReskinningEngine(desired_style)
    
    engine.prepare_output_dir()
    
    # 3. Discover
    targets = crawler.scan_for_pages()
    
    if not targets:
        print("❌ No pages found to reskin.")
        return

    # 4. Execute
    print(f"\n⚡ Applying '{desired_style}' to {len(targets)} components...\n")
    for file_path in targets:
        engine.process_file(file_path)
        
    print("\n✨ Batch Reskinning Complete!")
    print(f"   Check the '{engine.output_dir}' directory for the results.")

if __name__ == "__main__":
    run_demo()
