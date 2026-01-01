import sys
import os

sys.path.append(os.path.dirname(__file__))
from core.logic import FrontendEngineer

if __name__ == "__main__":
    agent = FrontendEngineer()
    agent.run()
