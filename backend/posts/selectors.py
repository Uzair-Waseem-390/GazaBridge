"""
Selectors
=========
Pure read layer — no writes, no side effects.
With Redis caching integration (DB 1).

Caching Strategy:
- Single items: cached 1 hour, invalidated on update/delete
- Filtered lists: cached 5 minutes, first 10 pages only
- On any write: ALL list caches are flushed (aggressive invalidation for 100% consistency)
"""

import hashlib
from typing import Optional, Any, List

from django.core.cache import cache
from django.db.models import QuerySet, Q

from posts.models import Offer, Request


# Redis cache configuration (DB 1)
CACHE_TTL_SINGLE = 3600   # 1 hour for single items
CACHE_TTL_LIST = 300      # 5 minutes for filtered lists
MAX_CACHED_PAGES = 10     # Only cache first 10 pages


def get_cache_key(prefix: str, identifier: Any) -> str:
    """Generate a consistent cache key."""
    return f"posts:{prefix}:{identifier}"


# ---------------------------------------------------------------------------
# Offer Selectors
# ---------------------------------------------------------------------------

def get_offer_by_id(offer_id: int) -> Optional[Offer]:
    """
    Get a single offer by ID with caching.
    Cache TTL: 1 hour. Invalidated on update/delete.
    """
    cache_key = get_cache_key("offer", offer_id)
    offer = cache.get(cache_key)
    
    if offer is None:
        offer = (
            Offer.objects
            .select_related("user")
            .filter(pk=offer_id)
            .first()
        )
        if offer:
            cache.set(cache_key, offer, timeout=CACHE_TTL_SINGLE)
    
    return offer


def get_offers_queryset(
    category: Optional[str] = None,
    availability: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    search: Optional[str] = None,
    ordering: str = "-created_at"
) -> QuerySet:
    """
    Get offers queryset with optional filters.
    Returns QuerySet so DRF can handle pagination.
    No caching here — caching happens at the paginated response level via cache_page_list.
    """
    queryset = Offer.objects.select_related("user").all()
    
    if category:
        queryset = queryset.filter(category=category)
    
    if availability:
        queryset = queryset.filter(availability=availability)
    
    if status:
        queryset = queryset.filter(status=status)
    
    if user_id:
        queryset = queryset.filter(user_id=user_id)
    
    if search:
        queryset = queryset.filter(
            Q(offer_name__icontains=search) |
            Q(description__icontains=search)
        )
    
    queryset = queryset.order_by(ordering)
    
    return queryset


def get_cached_offer_list(
    category: Optional[str] = None,
    availability: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    search: Optional[str] = None,
    ordering: str = "-created_at",
    page: int = 1,
    page_size: int = 20
) -> Optional[List[Offer]]:
    """
    Get cached offer list for a specific page/filter combination.
    Only caches pages 1 through MAX_CACHED_PAGES.
    
    Returns None if:
    - Page > MAX_CACHED_PAGES (don't cache)
    - Cache miss (caller should fetch from DB and cache it)
    """
    if page > MAX_CACHED_PAGES:
        return None
    
    # Build unique cache key from all parameters
    raw_key = (
        f"offers_list|cat:{category or 'all'}|"
        f"avail:{availability or 'all'}|"
        f"status:{status or 'all'}|"
        f"user:{user_id or 'all'}|"
        f"search:{search or 'none'}|"
        f"order:{ordering}|"
        f"page:{page}|"
        f"size:{page_size}"
    )
    cache_key_hash = hashlib.md5(raw_key.encode()).hexdigest()
    cache_key = get_cache_key("offers_list", cache_key_hash)
    
    return cache.get(cache_key)


def set_cached_offer_list(
    offers: List[Offer],
    category: Optional[str] = None,
    availability: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    search: Optional[str] = None,
    ordering: str = "-created_at",
    page: int = 1,
    page_size: int = 20
) -> None:
    """
    Cache an offer list result.
    Only caches pages 1 through MAX_CACHED_PAGES.
    """
    if page > MAX_CACHED_PAGES:
        return
    
    raw_key = (
        f"offers_list|cat:{category or 'all'}|"
        f"avail:{availability or 'all'}|"
        f"status:{status or 'all'}|"
        f"user:{user_id or 'all'}|"
        f"search:{search or 'none'}|"
        f"order:{ordering}|"
        f"page:{page}|"
        f"size:{page_size}"
    )
    cache_key_hash = hashlib.md5(raw_key.encode()).hexdigest()
    cache_key = get_cache_key("offers_list", cache_key_hash)
    
    cache.set(cache_key, offers, timeout=CACHE_TTL_LIST)


# ---------------------------------------------------------------------------
# Request Selectors
# ---------------------------------------------------------------------------

def get_request_by_id(request_id: int) -> Optional[Request]:
    """
    Get a single request by ID with caching.
    Cache TTL: 1 hour. Invalidated on update/delete.
    """
    cache_key = get_cache_key("request", request_id)
    request_obj = cache.get(cache_key)
    
    if request_obj is None:
        request_obj = (
            Request.objects
            .select_related("user")
            .filter(pk=request_id)
            .first()
        )
        if request_obj:
            cache.set(cache_key, request_obj, timeout=CACHE_TTL_SINGLE)
    
    return request_obj


def get_requests_queryset(
    category: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    search: Optional[str] = None,
    ordering: str = "-created_at"
) -> QuerySet:
    """
    Get requests queryset with optional filters.
    Returns QuerySet so DRF can handle pagination.
    No caching here — caching happens at the paginated response level via cache_page_list.
    """
    queryset = Request.objects.select_related("user").all()
    
    if category:
        queryset = queryset.filter(category=category)
    
    if status:
        queryset = queryset.filter(status=status)
    
    if user_id:
        queryset = queryset.filter(user_id=user_id)
    
    if search:
        queryset = queryset.filter(
            Q(request_name__icontains=search) |
            Q(description__icontains=search)
        )
    
    queryset = queryset.order_by(ordering)
    
    return queryset


def get_cached_request_list(
    category: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    search: Optional[str] = None,
    ordering: str = "-created_at",
    page: int = 1,
    page_size: int = 20
) -> Optional[List[Request]]:
    """
    Get cached request list for a specific page/filter combination.
    Only caches pages 1 through MAX_CACHED_PAGES.
    
    Returns None if:
    - Page > MAX_CACHED_PAGES (don't cache)
    - Cache miss (caller should fetch from DB and cache it)
    """
    if page > MAX_CACHED_PAGES:
        return None
    
    raw_key = (
        f"requests_list|cat:{category or 'all'}|"
        f"status:{status or 'all'}|"
        f"user:{user_id or 'all'}|"
        f"search:{search or 'none'}|"
        f"order:{ordering}|"
        f"page:{page}|"
        f"size:{page_size}"
    )
    cache_key_hash = hashlib.md5(raw_key.encode()).hexdigest()
    cache_key = get_cache_key("requests_list", cache_key_hash)
    
    return cache.get(cache_key)


def set_cached_request_list(
    requests: List[Request],
    category: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    search: Optional[str] = None,
    ordering: str = "-created_at",
    page: int = 1,
    page_size: int = 20
) -> None:
    """
    Cache a request list result.
    Only caches pages 1 through MAX_CACHED_PAGES.
    """
    if page > MAX_CACHED_PAGES:
        return
    
    raw_key = (
        f"requests_list|cat:{category or 'all'}|"
        f"status:{status or 'all'}|"
        f"user:{user_id or 'all'}|"
        f"search:{search or 'none'}|"
        f"order:{ordering}|"
        f"page:{page}|"
        f"size:{page_size}"
    )
    cache_key_hash = hashlib.md5(raw_key.encode()).hexdigest()
    cache_key = get_cache_key("requests_list", cache_key_hash)
    
    cache.set(cache_key, requests, timeout=CACHE_TTL_LIST)


# ---------------------------------------------------------------------------
# Cache Invalidation (Aggressive — flush ALL list caches on any write)
# ---------------------------------------------------------------------------

def invalidate_offer_cache(offer_id: int) -> None:
    """
    Invalidate all cache entries related to offers.
    - Deletes the single-offer cache
    - Flushes ALL offer list caches (aggressive, ensures 100% consistency)
    """
    # Delete single item
    cache_key = get_cache_key("offer", offer_id)
    cache.delete(cache_key)
    
    # Flush ALL offer list caches
    invalidate_offers_list_cache()


def invalidate_offers_list_cache() -> None:
    """Flush ALL cached offer list results."""
    if hasattr(cache, 'keys'):
        keys = cache.keys("posts:offers_list:*")
        if keys:
            cache.delete_many(keys)


def invalidate_request_cache(request_id: int) -> None:
    """
    Invalidate all cache entries related to requests.
    - Deletes the single-request cache
    - Flushes ALL request list caches (aggressive, ensures 100% consistency)
    """
    # Delete single item
    cache_key = get_cache_key("request", request_id)
    cache.delete(cache_key)
    
    # Flush ALL request list caches
    invalidate_requests_list_cache()


def invalidate_requests_list_cache() -> None:
    """Flush ALL cached request list results."""
    if hasattr(cache, 'keys'):
        keys = cache.keys("posts:requests_list:*")
        if keys:
            cache.delete_many(keys)