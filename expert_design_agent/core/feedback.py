import os
import time
from playwright.sync_api import sync_playwright

class VisualFeedbackLoop:
    """Captures screenshots and manages the browser-based feedback loop"""
    
    def __init__(self, port=5173):
        self.url = f"http://localhost:{port}"
        self.screenshot_dir = os.path.join(os.getcwd(), "expert_design_agent", "screenshots")
        os.makedirs(self.screenshot_dir, exist_ok=True)
    
    def capture_sandbox(self, filename="sandbox_render.png"):
        """Takes a screenshot of the local sandbox using Playwright"""
        path = os.path.join(self.screenshot_dir, filename)
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            try:
                print(f"🌐 Navigating to {self.url}...")
                page.goto(self.url, wait_until="networkidle", timeout=30000)
                # Extra wait for Framer Motion animations to settle
                time.sleep(1) 
                
                print(f"📸 Capturing screenshot: {path}")
                page.screenshot(path=path, full_page=True)
                return path
            except Exception as e:
                print(f"❌ Failed to capture screenshot: {e}")
                return None
            finally:
                browser.close()
