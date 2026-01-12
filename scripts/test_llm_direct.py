import sys
import os

# Add paths
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/agents/core')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/agents/llm')))

from llm_manager import LLMManager, LLMProvider

def test_llm():
    print("🧪 Testing LLM Manager directly...\n")
    
    # Initialize LLM Manager
    llm_manager = LLMManager()
    llm_manager.initialize([LLMProvider.GEMINI])
    
    print("✅ LLM Manager initialized\n")
    
    # Test prompt
    prompt = """
    Analyze this project and suggest 3 incremental IMPROVEMENTS.
    
    Project: Mason - A modern web application
    Business Model: SaaS platform for developers
    
    Return a JSON array of objects:
    [
      {
        "title": "...",
        "description": "...",
        "priority": "high/medium/low",
        "category": "Features to Improve"
      }
    ]
    """
    
    print("📝 Sending prompt to LLM...\n")
    
    try:
        response = llm_manager.generate_response(
            prompt=prompt,
            system_context="You are a Product Manager. Return ONLY valid JSON array, no markdown formatting."
        )
        
        print(f"✅ Got response!")
        print(f"Type: {type(response)}")
        print(f"Length: {len(str(response))}")
        print(f"\nResponse:\n{'-'*80}")
        print(response)
        print(f"{'-'*80}\n")
        
        # Try to parse
        import json, re
        match = re.search(r'\[.*\]', str(response), re.DOTALL)
        if match:
            print("✅ Found JSON array in response")
            parsed = json.loads(match.group())
            print(f"✅ Successfully parsed {len(parsed)} items\n")
            for i, item in enumerate(parsed, 1):
                print(f"{i}. {item.get('title', 'No title')}")
        else:
            print("❌ No JSON array found in response")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_llm()
