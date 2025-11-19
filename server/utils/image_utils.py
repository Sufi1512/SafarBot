"""
Image Utilities - Convert Google image URLs to proxied URLs
"""

from typing import Dict, Any, List, Optional
from urllib.parse import quote
import logging

logger = logging.getLogger(__name__)

def proxy_image_url(url: Optional[str], backend_url: str = "http://localhost:8000") -> Optional[str]:
    """
    Convert a Google image URL to use our backend proxy
    
    Args:
        url: Original image URL (can be None)
        backend_url: Backend server URL (default: localhost for dev)
    
    Returns:
        Proxied URL or None if input is None
    """
    if not url:
        return None
    
    # If already proxied, return as is
    if "/images/proxy" in url:
        return url
    
    # If it's a Google image URL, proxy it
    if "googleusercontent.com" in url or "ggpht.com" in url:
        encoded_url = quote(url, safe='')
        return f"{backend_url}/images/proxy?url={encoded_url}"
    
    # For other URLs (e.g., SERP API's own proxied URLs), return as is
    return url


def proxy_place_images(place: Dict[str, Any], backend_url: str = "http://localhost:8000") -> Dict[str, Any]:
    """
    Convert all image URLs in a place object to use our proxy
    
    Args:
        place: Place dictionary with image URLs
        backend_url: Backend server URL
    
    Returns:
        Modified place dictionary with proxied URLs
    """
    # Proxy main thumbnail
    if place.get('thumbnail'):
        place['thumbnail'] = proxy_image_url(place['thumbnail'], backend_url)
    
    if place.get('serpapi_thumbnail'):
        place['serpapi_thumbnail'] = proxy_image_url(place['serpapi_thumbnail'], backend_url)
    
    if place.get('high_res_image'):
        place['high_res_image'] = proxy_image_url(place['high_res_image'], backend_url)
    
    # Proxy photos array
    if place.get('photos') and isinstance(place['photos'], list):
        for photo in place['photos']:
            if isinstance(photo, dict):
                if photo.get('thumbnail'):
                    photo['thumbnail'] = proxy_image_url(photo['thumbnail'], backend_url)
                if photo.get('image'):
                    photo['image'] = proxy_image_url(photo['image'], backend_url)
    
    return place


def proxy_all_images_in_response(response: Dict[str, Any], backend_url: str = "http://localhost:8000") -> Dict[str, Any]:
    """
    Convert ALL image URLs in the complete itinerary response to use our proxy
    
    Args:
        response: Complete itinerary response
        backend_url: Backend server URL
    
    Returns:
        Modified response with all proxied URLs
    """
    try:
        # Proxy place_details
        if response.get('place_details'):
            for place_id, place in response['place_details'].items():
                response['place_details'][place_id] = proxy_place_images(place, backend_url)
        
        # Proxy additional_places
        if response.get('additional_places'):
            for category, places in response['additional_places'].items():
                if isinstance(places, list):
                    response['additional_places'][category] = [
                        proxy_place_images(place, backend_url) for place in places
                    ]
        
        # Proxy photo_prefetch URLs
        if response.get('photo_prefetch') and response['photo_prefetch'].get('photo_urls'):
            response['photo_prefetch']['photo_urls'] = [
                proxy_image_url(url, backend_url) 
                for url in response['photo_prefetch']['photo_urls']
            ]
        
        logger.info(f"✅ Proxied all image URLs in response")
        
    except Exception as e:
        logger.error(f"❌ Error proxying images: {str(e)}")
    
    return response


def get_backend_url_from_request(request) -> str:
    """
    Get the backend URL from the request object
    
    Args:
        request: FastAPI Request object
    
    Returns:
        Backend base URL (e.g., http://localhost:8000 or https://api.safarbot.com)
    """
    if not request:
        return "http://localhost:8000"
    
    # Get scheme (http/https)
    scheme = request.url.scheme
    
    # Get host (includes port if non-standard)
    host = request.headers.get("host", request.url.netloc)
    
    return f"{scheme}://{host}"

