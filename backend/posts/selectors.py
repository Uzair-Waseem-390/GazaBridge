"""
Selectors
=========
Pure read layer — no writes, no side effects.
With Redis caching integration (DB 1).

Caching Strategy:
- Single items: cached 1 hour, invalidated on update/delete
- Filtered lists: cached 5 minutes, first 10 pages only
- On any write: List cache version is incremented (O(1) consistent invalidation)
"""

from typing import Optional, Any, List

from django.core.cache import cache
from django.db.models import QuerySet, Q

from posts.models import Offer, Request
from cache_utils import get_cached_list, set_cached_list, increment_cache_version, CACHE_TTL_SINGLE, CACHE_TTL_LIST


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
    return get_cached_list(
        "offers_list",
        category=category or 'all',
        availability=availability or 'all',
        status=status or 'all',
        user_id=str(user_id) if user_id else 'all',
        search=search or 'none',
        ordering=ordering,
        page=page,
        page_size=page_size
    )


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
    set_cached_list(
        "offers_list",
        offers,
        category=category or 'all',
        availability=availability or 'all',
        status=status or 'all',
        user_id=str(user_id) if user_id else 'all',
        search=search or 'none',
        ordering=ordering,
        page=page,
        page_size=page_size
    )


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
    return get_cached_list(
        "requests_list",
        category=category or 'all',
        status=status or 'all',
        user_id=str(user_id) if user_id else 'all',
        search=search or 'none',
        ordering=ordering,
        page=page,
        page_size=page_size
    )


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
    set_cached_list(
        "requests_list",
        requests,
        category=category or 'all',
        status=status or 'all',
        user_id=str(user_id) if user_id else 'all',
        search=search or 'none',
        ordering=ordering,
        page=page,
        page_size=page_size
    )



# ---------------------------------------------------------------------------
# Linked Courses & LiveSections for an Offer (with Redis caching)
# ---------------------------------------------------------------------------

def get_linked_courses_for_offer(offer_id: int):
    """
    Get all courses linked to a specific offer.
    Cached for 5 minutes. Invalidated when offer or course is updated/deleted.
    Returns list of dicts for lightweight serialization.
    """
    # cache_key = get_cache_key("linked_courses", str(offer_id))
    cache_key = get_cache_key("linked_courses", offer_id)
    cached = cache.get(cache_key)
    
    if cached is not None:
        return cached
    
    from courses.models import CourseOfferLink
    
    links = (
        CourseOfferLink.objects
        .filter(offer_id=offer_id)
        .select_related("course", "course__user")
    )
    
    result = [
        {
            "id": link.course_id,
            "title": link.course.title,
            "status": link.course.status,
            "user_email": link.course.user.email,
        }
        for link in links
    ]
    
    cache.set(cache_key, result, timeout=CACHE_TTL_LIST)
    return result


def get_linked_live_sections_for_offer(offer_id: int):
    """
    Get all live sections linked to a specific offer.
    Cached for 5 minutes. Invalidated when offer or live section is updated/deleted.
    Returns list of dicts for lightweight serialization.
    """
    # cache_key = get_cache_key("linked_ls", str(offer_id))
    cache_key = get_cache_key("linked_ls", offer_id)
    cached = cache.get(cache_key)
    
    if cached is not None:
        return cached
    
    from live_sections.models import LiveSectionOfferLink
    
    links = (
        LiveSectionOfferLink.objects
        .filter(offer_id=offer_id)
        .select_related("live_section", "live_section__user")
    )
    
    result = [
        {
            "id": link.live_section_id,
            "title": link.live_section.title,
            "status": link.live_section.status,
            "effective_status": link.live_section.get_effective_status(),
            "ending_date": link.live_section.ending_date,
            "user_email": link.live_section.user.email,
        }
        for link in links
    ]
    
    cache.set(cache_key, result, timeout=CACHE_TTL_LIST)
    return result



# ---------------------------------------------------------------------------
# Cache Invalidation (Aggressive — flush ALL list caches on any write)
# ---------------------------------------------------------------------------

def invalidate_offer_cache(offer_id: int) -> None:
    """
    Invalidate all cache entries related to offers.
    - Deletes the single-offer cache
    - Flushes ALL offer list caches (O(1) version increment)
    """
    # Delete single item
    cache_key = get_cache_key("offer", offer_id)
    cache.delete(cache_key)
    
    # Invalidate linked courses and live sections caches
    cache.delete(get_cache_key("linked_courses", offer_id))
    cache.delete(get_cache_key("linked_ls", offer_id))

    # Flush ALL offer list caches
    invalidate_offers_list_cache()


def invalidate_offers_list_cache() -> None:
    """Flush ALL cached offer list results (O(1) version increment)."""
    increment_cache_version("offers_list")

def invalidate_request_cache(request_id: int) -> None:
    """
    Invalidate all cache entries related to requests.
    - Deletes the single-request cache
    - Flushes ALL request list caches (O(1) version increment)
    """
    # Delete single item
    cache_key = get_cache_key("request", request_id)
    cache.delete(cache_key)
    
    # Flush ALL request list caches
    invalidate_requests_list_cache()


def invalidate_requests_list_cache() -> None:
    """Flush ALL cached request list results (O(1) version increment)."""
    increment_cache_version("requests_list")