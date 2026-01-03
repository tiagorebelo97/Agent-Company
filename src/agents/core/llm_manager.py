import os
import logging
from typing import Optional, List, Dict, Any
from enum import Enum

logger = logging.getLogger(__name__)

class LLMProvider(Enum):
    """Supported LLM providers"""
    ANTHROPIC = "anthropic"
    OPENAI = "openai"
    GEMINI = "gemini"

class LLMManager:
    """
    Unified LLM manager that abstracts multiple AI providers.
    Supports Anthropic Claude, OpenAI GPT, and Google Gemini with intelligent fallback.
    """
    
    def __init__(self):
        self.providers = {}
        self.provider_priority = []
        
        # Parse priority from env (default: anthropic,gemini,openai)
        priority_str = os.getenv('LLM_PRIORITY', 'anthropic,gemini,openai')
        self.provider_priority = [p.strip() for p in priority_str.split(',')]
        
        # Initialize Anthropic Claude
        anthropic_key = os.getenv('ANTHROPIC_API_KEY')
        if anthropic_key:
            try:
                from anthropic import Anthropic
                self.providers[LLMProvider.ANTHROPIC] = Anthropic(api_key=anthropic_key)
                logger.info("✓ Anthropic Claude initialized")
            except ImportError:
                logger.warning("Anthropic library not installed. Run: pip install anthropic")
            except Exception as e:
                logger.error(f"Failed to initialize Anthropic: {e}")
        
        # Initialize OpenAI GPT
        openai_key = os.getenv('OPENAI_API_KEY')
        if openai_key:
            try:
                from openai import OpenAI
                self.providers[LLMProvider.OPENAI] = OpenAI(api_key=openai_key)
                logger.info("✓ OpenAI GPT initialized")
            except ImportError:
                logger.warning("OpenAI library not installed. Run: pip install openai")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI: {e}")
        
        # Initialize Google Gemini
        gemini_key = os.getenv('GEMINI_API_KEY')
        if gemini_key:
            try:
                from google import genai
                self.providers[LLMProvider.GEMINI] = genai.Client(api_key=gemini_key)
                logger.info("✓ Google Gemini initialized")
            except ImportError:
                logger.warning("Google GenAI library not installed. Run: pip install google-genai")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini: {e}")
        
        if not self.providers:
            logger.warning("⚠️  No LLM providers initialized! Agents will use keyword fallback only.")
    
    def generate_response(
        self, 
        prompt: str, 
        system_context: str = "",
        history: Optional[List[Dict]] = None,
        provider_override: Optional[str] = None
    ) -> Optional[str]:
        """
        Generate a response using the first available LLM provider.
        
        Args:
            prompt: User message
            system_context: System/agent context
            history: Conversation history (for context)
            provider_override: Force specific provider (e.g., 'anthropic')
        
        Returns:
            Generated response text or None if all providers fail
        """
        # Determine provider order
        if provider_override and provider_override in [p.value for p in LLMProvider]:
            priority = [provider_override] + [p for p in self.provider_priority if p != provider_override]
        else:
            priority = self.provider_priority
        
        # Try each provider in order
        for provider_name in priority:
            try:
                provider_enum = LLMProvider(provider_name)
                
                if provider_enum not in self.providers:
                    continue
                
                logger.info(f"Trying {provider_name}...")
                
                if provider_enum == LLMProvider.ANTHROPIC:
                    return self._call_anthropic(prompt, system_context, history)
                elif provider_enum == LLMProvider.OPENAI:
                    return self._call_openai(prompt, system_context, history)
                elif provider_enum == LLMProvider.GEMINI:
                    return self._call_gemini(prompt, system_context, history)
                    
            except Exception as e:
                logger.warning(f"{provider_name} failed: {str(e)[:100]}")
                continue
        
        logger.error("All LLM providers failed")
        return None
    
    def _call_anthropic(self, prompt: str, system_context: str, history: Optional[List]) -> str:
        """Call Anthropic Claude API"""
        client = self.providers[LLMProvider.ANTHROPIC]
        
        # Build messages with history
        messages = []
        if history:
            for msg in history[-10:]:  # Last 10 messages
                role = "user" if msg.get('fromId') == 'user' else "assistant"
                messages.append({"role": role, "content": msg.get('content', '')})
        
        messages.append({"role": "user", "content": prompt})
        
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            system=system_context,
            messages=messages
        )
        
        return response.content[0].text
    
    def _call_openai(self, prompt: str, system_context: str, history: Optional[List]) -> str:
        """Call OpenAI GPT API"""
        client = self.providers[LLMProvider.OPENAI]
        
        # Build messages with history
        messages = [{"role": "system", "content": system_context}]
        
        if history:
            for msg in history[-10:]:
                role = "user" if msg.get('fromId') == 'user' else "assistant"
                messages.append({"role": role, "content": msg.get('content', '')})
        
        messages.append({"role": "user", "content": prompt})
        
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=messages,
            max_tokens=1024
        )
        
        return response.choices[0].message.content
    
    def _call_gemini(self, prompt: str, system_context: str, history: Optional[List]) -> str:
        """Call Google Gemini API with fallback models"""
        client = self.providers[LLMProvider.GEMINI]
        
        # Build full prompt with history
        prompt_parts = [system_context, "\nCONVERSATION HISTORY:"]
        
        if history:
            for msg in history[-10:]:
                sender = "User" if msg.get('fromId') == 'user' else "Agent"
                prompt_parts.append(f"{sender}: {msg.get('content')}")
        
        prompt_parts.append(f"\nUser: {prompt}\nAgent:")
        full_prompt = "\n".join(prompt_parts)
        
        # Try multiple Gemini models
        models_to_try = [
            'models/gemini-1.5-flash',
            'models/gemini-flash-latest',
            'models/gemini-1.5-pro-latest',
            'models/gemini-pro'
        ]
        
        for model_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=full_prompt
                )
                
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                logger.debug(f"Gemini {model_name} failed: {str(e)[:50]}")
                continue
        
        raise Exception("All Gemini models failed")
