import requests
from typing import Optional, Dict, Any
from config import settings


class PlaceService:
    """Wrapper around SerpApi Google Maps endpoints."""

    SERP_ENDPOINT = "https://serpapi.com/search.json"

    def __init__(self) -> None:
        self.api_key: Optional[str] = settings.serp_api_key

    def _ensure_key(self) -> None:
        if not self.api_key:
            raise ValueError("SERP_API_KEY is not configured on the server")

    def search_place(self, query: str, hl: str = "en", gl: Optional[str] = None) -> Dict[str, Any]:
        """
        Use SerpApi google_maps engine to resolve a free-text query to place results.

        Returns the raw SerpApi response with emphasis on local_results and place_results if present.
        """
        self._ensure_key()

        params: Dict[str, Any] = {
            "engine": "google_maps",
            "q": query,
            "hl": hl,
            "api_key": self.api_key,
            # type "search" is default for google_maps
        }
        if gl:
            params["gl"] = gl

        resp = requests.get(self.SERP_ENDPOINT, params=params, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        return data

    def place_by_id(self, place_id: str, hl: str = "en", gl: Optional[str] = None) -> Dict[str, Any]:
        """Get a specific place by Google place_id using SerpApi google_maps type=place."""
        self._ensure_key()

        params: Dict[str, Any] = {
            "engine": "google_maps",
            "type": "place",
            "place_id": place_id,
            "hl": hl,
            "api_key": self.api_key,
        }
        if gl:
            params["gl"] = gl

        resp = requests.get(self.SERP_ENDPOINT, params=params, timeout=20)
        resp.raise_for_status()
        return resp.json()


