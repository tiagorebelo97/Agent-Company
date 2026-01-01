import sys
import os

sys.path.append(os.path.dirname(__file__))
from core.logic import BackendEngineer

if __name__ == "__main__":
    agent = BackendEngineer()
    agent.run()
