import os
import json
from .vision import VisionAnalyzer
from .feedback import VisualFeedbackLoop

class DesignAgent:
    """The Expert Web Design Agent Core"""
    
    def __init__(self):
        self.vision = VisionAnalyzer()
        self.feedback = VisualFeedbackLoop()
        self.design_tokens = {}
        self.sandbox_path = os.path.join(os.getcwd(), "expert_design_agent", "sandbox")
        
    def analyze_inspiration(self, image_path):
        """Extract design tokens and mood from an inspiration image"""
        print(f"🎨 Analyzing inspiration: {image_path}")
        self.design_tokens = self.vision.extract_tokens(image_path)
        self.save_tokens()
        return self.design_tokens
        
    def save_tokens(self):
        token_path = os.path.join(self.sandbox_path, "src", "tokens.json")
        with open(token_path, "w") as f:
            json.dump(self.design_tokens, f, indent=2)
            
    def implement_design(self, task_description):
        """Produce a high-fidelity implementation in the dashboard"""
        print(f"🏗️ Implementing design: {task_description}")
        
        # Define the Hub Global CSS
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
        # Inject into the dashboard's index.css
        # Use a more reliable path detection
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        dashboard_css_path = os.path.join(base_dir, "apps", "dashboard", "src", "index.css")
        
        print(f"💉 Attempting to inject CSS into: {dashboard_css_path}")
        
        try:
            with open(dashboard_css_path, "w", encoding='utf-8') as f:
                f.write(HUB_GLOBAL_CSS)
            print("✅ Injection successful")
            return {"status": "success", "message": f"Dashboard reskinned. Path: {dashboard_css_path}"}
        except Exception as e:
            print(f"❌ Injection failed: {str(e)}")
            return {"status": "error", "message": str(e)}
        
    def critique_and_refine(self):
        """Visual feedback loop: Screenshot -> Analyze -> Fix"""
        print("🔍 Starting critique loop...")
        screenshot_path = self.feedback.capture_sandbox()
        critique = self.vision.analyze_fidelity(screenshot_path, self.design_tokens)
        
        if critique["fidelity_score"] < 0.9:
            print(f"🛠️ Refining design. Score: {critique['fidelity_score']}")
            # Implement fix logic here
            return False
        return True
