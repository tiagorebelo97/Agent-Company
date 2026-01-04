#!/usr/bin/env python3
"""
Test Gemini API Configuration
Verifica se a API key está configurada corretamente
"""

import os
import sys
from pathlib import Path

# Adicionar diretório do projeto ao path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def test_env_file():
    """Verifica se .env existe e tem GEMINI_API_KEY"""
    env_file = project_root / '.env'
    
    if not env_file.exists():
        print("❌ Ficheiro .env não encontrado!")
        print(f"   Esperado em: {env_file}")
        return False
    
    print(f"✅ Ficheiro .env encontrado: {env_file}")
    
    # Ler .env
    with open(env_file, 'r') as f:
        content = f.read()
    
    if 'GEMINI_API_KEY' not in content:
        print("❌ GEMINI_API_KEY não encontrada no .env")
        print("\n💡 Adiciona esta linha ao .env:")
        print("   GEMINI_API_KEY=AIzaSy_TUA_KEY_AQUI")
        return False
    
    print("✅ GEMINI_API_KEY encontrada no .env")
    return True

def test_dotenv():
    """Testa se python-dotenv está instalado"""
    try:
        from dotenv import load_dotenv
        print("✅ python-dotenv instalado")
        load_dotenv()
        return True
    except ImportError:
        print("⚠️  python-dotenv não instalado (opcional)")
        print("   pip install python-dotenv")
        return False

def test_library():
    """Testa se google-generativeai está instalado"""
    try:
        import google.generativeai as genai
        print("✅ google-generativeai instalado")
        return True
    except ImportError:
        print("❌ google-generativeai NÃO instalado")
        print("\n💡 Instala com:")
        print("   source venv/bin/activate")
        print("   pip install google-generativeai")
        return False

def test_api_key():
    """Testa se a API key está acessível"""
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        print("❌ GEMINI_API_KEY não encontrada nas variáveis de ambiente")
        print("\n💡 Certifica-te que:")
        print("   1. Adicionaste ao .env: GEMINI_API_KEY=...")
        print("   2. Reiniciaste o terminal/backend")
        return False
    
    if len(api_key) < 30:
        print(f"⚠️  API key parece curta: {len(api_key)} caracteres")
        print("   (Esperado: ~39 caracteres)")
    
    print(f"✅ API Key carregada: {api_key[:20]}... ({len(api_key)} chars)")
    return True

def test_connection():
    """Testa conexão com Gemini API"""
    try:
        import google.generativeai as genai
        
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            return False
        
        print("\n🧪 Testando conexão com Gemini API...")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        response = model.generate_content("Say 'Hello' in Portuguese")
        
        print(f"✅ SUCESSO! Resposta: {response.text[:100]}...")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")
        
        if "API_KEY_INVALID" in str(e):
            print("\n💡 API Key inválida!")
            print("   1. Verifica que copiaste a key completa")
            print("   2. Cria nova key em: https://aistudio.google.com/app/apikey")
        elif "QUOTA_EXCEEDED" in str(e):
            print("\n💡 Quota excedida (15 requests/min no tier gratuito)")
            print("   Aguarda 1 minuto e tenta novamente")
        
        return False

def main():
    print("=" * 60)
    print("🔍 Verificação da Configuração do Gemini API")
    print("=" * 60)
    print()
    
    results = {
        "Ficheiro .env": test_env_file(),
        "python-dotenv": test_dotenv(),
        "google-generativeai": test_library(),
        "API Key": test_api_key(),
    }
    
    print()
    print("=" * 60)
    
    if all(results.values()):
        results["Conexão com API"] = test_connection()
    
    print()
    print("=" * 60)
    print("📊 RESUMO")
    print("=" * 60)
    
    for test, passed in results.items():
        status = "✅" if passed else "❌"
        print(f"{status} {test}")
    
    print()
    
    if all(results.values()):
        print("🎉 TUDO CONFIGURADO CORRETAMENTE!")
        print()
        print("Próximos passos:")
        print("1. Reinicia o backend: fuser -k 3001/tcp && ...")
        print("2. Cria uma tarefa: node create_task_simple.js")
        print("3. Verifica logs: grep 'CodeGenerator initialized' backend.log")
        return 0
    else:
        print("⚠️  Algumas verificações falharam")
        print()
        print("Ver guia completo:")
        print("  cat GEMINI_QUICKSTART.md")
        return 1

if __name__ == '__main__':
    sys.exit(main())
