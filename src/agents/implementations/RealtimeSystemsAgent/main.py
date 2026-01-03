import sys
import os

# Ensure the local core directory is in the path
sys.path.append(os.path.dirname(__file__))
from core.logic import RealtimeSystemsAgent

if __name__ == "__main__":
    agent = RealtimeSystemsAgent()
    agent.run()
