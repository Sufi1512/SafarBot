"""
AI Usage Tracking Service
Tracks AI API calls, token usage, costs, and generation metrics
"""

import logging
import time
from typing import Dict, Any, Optional
from datetime import datetime
from fastapi import Request
from mongo_models import AIProvider, AITaskType
import json

logger = logging.getLogger(__name__)

class AITrackingService:
    """Service for tracking AI API usage and metrics"""
    
    # Token pricing per 1M tokens (as of 2024)
    # OpenAI pricing
    OPENAI_PRICING = {
        "gpt-4-turbo-preview": {"input": 10.0, "output": 30.0},  # $10/$30 per 1M tokens
        "gpt-4": {"input": 30.0, "output": 60.0},
        "gpt-3.5-turbo": {"input": 0.5, "output": 1.5},
    }
    
    # Gemini pricing (approximate)
    GEMINI_PRICING = {
        "gemini-2.5-flash": {"input": 0.075, "output": 0.30},  # $0.075/$0.30 per 1M tokens
        "gemini-pro": {"input": 0.50, "output": 1.50},
    }
    
    @staticmethod
    def calculate_cost(
        provider: AIProvider,
        model: str,
        prompt_tokens: int,
        completion_tokens: int
    ) -> float:
        """Calculate estimated cost for AI usage"""
        pricing_map = {
            AIProvider.OPENAI: AITrackingService.OPENAI_PRICING,
            AIProvider.GEMINI: AITrackingService.GEMINI_PRICING,
        }
        
        pricing = pricing_map.get(provider, {})
        model_pricing = pricing.get(model, {"input": 0.0, "output": 0.0})
        
        input_cost = (prompt_tokens / 1_000_000) * model_pricing["input"]
        output_cost = (completion_tokens / 1_000_000) * model_pricing["output"]
        
        return input_cost + output_cost
    
    @staticmethod
    async def log_ai_usage(
        provider: AIProvider,
        model: str,
        task_type: AITaskType,
        prompt_tokens: int,
        completion_tokens: int,
        prompt_text: str,
        response_text: str,
        api_endpoint: str,
        http_method: str,
        request: Optional[Request] = None,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        request_params: Optional[Dict[str, Any]] = None,
        response_metadata: Optional[Dict[str, Any]] = None,
        success: bool = True,
        error_message: Optional[str] = None,
        response_time_ms: Optional[float] = None
    ) -> Optional[str]:
        """
        Log AI usage to terminal (console output)
        """
        try:
            # Calculate metrics
            total_tokens = prompt_tokens + completion_tokens
            estimated_cost = AITrackingService.calculate_cost(
                provider, model, prompt_tokens, completion_tokens
            )
            
            # Extract user info from request if available
            client_ip = None
            user_agent = None
            if request:
                client_ip = request.client.host if request.client else None
                user_agent = request.headers.get("user-agent")
            
            # Extract destination from request params if available
            destination = None
            if request_params:
                destination = request_params.get("destination")
            
            # Format terminal output
            print("\n" + "="*80)
            print("🤖 AI USAGE TRACKING")
            print("="*80)
            print(f"Provider: {provider.value.upper()}")
            print(f"Model: {model}")
            print(f"Task: {task_type.value}")
            print(f"Endpoint: {http_method} {api_endpoint}")
            print(f"Status: {'✅ SUCCESS' if success else '❌ FAILED'}")
            if error_message:
                print(f"Error: {error_message}")
            print("-"*80)
            print(f"📊 TOKEN USAGE:")
            print(f"   Prompt tokens: {prompt_tokens:,}")
            print(f"   Completion tokens: {completion_tokens:,}")
            print(f"   Total tokens: {total_tokens:,}")
            print(f"💰 ESTIMATED COST: ${estimated_cost:.6f} USD")
            print("-"*80)
            print(f"📏 SIZE METRICS:")
            print(f"   Prompt length: {len(prompt_text):,} characters")
            print(f"   Response length: {len(response_text):,} characters")
            if response_time_ms:
                print(f"⏱️  RESPONSE TIME: {response_time_ms:.2f} ms")
            print("-"*80)
            if destination:
                print(f"🌍 Destination: {destination}")
            if user_id:
                print(f"👤 User ID: {user_id}")
            if user_email:
                print(f"📧 User Email: {user_email}")
            if client_ip:
                print(f"🌐 Client IP: {client_ip}")
            if response_metadata:
                print(f"📋 Metadata: {json.dumps(response_metadata, indent=2)}")
            print("-"*80)
            print(f"🤖 AI GENERATED CONTENT:")
            print("-"*80)
            # Show the generated response (truncate if too long)
            if response_text:
                max_display_length = 3000  # Show first 3000 characters
                display_text = response_text
                
                # Try to format JSON if it looks like JSON
                is_json = False
                if response_text.strip().startswith('{') or response_text.strip().startswith('['):
                    try:
                        parsed = json.loads(response_text)
                        display_text = json.dumps(parsed, indent=2, ensure_ascii=False)
                        is_json = True
                    except:
                        pass  # Not valid JSON, display as-is
                
                if len(display_text) > max_display_length:
                    # Truncate but try to keep it at a reasonable point
                    truncated = display_text[:max_display_length]
                    # Try to find a good breaking point (newline, comma, etc.)
                    last_newline = truncated.rfind('\n')
                    last_comma = truncated.rfind(',')
                    last_brace = truncated.rfind('}')
                    break_point = max(last_newline, last_comma, last_brace)
                    if break_point > max_display_length * 0.8:  # Only use if it's not too early
                        truncated = display_text[:break_point + 1]
                    
                    print(truncated)
                    print(f"\n... (truncated, showing {len(truncated):,} of {len(display_text):,} characters)")
                    print(f"   Full response length: {len(response_text):,} characters")
                else:
                    print(display_text)
                    if is_json:
                        print(f"\n   ✓ Valid JSON format")
            else:
                print("(No response content)")
            print("="*80 + "\n")
            
            # Also log to logger for file logging
            time_str = f"Time: {response_time_ms:.0f}ms | " if response_time_ms else ""
            logger.info(
                f"AI Usage | {provider.value}/{model} | "
                f"Tokens: {total_tokens} ({prompt_tokens}+{completion_tokens}) | "
                f"Cost: ${estimated_cost:.6f} | "
                f"{time_str}{api_endpoint}"
            )
            
            return "logged_to_terminal"
            
        except Exception as e:
            logger.error(f"Failed to log AI usage: {str(e)}")
            print(f"❌ Error logging AI usage: {str(e)}")
            return None
    
    @staticmethod
    async def get_usage_stats(
        user_id: Optional[str] = None,
        provider: Optional[AIProvider] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get aggregated AI usage statistics - Not available (using terminal logging)"""
        return {
            "message": "Usage statistics not available - AI usage is logged to terminal only",
            "total_requests": 0,
            "total_tokens": 0,
            "total_prompt_tokens": 0,
            "total_completion_tokens": 0,
            "total_cost_usd": 0.0,
            "avg_response_time_ms": 0.0,
            "successful_requests": 0,
            "failed_requests": 0
        }

# Global instance
ai_tracking_service = AITrackingService()

