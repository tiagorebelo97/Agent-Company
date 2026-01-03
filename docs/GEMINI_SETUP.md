# Quick Setup: Gemini API for Agent Chat

## 1. Get Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

## 2. Add to .env file

Open `d:\Projetos\Agent-Company\.env` and add:

```env
GEMINI_API_KEY=your_api_key_here
```

## 3. Restart System

```powershell
npm run stop-all
npm run restart
```

## 4. Test

1. Open dashboard: http://localhost:5173
2. Click on Project Manager
3. Ask ANY question:
   - "What do you think about microservices?"
   - "How should I structure a React app?"
   - "Explain agile methodology"
   - "What's the best way to test APIs?"

The agent will now respond naturally to ANY question, not just keywords!

## Fallback

If Gemini API is not configured, the agent will fall back to keyword matching (current behavior).
