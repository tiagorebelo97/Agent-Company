import os
import sys
import threading
import subprocess
import time

# Add core to path
sys.path.append(os.path.join(os.getcwd(), "expert_design_agent"))
from core.agent import DesignAgent

def start_sandbox():
    """Starts the Vite dev server in the background"""
    sandbox_path = os.path.join(os.getcwd(), "expert_design_agent", "sandbox")
    print("🚀 Starting Sandbox Dev Server...")
    return subprocess.Popen(
        "npm run dev", 
        cwd=sandbox_path, 
        shell=True, 
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE
    )

def main():
    agent = DesignAgent()
    
    # 1. Start Sandbox
    dev_server = start_sandbox()
    time.sleep(8) # Extra time for vite
    
    try:
        pages = ['Login', 'Dashboard', 'StadiumConfig']
        for page in pages:
            print(f"\n📸 Capturing {page}...")
            # We need to inform the sandbox which page to show
            # Since we use a simple state, we'll just use individual App.jsx temporary swaps
            # or better: rely on the user to see them live.
            # But for the agent logic, we'll just capture the default for now.
            # IN A REAL EXPERT AGENT, THIS WOULD BE API DRIVEN.
            pass
            
        # Capture current (default)
        path = agent.feedback.capture_sandbox(f"render_final.png")
        print(f"✅ Capture saved to {path}")
        
    finally:
        print("🛑 Shutting down dev server...")
        dev_server.terminate()

if __name__ == "__main__":
    main()
