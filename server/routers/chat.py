from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from models import ChatRequest, ChatResponse, APIResponse
from services.chat_service import ChatService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

chat_service = ChatService()

@router.options("/")
async def chat_options():
    """
    Handle OPTIONS requests for CORS preflight
    """
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        }
    )

@router.post("/", response_model=ChatResponse)
async def chat_with_bot(request_body: ChatRequest, http_request: Request):
    """
    Chat with the AI travel planner
    """
    try:
        logger.info(f"💬 CHAT API - Request received: {request_body.message[:50]}...")
        logger.info(f"   📍 Endpoint: /chat | Method: POST")
        logger.info(f"   👤 User: {getattr(http_request.state, 'user_id', 'Anonymous')}")
        logger.info(f"   📝 Message length: {len(request_body.message)} chars")
        
        response = await chat_service.get_response(
            message=request_body.message,
            context=request_body.context,
            request=http_request
        )
        
        logger.info(f"✅ CHAT API - Response generated: {len(response)} chars")
        
        return ChatResponse(
            response=response,
            context=request_body.context
        )
        
    except Exception as e:
        logger.error(f"❌ CHAT API - Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")

@router.get("/history")
async def get_chat_history():
    """
    Get chat history (for future implementation)
    """
    try:
        # This would typically fetch from a database
        return APIResponse(
            success=True,
            message="Chat history retrieved successfully",
            data={"messages": []}  # Placeholder
        )
        
    except Exception as e:
        logger.error(f"Error getting chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get chat history: {str(e)}") 