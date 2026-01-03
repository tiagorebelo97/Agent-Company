# 🔴 PROBLEMA CRÍTICO: Sem Espaço em Disco

## Situação Atual

**Erro**: `OSError: [Errno 28] No space left on device`

Não é possível instalar a nova biblioteca `google-genai` porque o disco C: está cheio.

---

## Problema com Gemini

A biblioteca antiga `google.generativeai` está **deprecated** e não suporta modelos Gemini 1.5:
- ❌ `gemini-1.5-flash` → 404 error
- ❌ `gemini-1.5-flash-latest` → 404 error  
- ❌ `gemini-1.5-pro` → 404 error
- ⚠️ `gemini-pro` → Pode funcionar (modelo antigo)

---

## Soluções

### ✅ Opção 1: Libertar Espaço (RECOMENDADO)

1. **Limpar disco C:**
   - Temp files: `%TEMP%`
   - Downloads
   - Recycle Bin
   - Windows Update cache

2. **Instalar nova biblioteca:**
   ```powershell
   python -m pip install google-genai
   ```

3. **Reiniciar backend:**
   ```powershell
   npm run safe-restart
   ```

---

### Opção 2: Tentar Modelo Antigo

Usar `gemini-pro` (modelo deprecated mas pode funcionar):
- Já implementado no código
- Pode dar 404 também
- Não recomendado (Google vai desativar)

---

### Opção 3: Usar Outro LLM

Se tens API key de:
- **OpenAI** (GPT-4, GPT-3.5)
- **Anthropic** (Claude)
- **Cohere**
- **Mistral**

Posso integrar rapidamente.

---

### Opção 4: Desativar Temporariamente

Usar apenas keyword matching até resolver espaço:
- Funciona mas respostas limitadas
- Não é conversacional

---

## Recomendação

**Libertar ~500MB no disco C:** e instalar `google-genai`.

Isto resolve definitivamente o problema e permite usar Gemini 1.5 Flash (rápido e eficiente).

---

## Status Atual

- ✅ Chat funciona (keyword-based)
- ❌ Gemini AI não funciona (biblioteca antiga + sem espaço)
- ✅ Backend e Dashboard a correr
- ✅ Todos os agents online

**Aguardando decisão do utilizador.**
