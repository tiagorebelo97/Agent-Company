import os
import glob
from pathlib import Path

class ProjectCrawler:
    def __init__(self, target_dir):
        self.target_dir = Path(target_dir)
        self.ignore_dirs = {'node_modules', 'dist', 'build', '.git', 'coverage'}

    def scan_for_pages(self):
        """
        Scans the target directory for likely React 'Page' components.
        Heuristics:
        1. Files directly in a 'pages' or 'screens' directory.
        2. Files referenced in 'App.jsx' or 'routes.jsx' (Future implementation).
        3. Files with typical Page naming convention (e.g., Dashboard.jsx, Login.jsx).
        """
        print(f"🔍 Scanning {self.target_dir} for redesign targets...")
        
        candidates = []
        
        # Walk through directory
        for root, dirs, files in os.walk(self.target_dir):
            # Prune ignored dirs
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            
            for file in files:
                if file.endswith(('.jsx', '.tsx', '.js')):
                    full_path = Path(root) / file
                    # Simplified heuristic for demo purposes
                    candidates.append(str(full_path))

        print(f"✅ Found {len(candidates)} potential UI components to reskin.")
        return candidates

if __name__ == "__main__":
    # Test on our own sandbox
    crawler = ProjectCrawler("./sandbox")
    targets = crawler.scan_for_pages()
    for t in targets:
        print(f"  - {t}")
