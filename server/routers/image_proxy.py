"""
Image Proxy Router - Proxy images through backend to avoid rate limits
This solves the 429 Too Many Requests issue from Google Images
"""

import logging
import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from typing import Optional
import hashlib
from services.cache_service import cache_service

logger = logging.getLogger(__name__)
router = APIRouter()

# Cache images for 24 hours
IMAGE_CACHE_TTL = 86400

@router.get("/proxy")
async def proxy_image(url: str = Query(..., description="Image URL to proxy")):
    """
    Proxy an image through the backend to avoid rate limits
    
    This endpoint:
    1. Caches images to reduce external requests
    2. Bypasses Google's rate limiting by proxying through our server
    3. Returns proper image content-type headers
    """
    
    if not url:
        raise HTTPException(status_code=400, detail="URL parameter is required")
    
    # Create cache key from URL
    cache_key = f"image_proxy:{hashlib.md5(url.encode()).hexdigest()}"
    
    try:
        # Check cache first
        cached_image = await cache_service.get("image_cache", cache_key, {})
        if cached_image:
            logger.info(f"✅ Image cache HIT: {url[:50]}...")
            return Response(
                content=cached_image.get("content"),
                media_type=cached_image.get("content_type", "image/jpeg"),
                headers={
                    "Cache-Control": "public, max-age=86400",
                    "X-Cache": "HIT"
                }
            )
        
        # Fetch image from source
        logger.info(f"📥 Fetching image: {url[:50]}...")
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                url,
                follow_redirects=True,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
                    "Referer": "https://www.google.com/"
                }
            )
            
            if response.status_code != 200:
                logger.warning(f"⚠️  Failed to fetch image: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to fetch image: {response.status_code}"
                )
            
            content = response.content
            content_type = response.headers.get("content-type", "image/jpeg")
            
            # Cache the image
            await cache_service.set(
                "image_cache",
                cache_key,
                {
                    "content": content,
                    "content_type": content_type
                },
                ttl=IMAGE_CACHE_TTL,
                params={}
            )
            
            logger.info(f"✅ Image fetched and cached: {len(content)} bytes")
            
            return Response(
                content=content,
                media_type=content_type,
                headers={
                    "Cache-Control": "public, max-age=86400",
                    "X-Cache": "MISS"
                }
            )
    
    except httpx.TimeoutException:
        logger.error(f"⏱️  Timeout fetching image: {url[:50]}...")
        raise HTTPException(status_code=504, detail="Image fetch timeout")
    
    except Exception as e:
        logger.error(f"❌ Error proxying image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to proxy image: {str(e)}")


@router.get("/health")
async def image_proxy_health():
    """Health check for image proxy"""
    return {
        "status": "healthy",
        "service": "image_proxy",
        "cache_enabled": True
    }

