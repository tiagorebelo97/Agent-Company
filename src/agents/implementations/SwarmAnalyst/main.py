import sys
import os

# Add parent directories to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../core')))

from base_agent import PythonBaseAgent
from core.logic import SwarmAnalyst

if __name__ == "__main__":
    agent = SwarmAnalyst()
    agent.run()
