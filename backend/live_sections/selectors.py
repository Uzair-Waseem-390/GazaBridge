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
from django.utils import timezone

from live_sections.models import LiveSection, LiveSectionContent, LiveSectionOfferLink
from cache_utils import get_cached_list, set_cached_list, increment_cache_version, CACHE_TTL_SINGLE


# ---------------------------------------------------------------------------
# Cache key helper
# ---------------------------------------------------------------------------

def get_cache_key(prefix: str, identifier: str) -> str:
    return f"live_sections:{prefix}:{identifier}"


def invalidate_live_section_cache(ls_id: int) -> None:
    """Invalidate single live section cache + ALL list caches."""
    cache_key = get_cache_key("live_section", str(ls_id))
    cache.delete(cache_key)
    invalidate_ls_list_cache()


def invalidate_ls_list_cache() -> None:
    """Flush ALL cached live section list results by incrementing the version."""
    increment_cache_version("live_sections_list")


def invalidate_content_cache(content_id: int) -> None:
    """Invalidate single content cache."""
    cache_key = get_cache_key("content", str(content_id))
    cache.delete(cache_key)


# ---------------------------------------------------------------------------
# LiveSection Selectors
# ---------------------------------------------------------------------------

def get_live_section_by_id(ls_id: int) -> Optional[LiveSection]:
    """Get a single live section by ID with caching.
    Cache TTL: 1 hour. Invalidated on update/delete.
    """
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

    return queryset.order_by(ordering)


def get_cached_live_section_list(
    category=None, skill_level=None, language=None, status=None,
    user_id=None, search=None, ordering="-created_at", page=1, page_size=20
) -> Optional[List[LiveSection]]:
    """Get cached live section list."""
    return get_cached_list(
        "live_sections_list",
        category=category or 'all',
        skill_level=skill_level or 'all',
        language=language or 'all',
        status=status or 'all',
        user_id=str(user_id) if user_id else 'all',
        search=search or 'none',
        ordering=ordering,
        page=page,
        page_size=page_size
    )


def set_cached_live_section_list(live_sections: List[LiveSection], **kwargs) -> None:
    """Cache a live section list result."""
    # Ensure page is within the allowed kwargs
    page = kwargs.get('page', 1)
    page_size = kwargs.get('page_size', 20)
    category = kwargs.get('category')
    skill_level = kwargs.get('skill_level')
    language = kwargs.get('language')
    status = kwargs.get('status')
    user_id = kwargs.get('user_id')
    search = kwargs.get('search')
    ordering = kwargs.get('ordering', '-created_at')

    set_cached_list(
        "live_sections_list",
        live_sections,
        category=category or 'all',
        skill_level=skill_level or 'all',
        language=language or 'all',
        status=status or 'all',
        user_id=str(user_id) if user_id else 'all',
        search=search or 'none',
        ordering=ordering,
        page=page,
        page_size=page_size
    )


# ---------------------------------------------------------------------------
# Content Selectors
# ---------------------------------------------------------------------------

def get_content_by_id(content_id: int) -> Optional[LiveSectionContent]:
    """Get a single content by ID with caching."""
    cache_key = get_cache_key("content", str(content_id))
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
    - Active: all authenticated users can see contents.
    - Inactive/Closed/Ended: only owner, manager, admin, superuser.
    """
    contents = live_section.contents.all()
    effective_status = live_section.get_effective_status()

    if effective_status == "active":
        return contents

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
