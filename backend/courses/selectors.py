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

from typing import Optional, List

from django.core.cache import cache
from django.db.models import QuerySet, Q

from courses.models import Course, Content, CourseOfferLink
from cache_utils import get_cached_list, set_cached_list, increment_cache_version, CACHE_TTL_SINGLE


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
    """Get cached course list. Only pages 1-10."""
    return get_cached_list(
        "courses_list",
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
    set_cached_list(
        "courses_list",
        courses,
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


def get_visible_contents_for_course(course: Course, requesting_user: any) -> QuerySet:
    """
    Get contents for a course based on visibility rules:
    - Active course: All authenticated users can see contents
    - Inactive/Closed course: Only owner, manager, admin, superuser can see contents
    - Normal users see empty queryset for inactive courses
    """
    contents = course.contents.all()
    
    # If course is active, everyone can see
    if course.status == "active":
        return contents
    
    # If course is inactive/closed, check user permissions
    if requesting_user.is_staff or requesting_user.is_superuser:
        return contents
    
    if requesting_user.is_manager:
        return contents
    
    if course.user_id == requesting_user.pk:
        return contents
    
    # Normal user — hide contents for inactive courses
    return Content.objects.none()


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


# ---------------------------------------------------------------------------
# Cache Invalidation
# ---------------------------------------------------------------------------

def invalidate_course_cache(course_id: int) -> None:
    """Invalidate single course cache + ALL course list caches (O(1) version increment)."""
    cache_key = get_cache_key("course", str(course_id))
    cache.delete(cache_key)
    invalidate_courses_list_cache()


def invalidate_courses_list_cache() -> None:
    """Flush ALL cached course list results by incrementing the version."""
    increment_cache_version("courses_list")


def invalidate_content_cache(content_id: int) -> None:
    """Invalidate single content cache."""
    cache_key = get_cache_key("content", str(content_id))
    cache.delete(cache_key)