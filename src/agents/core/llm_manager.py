import os
import logging
import time
import random
try:
    import fcntl
except ImportError:
    fcntl = None
try:
    import msvcrt
except ImportError:
    msvcrt = None
from typing import Optional, List, Dict, Any
from enum import Enum
from dotenv import load_dotenv

# Load .env file explicitly
load_dotenv()

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
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                self.providers[LLMProvider.GEMINI] = genai
                logger.info("✓ Google Gemini initialized")
            except ImportError:
                logger.warning("Google Generative AI library not installed. Run: pip install google-generativeai")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini: {e}")
        
        if not self.providers:
            logger.warning("⚠️  No LLM providers initialized! Agents will use keyword fallback only.")
            
        # Shared lock file to limit concurrent calls across processes
        self.lock_file = os.path.join(os.getcwd(), '.llm_call.lock')
        self.cooldowns = {} # provider -> timestamp of last 429
    
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
                
                # Check cooldown
                if provider_enum in self.cooldowns:
                    if time.time() - self.cooldowns[provider_enum] < 30: # 30s cooldown
                        logger.warning(f"Skipping {provider_name} due to recent rate limit (cooldown active)")
                        continue
                
                # Wait for slot (limit aggregate concurrency to avoid burst limits)
                with self._get_slot_lock():
                    logger.info(f"Slot acquired. Calling {provider_name}...")
                    
                    if provider_enum == LLMProvider.ANTHROPIC:
                        result = self._call_anthropic(prompt, system_context, history)
                    elif provider_enum == LLMProvider.OPENAI:
                        result = self._call_openai(prompt, system_context, history)
                    elif provider_enum == LLMProvider.GEMINI:
                        result = self._call_gemini(prompt, system_context, history)
                    
                    if result: return result
                    
            except Exception as e:
                err_str = str(e)
                if "429" in err_str or "quota" in err_str.lower():
                    self.cooldowns[provider_enum] = time.time()
                logger.warning(f"{provider_name} failed: {err_str[:100]}")
                continue
        
        logger.error("All LLM providers failed or excluded")
        return None

    def _get_slot_lock(self):
        """Context manager for cross-process concurrency control"""
        class SlotLock:
            def __init__(self, path):
                self.path = path
                self.f = None
            def __enter__(self):
                self.f = open(self.path, 'w')
                if fcntl:
                    # Unix/Linux locking
                    fcntl.flock(self.f, fcntl.LOCK_EX)
                elif msvcrt:
                    # Windows locking
                    # Seek to start and lock 1 byte
                    self.f.seek(0)
                    # msvcrt.LK_LOCK blocks until the lock is acquired
                    # We use a very small file so 1 byte is enough
                    msvcrt.locking(self.f.fileno(), msvcrt.LK_LOCK, 1)
                
                # Sleep a tiny bit to avoid split-second overlaps
                time.sleep(0.5 + random.random()) 
            def __exit__(self, exc_type, exc_val, exc_tb):
                if self.f:
                    if fcntl:
                        fcntl.flock(self.f, fcntl.LOCK_UN)
                    elif msvcrt:
                        try:
                            self.f.seek(0)
                            msvcrt.locking(self.f.fileno(), msvcrt.LK_UNLCK, 1)
                        except:
                            pass
                    self.f.close()
        return SlotLock(self.lock_file)
    
    def _call_anthropic(self, prompt: str, system_context: str, history: Optional[List]) -> str:
        """Call Anthropic Claude API"""
        client = self.providers[LLMProvider.ANTHROPIC]
        
        # Build messages with history (TRIMMED)
        messages = []
        if history:
            for msg in history[-5:]:  # Last 5 messages
                role = "user" if msg.get('fromId') == 'user' else "assistant"
                content = msg.get('content', '')
                if len(str(content)) > 1000: content = str(content)[:1000] + "..."
                messages.append({"role": role, "content": content})
        
        trimmed_prompt = prompt if len(prompt) < 2000 else prompt[:2000] + "..."
        messages.append({"role": "user", "content": trimmed_prompt})
        
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
        
        # Build messages with history (TRIMMED)
        messages = [{"role": "system", "content": system_context}]
        
        if history:
            for msg in history[-5:]:
                role = "user" if msg.get('fromId') == 'user' else "assistant"
                content = msg.get('content', '')
                if len(str(content)) > 1000: content = str(content)[:1000] + "..."
                messages.append({"role": role, "content": content})
        
        trimmed_prompt = prompt if len(prompt) < 2000 else prompt[:2000] + "..."
        messages.append({"role": "user", "content": trimmed_prompt})
        
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=messages,
            max_tokens=1024
        )
        
        return response.choices[0].message.content
    
    def _call_gemini(self, prompt: str, system_context: str, history: Optional[List]) -> str:
        """Call Google Gemini API"""
        genai = self.providers[LLMProvider.GEMINI]
        
        # Build conversation with system context
        conversation_parts = []
        
        # Add system context as first message
        if system_context:
            conversation_parts.append(f"System: {system_context}\n")
        
        # Add history (TRIMMED to keep context small)
        if history:
            # Only keep last 5 messages for better control
            trimmed_history = history[-5:]
            for msg in trimmed_history:
                sender = "User" if msg.get('fromId') == 'user' else "Assistant"
                content = msg.get('content', '')
                # Truncate very long history messages
                if len(str(content)) > 1000:
                    content = str(content)[:1000] + "... [truncated]"
                conversation_parts.append(f"{sender}: {content}\n")
        
        # Add current prompt
        conversation_parts.append(f"User: {prompt}\nAssistant:")
        
        full_prompt = "\n".join(conversation_parts)
        
        # Try multiple Gemini models
        models_to_try = [
            'gemini-3-flash-preview',
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-flash-latest',
            'gemini-3-pro-preview'
        ]
        
        last_error = None
        for model_name in models_to_try:
            # Try each model only once to avoid wasting quota when rate limited
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(full_prompt)
                
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                last_error = e
                err_str = str(e)
                if "429" in err_str or "ResourceExhausted" in err_str:
                    logger.warning(f"Gemini {model_name} rate limited. Marking provider cooldown.")
                    # Re-raise to trigger the provider-level cooldown in generate_response
                    raise e
                
                logger.error(f"Gemini {model_name} failed: {type(e).__name__}")
                continue
        
        if last_error: raise last_error
        return None
