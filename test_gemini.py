import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

print("--- Listing All Available Models ---")
try:
    models = client.models.list()
    for m in models:
        print(f"Model: {m.name}")
        # check if it supports generation
        # (in the new library, we can just try one small call)
except Exception as e:
    print(f"Error listing models: {str(e)}")

print("\n--- Testing Specific Versions ---")
# Testing models confirmed to exist in the list
for model in ['models/gemini-2.0-flash', 'models/gemini-flash-latest', 'models/gemini-2.5-flash']:
    print(f"Testing {model}...")
    try:
        # Default behavior (v1beta)
        res = client.models.generate_content(model=model, contents="Oi, quem és?")
        print(f"  SUCCESS: {res.text[:50]}...")
    except Exception as e:
        print(f"  FAILED: {str(e)[:200]}")



