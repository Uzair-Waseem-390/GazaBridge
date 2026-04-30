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
from typing import Optional, List

from django.core.cache import cache
from django.db.models import QuerySet, Q

from courses.models import Course, Content, CourseOfferLink


# Redis cache configuration (DB 1)
CACHE_TTL_SINGLE = 3600   # 1 hour for single items
CACHE_TTL_LIST = 300      # 5 minutes for filtered lists
MAX_CACHED_PAGES = 10     # Only cache first 10 pages


def get_cache_key(prefix: str, identifier: str) -> str:
    """Generate a consistent cache key."""
    return f"courses:{prefix}:{identifier}"


# ---------------------------------------------------------------------------
# Course Selectors
# ---------------------------------------------------------------------------

def get_course_by_id(course_id: int) -> Optional[Course]:
    """
    Get a single course by ID with caching.
    Cache TTL: 1 hour. Invalidated on update/delete.
    """
    cache_key = get_cache_key("course", str(course_id))
    course = cache.get(cache_key)
    
    if course is None:
        course = (
            Course.objects
            .select_related("user")
            .prefetch_related("contents")
            .filter(pk=course_id)
            .first()
        )
        if course:
            cache.set(cache_key, course, timeout=CACHE_TTL_SINGLE)
    
    return course


def get_courses_queryset(
    category: Optional[str] = None,
    skill_level: Optional[str] = None,
    language: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    search: Optional[str] = None,
    ordering: str = "-created_at"
) -> QuerySet:
    """
    Get courses queryset with optional filters.
    Returns QuerySet so DRF can handle pagination.
    """
    queryset = Course.objects.select_related("user").prefetch_related("contents").all()
    
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


def get_cached_course_list(
    category: Optional[str] = None,
    skill_level: Optional[str] = None,
    language: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    search: Optional[str] = None,
    ordering: str = "-created_at",
    page: int = 1,
    page_size: int = 20
) -> Optional[List[Course]]:
    """
    Get cached course list for a specific page/filter combination.
    Only caches pages 1 through MAX_CACHED_PAGES.
    """
    if page > MAX_CACHED_PAGES:
        return None
    
    raw_key = (
        f"courses_list|cat:{category or 'all'}|"
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
    cache_key = get_cache_key("courses_list", cache_key_hash)
    
    return cache.get(cache_key)


def set_cached_course_list(
    courses: List[Course],
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
    """Cache a course list result. Only pages 1-10."""
    if page > MAX_CACHED_PAGES:
        return
    
    raw_key = (
        f"courses_list|cat:{category or 'all'}|"
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
    cache_key = get_cache_key("courses_list", cache_key_hash)
    
    cache.set(cache_key, courses, timeout=CACHE_TTL_LIST)


# ---------------------------------------------------------------------------
# Content Selectors
# ---------------------------------------------------------------------------

def get_content_by_id(content_id: int) -> Optional[Content]:
    """
    Get a single content by ID with caching.
    Cache TTL: 1 hour. Invalidated on update/delete.
    """
    cache_key = get_cache_key("content", str(content_id))
    content = cache.get(cache_key)
    
    if content is None:
        content = (
            Content.objects
            .select_related("user", "course")
            .filter(pk=content_id)
            .first()
        )
        if content:
            cache.set(cache_key, content, timeout=CACHE_TTL_SINGLE)
    
    return content


# ---------------------------------------------------------------------------
# Link Selectors
# ---------------------------------------------------------------------------

def get_link_by_course_and_offer(course_id: int, offer_id: int) -> Optional[CourseOfferLink]:
    """Get a link between a course and an offer."""
    return (
        CourseOfferLink.objects
        .select_related("course", "offer", "linked_by")
        .filter(course_id=course_id, offer_id=offer_id)
        .first()
    )


def get_linked_offers_for_course(course_id: int) -> QuerySet:
    """Get all offers linked to a course."""
    return CourseOfferLink.objects.filter(course_id=course_id).select_related("offer")


# ---------------------------------------------------------------------------
# Cache Invalidation
# ---------------------------------------------------------------------------

def invalidate_course_cache(course_id: int) -> None:
    """Invalidate single course cache + ALL course list caches."""
    cache_key = get_cache_key("course", str(course_id))
    cache.delete(cache_key)
    invalidate_courses_list_cache()


def invalidate_courses_list_cache() -> None:
    """Flush ALL cached course list results."""
    if hasattr(cache, 'keys'):
        keys = cache.keys("courses:courses_list:*")
        if keys:
            cache.delete_many(keys)


def invalidate_content_cache(content_id: int) -> None:
    """Invalidate single content cache."""
    cache_key = get_cache_key("content", str(content_id))
    cache.delete(cache_key)