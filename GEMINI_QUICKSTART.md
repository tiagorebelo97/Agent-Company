# 🚀 Quick Start: Gemini API em 5 Minutos

## 1️⃣ Obter API Key
```
https://aistudio.google.com/app/apikey
→ "Create API Key"
→ Copiar a key (AIzaSy...)
```

## 2️⃣ Adicionar ao .env
```bash
echo "GEMINI_API_KEY=AIzaSy_TUA_KEY_AQUI" >> .env
```

## 3️⃣ Instalar Biblioteca
```bash
source venv/bin/activate
pip install google-generativeai
```

## 4️⃣ Testar
```bash
python test_gemini.py
```

## 5️⃣ Reiniciar Backend
```bash
fuser -k 3001/tcp
PATH=$(pwd)/venv/bin:$PATH nohup node src/server.js > backend.log 2>&1 &
```

## ✅ Verificar
```bash
sleep 15
tail -n 50 backend.log | grep "CodeGenerator initialized"
```

**Deves ver**: `CodeGenerator initialized successfully`

---

**Ver guia completo**: [GEMINI_SETUP_GUIDE.md](file:///home/tiago/.gemini/antigravity/brain/128df164-6b0c-45dc-b91f-9cad538160c5/GEMINI_SETUP_GUIDE.md)
