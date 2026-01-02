import os

class ExpertDesignSkill:
    def __init__(self, agent):
        self.agent = agent

    def execute(self, task):
        description = task.get('description', '')
        self.agent.log(f"ExpertDesignSkill executing: {description}")
        
        # Expert Hub Tokens
        HUB_GLOBAL_CSS = """
/* MODERN DARK HUB - GLOBAL OVERRIDES */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

:root {
  --hub-bg: #000000;
  --hub-card: #0a0a0a;
  --hub-border: rgba(255, 255, 255, 0.08);
  --hub-text-main: #ffffff;
  --hub-text-muted: #8A8A8A;
  --hub-blue: #2B81FF;
  --hub-success: #10b981;
}

body, #root {
  background-color: var(--hub-bg) !important;
  color: var(--hub-text-main) !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  margin: 0;
  min-height: 100vh;
}

.glass-card {
  background-color: var(--hub-card) !important;
  border: 1px solid var(--hub-border) !important;
  border-radius: 32px !important;
  backdrop-filter: blur(20px);
}

h1, h2, h3 {
  color: var(--hub-text-main) !important;
  font-weight: 900 !important;
  letter-spacing: -0.05em !important;
  text-transform: uppercase !important;
}

button {
  background-color: white !important;
  color: black !important;
  font-weight: 900 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  border-radius: 16px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255,255,255,0.2);
}
"""
        # Path resolution
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        dashboard_css_path = os.path.join(base_dir, "apps", "dashboard", "src", "index.css")
        
        try:
            with open(dashboard_css_path, "w", encoding='utf-8') as f:
                f.write(HUB_GLOBAL_CSS)
            return {"status": "success", "message": "Expert Hub styles applied autonomously"}
        except Exception as e:
            return {"status": "error", "message": f"Skill execution failed: {str(e)}"}
