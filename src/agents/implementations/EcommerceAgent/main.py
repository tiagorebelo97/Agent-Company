import sys
import os

# Add parent directories to path to import components
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../core')))

from base_agent import PythonBaseAgent
from core.logic import EcommerceAgent

if __name__ == "__main__":
    # Initialize and run the agent
    agent = EcommerceAgent()
    agent.run()
