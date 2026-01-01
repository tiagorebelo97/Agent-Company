import os

# Define the global CSS content we created in the previous step
HUB_GLOBAL_CSS = """
/* 
 * MODERN DARK HUB - GLOBAL OVERRIDES 
 * Forces the aesthetic onto existing components without rewriting their JSX structure.
 */

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
  font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
  -webkit-font-smoothing: antialiased;
}

/* Force Cards to look like Hub Cards */
.card, .glass-card, .dashboard-card, .stat-card {
  background-color: var(--hub-card) !important;
  border: 1px solid var(--hub-border) !important;
  border-radius: 32px !important;
  box-shadow: none !important;
  color: var(--hub-text-main) !important;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  color: var(--hub-text-main) !important;
  font-weight: 900 !important;
  letter-spacing: -0.02em !important;
  text-transform: uppercase !important;
}

h1 { font-size: 2.5rem !important; }
h2 { font-size: 2rem !important; }
h3 { font-size: 1.5rem !important; }

/* Tables */
table {
  width: 100%;
  border-collapse: separate !important;
  border-spacing: 0 !important;
  border: 1px solid var(--hub-border) !important;
  border-radius: 20px !important;
  overflow: hidden !important;
  margin-top: 20px !important;
}

thead th {
  background-color: var(--hub-card) !important;
  color: var(--hub-text-muted) !important;
  font-size: 10px !important;
  font-weight: 900 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.2em !important;
  padding: 20px !important;
  border-bottom: 1px solid var(--hub-border) !important;
}

tbody td {
  padding: 20px !important;
  border-bottom: 1px solid var(--hub-border) !important;
  color: var(--hub-text-main) !important;
  font-size: 14px !important;
  font-weight: 500 !important;
}

tbody tr:last-child td {
  border-bottom: none !important;
}

/* Inputs */
input, select, textarea {
  background-color: #000000 !important;
  border: 1px solid var(--hub-border) !important;
  color: white !important;
  padding: 16px !important;
  border-radius: 16px !important;
  outline: none !important;
  font-size: 14px !important;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--hub-blue) !important;
  box-shadow: 0 0 0 1px var(--hub-blue) !important;
}

/* Buttons */
button, .btn, .btn-primary {
  background-color: white !important;
  color: black !important;
  font-weight: 900 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  padding: 12px 24px !important;
  border-radius: 16px !important;
  border: none !important;
  cursor: pointer !important;
  transition: transform 0.2s !important;
}

button:hover {
  transform: scale(1.02) !important;
}

/* Sidebar / Nav */
nav, .sidebar {
  background-color: var(--hub-card) !important;
  border-right: 1px solid var(--hub-border) !important;
}

a {
  color: var(--hub-text-muted) !important;
  text-decoration: none !important;
  transition: color 0.2s;
}

a:hover, a.active {
  color: white !important;
}

/* Scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: black;
}
::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}
"""

TARGET_APPS = [
    "super-admin-dashboard",
    "club-backoffice",
    "entry-web",
    "fan-pwa",
    "pos-web"
]

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../temp_reskin_workspace/apps"))

def inject_global_styles():
    print("🌍 Starting Global Hub Style Injection...")
    
    for app in TARGET_APPS:
        app_path = os.path.join(BASE_DIR, app)
        if not os.path.exists(app_path):
            print(f"⚠️ App directory not found: {app_path}")
            continue
            
        # 1. Write hub_global.css to src
        src_path = os.path.join(app_path, "src")
        css_path = os.path.join(src_path, "hub_global.css")
        
        try:
            with open(css_path, "w", encoding='utf-8') as f:
                f.write(HUB_GLOBAL_CSS)
            print(f"✅ Created hub_global.css in {app}")
        except Exception as e:
            print(f"❌ Failed to write CSS to {app}: {e}")
            continue

        # 2. Inject import into index.tsx or index.js
        index_file = None
        for candidate in ["index.tsx", "index.js", "main.tsx", "main.js"]:
            p = os.path.join(src_path, candidate)
            if os.path.exists(p):
                index_file = p
                break
        
        if index_file:
            with open(index_file, "r", encoding='utf-8') as f:
                content = f.read()
            
            if "hub_global.css" not in content:
                # Add import at the top
                new_content = "import './hub_global.css';\n" + content
                with open(index_file, "w", encoding='utf-8') as f:
                    f.write(new_content)
                print(f"💉 Injected import into {os.path.basename(index_file)}")
            else:
                print(f"⏩ Import already exists in {os.path.basename(index_file)}")
        else:
            print(f"⚠️ Could not find index entry point for {app}")

if __name__ == "__main__":
    inject_global_styles()
