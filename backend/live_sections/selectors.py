"""
Selectors
=========
Pure read layer — no writes, no side effects.
With Redis caching integration (DB 1).

Caching Strategy:
- Single items: cached 1 hour, invalidated on update/delete
- Filtered lists: cached 5 minutes, first 10 pages only
- On any write: ALL list caches are flushed
"""

import hashlib
from typing import Optional, List, Any

from django.core.cache import cache
from django.db.models import QuerySet, Q
from django.utils import timezone

from live_sections.models import LiveSection, LiveSectionContent, LiveSectionOfferLink


CACHE_TTL_SINGLE = 3600
CACHE_TTL_LIST = 300
MAX_CACHED_PAGES = 10


def get_cache_key(prefix: str, identifier: str) -> str:
    return f"live_sections:{prefix}:{identifier}"


# ---------------------------------------------------------------------------
# LiveSection Selectors
# ---------------------------------------------------------------------------

def get_live_section_by_id(ls_id: int) -> Optional[LiveSection]:
    """Get a single live section by ID with caching."""
    cache_key = get_cache_key("live_section", str(ls_id))
    ls = cache.get(cache_key)
    
    if ls is None:
        ls = (
            LiveSection.objects
            .select_related("user")
            .prefetch_related("contents")
            .filter(pk=ls_id)
            .first()
        )
        if ls:
            cache.set(cache_key, ls, timeout=CACHE_TTL_SINGLE)
    
    return ls


def get_live_sections_queryset(
    category: Optional[str] = None,
    skill_level: Optional[str] = None,
    language: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    search: Optional[str] = None,
    ordering: str = "-created_at"
) -> QuerySet:
    """Get live sections queryset with optional filters."""
    queryset = LiveSection.objects.select_related("user").prefetch_related("contents").all()
    
    if category:
        queryset = queryset.filter(category=category)
    if skill_level:
        queryset = queryset.filter(skill_level=skill_level)
    if language:
        queryset = queryset.filter(language=language)
    if status:
        queryset = queryset.filter(status=status)
    if user_id:
        queryset = queryset.filter(user_id=user_id)
    if search:
        queryset = queryset.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search)
        )
    
    queryset = queryset.order_by(ordering)
    return queryset


def get_cached_live_section_list(
    category: Optional[str] = None,
    skill_level: Optional[str] = None,
    language: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    search: Optional[str] = None,
    ordering: str = "-created_at",
    page: int = 1,
    page_size: int = 20
) -> Optional[List[LiveSection]]:
    """Get cached live section list. Only pages 1-10."""
    if page > MAX_CACHED_PAGES:
        return None
    
    raw_key = (
        f"ls_list|cat:{category or 'all'}|"
        f"skill:{skill_level or 'all'}|"
        f"lang:{language or 'all'}|"
        f"status:{status or 'all'}|"
        f"user:{user_id or 'all'}|"
        f"search:{search or 'none'}|"
        f"order:{ordering}|"
        f"page:{page}|"
        f"size:{page_size}"
    )
    cache_key_hash = hashlib.md5(raw_key.encode()).hexdigest()
    cache_key = get_cache_key("ls_list", cache_key_hash)
    
    return cache.get(cache_key)


def set_cached_live_section_list(
    live_sections: List[LiveSection],
    category: Optional[str] = None,
    skill_level: Optional[str] = None,
    language: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    search: Optional[str] = None,
    ordering: str = "-created_at",
    page: int = 1,
    page_size: int = 20
) -> None:
    """Cache a live section list result. Only pages 1-10."""
    if page > MAX_CACHED_PAGES:
        return
    
    raw_key = (
        f"ls_list|cat:{category or 'all'}|"
        f"skill:{skill_level or 'all'}|"
        f"lang:{language or 'all'}|"
        f"status:{status or 'all'}|"
        f"user:{user_id or 'all'}|"
        f"search:{search or 'none'}|"
        f"order:{ordering}|"
        f"page:{page}|"
        f"size:{page_size}"
    )
    cache_key_hash = hashlib.md5(raw_key.encode()).hexdigest()
    cache_key = get_cache_key("ls_list", cache_key_hash)
    
    cache.set(cache_key, live_sections, timeout=CACHE_TTL_LIST)


# ---------------------------------------------------------------------------
# Content Selectors
# ---------------------------------------------------------------------------

def get_content_by_id(content_id: int) -> Optional[LiveSectionContent]:
    """Get a single content by ID with caching."""
    cache_key = get_cache_key("ls_content", str(content_id))
    content = cache.get(cache_key)
    
    if content is None:
        content = (
            LiveSectionContent.objects
            .select_related("user", "live_section")
            .filter(pk=content_id)
            .first()
        )
        if content:
            cache.set(cache_key, content, timeout=CACHE_TTL_SINGLE)
    
    return content


def get_visible_contents_for_live_section(live_section: LiveSection, requesting_user: Any) -> QuerySet:
    """
    Get contents based on visibility rules:
    - Active (and not ended): All authenticated users can see contents
    - Inactive/Closed/Ended: Only owner, manager, admin, superuser can see contents
    """
    contents = live_section.contents.all()
    
    effective_status = live_section.get_effective_status()
    
    if effective_status == "active":
        return contents
    
    # Inactive/closed — restricted access
    if requesting_user.is_staff or requesting_user.is_superuser:
        return contents
    if requesting_user.is_manager:
        return contents
    if live_section.user_id == requesting_user.pk:
        return contents
    
    return LiveSectionContent.objects.none()


# ---------------------------------------------------------------------------
# Link Selectors
# ---------------------------------------------------------------------------

def get_link_by_ls_and_offer(ls_id: int, offer_id: int) -> Optional[LiveSectionOfferLink]:
    """Get a link between a live section and an offer."""
    return (
        LiveSectionOfferLink.objects
        .select_related("live_section", "offer", "linked_by")
        .filter(live_section_id=ls_id, offer_id=offer_id)
        .first()
    )


# ---------------------------------------------------------------------------
# Cache Invalidation
# ---------------------------------------------------------------------------

def invalidate_live_section_cache(ls_id: int) -> None:
    cache_key = get_cache_key("live_section", str(ls_id))
    cache.delete(cache_key)
    invalidate_ls_list_cache()


def invalidate_ls_list_cache() -> None:
    if hasattr(cache, 'keys'):
        keys = cache.keys("live_sections:ls_list:*")
        if keys:
            cache.delete_many(keys)


def invalidate_content_cache(content_id: int) -> None:
    cache_key = get_cache_key("ls_content", str(content_id))
    cache.delete(cache_key)