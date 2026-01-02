import urllib.request
import json
import time

API_URL = "http://localhost:3001/api"

def make_request(url, method='GET', data=None):
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        data = json.dumps(data).encode('utf-8')
    
    with urllib.request.urlopen(req, data=data) as response:
        return json.loads(response.read().decode('utf-8'))

def test_expansion():
    print("🚀 Starting Swarm Expansion Test...")
    
    new_agent_config = {
        "id": "swarm_analyst",
        "name": "Swarm Analyst",
        "role": "Analyzes swarm efficiency and suggests optimizations",
        "category": "ai",
        "skills": ["Data Analysis", "Optimization", "Trend Spotting"]
    }
    
    task = {
        "type": "scaffold_agent",
        "description": f"Create a new {new_agent_config['name']} to help optimize the swarm.",
        "requirements": new_agent_config,
        "targetAgent": "architect"
    }
    
    print(f"📡 Sending task to Technical Architect...")
    try:
        response = make_request(f"{API_URL}/tasks", method='POST', data=task)
        print("✅ Task submitted successfully!")
        
        print("⏳ Waiting for Autonomous Scaffolding and Hot-Reload (approx 5s)...")
        for _ in range(10):
            time.sleep(1)
            try:
                agents_res = make_request(f"{API_URL}/agents")
                agents = agents_res.get('agents', [])
                found = any(a['id'] == 'swarm_analyst' for a in agents)
                if found:
                    print(f"✨ SUCCESS! 'Swarm Analyst' is now ONLINE and registered in the swarm.")
                    print("\nLatest Agents in Registry:")
                    for a in agents[-3:]:
                         print(f"- {a['name']} ({a['status']})")
                    return
            except Exception as e:
                print(f"Waiting for server... ({str(e)})")
        
        print("❌ Timeout: Agent was not registered.")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_expansion()
