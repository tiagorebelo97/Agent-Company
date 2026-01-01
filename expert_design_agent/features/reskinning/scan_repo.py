import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

from expert_design_agent.features.reskinning.crawler import ProjectCrawler

def scan_cloned_repo():
    print("🚀 Scanning Cloned Repository...\n")
    
    # Target the cloned workspace
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../'))
    target_path = os.path.join(base_dir, "temp_reskin_workspace")
    
    if not os.path.exists(target_path):
        print(f"❌ Error: Path '{target_path}' does not exist. Did the clone finish?")
        return

    crawler = ProjectCrawler(target_path)
    targets = crawler.scan_for_pages()
    
    # Save list to a file for the next step to consume
    with open("reskin_targets.txt", "w") as f:
        for t in targets:
            f.write(t + "\n")
            
    print(f"\n✅ Saved {len(targets)} targets to reskin_targets.txt")

if __name__ == "__main__":
    scan_cloned_repo()
