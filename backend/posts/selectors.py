"""
Selectors
=========
Pure read layer — no writes, no side effects.
With Redis caching integration (DB 1).
"""

import hashlib
from typing import Optional, Any

from django.core.cache import cache
from django.db.models import QuerySet, Q

from posts.models import Offer, Request


# Redis cache configuration (DB 1)
CACHE_TTL_MEDIUM = 3600  # 1 hour


def get_cache_key(prefix: str, identifier: Any) -> str:
    """Generate a consistent cache key."""
    return f"posts:{prefix}:{identifier}"


# ---------------------------------------------------------------------------
# Offer Selectors
# ---------------------------------------------------------------------------

def get_offer_by_id(offer_id: int) -> Optional[Offer]:
    """Get a single offer by ID with caching."""
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
            cache.set(cache_key, offer, timeout=CACHE_TTL_MEDIUM)
    
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
    
    # Apply ordering
    queryset = queryset.order_by(ordering)
    
    return queryset


# ---------------------------------------------------------------------------
# Request Selectors
# ---------------------------------------------------------------------------

def get_request_by_id(request_id: int) -> Optional[Request]:
    """Get a single request by ID with caching."""
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
            cache.set(cache_key, request_obj, timeout=CACHE_TTL_MEDIUM)
    
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
    
    # Apply ordering
    queryset = queryset.order_by(ordering)
    
    return queryset


# ---------------------------------------------------------------------------
# Cache Invalidation
# ---------------------------------------------------------------------------

def invalidate_offer_cache(offer_id: int) -> None:
    """Invalidate all cache entries related to a specific offer."""
    cache_key = get_cache_key("offer", offer_id)
    cache.delete(cache_key)


def invalidate_request_cache(request_id: int) -> None:
    """Invalidate all cache entries related to a specific request."""
    cache_key = get_cache_key("request", request_id)
    cache.delete(cache_key)