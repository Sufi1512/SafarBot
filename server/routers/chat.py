from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from models import ChatRequest, ChatResponse, APIResponse
from services.chat_service import ChatService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

chat_service = ChatService()

@router.options("/chat")
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

@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(request: ChatRequest):
    """
    Chat with the AI travel planner
    """
    try:
        logger.info(f"Chat request received: {request.message[:50]}...")
        
        response = await chat_service.get_response(
            message=request.message,
            context=request.context
        )
        
        return ChatResponse(
            response=response,
            context=request.context
        )
        
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")

@router.get("/chat/history")
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