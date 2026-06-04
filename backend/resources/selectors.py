"""
Selectors
=========
Pure read layer with Redis caching (DB 1).

Caching Strategy:
- Single items: cached 1 hour, invalidated on update/delete
- Filtered lists: cached 5 minutes, first 10 pages only
- On any write: List cache version is incremented (O(1) consistent invalidation)
- Empty lists are NOT cached to prevent stale empty responses
"""

from typing import Optional, List

from django.core.cache import cache
from django.db.models import QuerySet, Q

from resources.models import Resource
from cache_utils import get_cached_list, set_cached_list, increment_cache_version, CACHE_TTL_SINGLE


def get_cache_key(prefix: str, identifier) -> str:
    return f"resources:{prefix}:{identifier}"


# ---------------------------------------------------------------------------
# Single Resource
# ---------------------------------------------------------------------------

def get_resource_by_id(resource_id: int) -> Optional[Resource]:
    cache_key = get_cache_key("resource", resource_id)
    resource = cache.get(cache_key)

    if resource is None:
        resource = (
            Resource.objects
            .select_related("user")
            .filter(pk=resource_id)
            .first()
        )
        if resource:
            cache.set(cache_key, resource, timeout=CACHE_TTL_SINGLE)

    return resource


# ---------------------------------------------------------------------------
# Resource Queryset
# ---------------------------------------------------------------------------

def get_resources_queryset(
    category: Optional[str] = None,
    search: Optional[str] = None,
    user_id: Optional[int] = None,
    ordering: str = "-created_at"
) -> QuerySet:
    queryset = Resource.objects.select_related("user").all()

    if category:
        queryset = queryset.filter(category=category)
    if user_id:
        queryset = queryset.filter(user_id=user_id)
    if search:
        queryset = queryset.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search)
        )

    return queryset.order_by(ordering)


# ---------------------------------------------------------------------------
# Cached List
# ---------------------------------------------------------------------------

def get_cached_resource_list(
    category: Optional[str] = None,
    search: Optional[str] = None,
    user_id: Optional[int] = None,
    ordering: str = "-created_at",
    page: int = 1,
    page_size: int = 20
) -> Optional[List[Resource]]:
    return get_cached_list(
        "resources_list",
        category=category or 'all',
        search=search or 'none',
        user_id=str(user_id) if user_id else 'all',
        ordering=ordering,
        page=page,
        page_size=page_size
    )


def set_cached_resource_list(
    resources: List[Resource],
    category: Optional[str] = None,
    search: Optional[str] = None,
    user_id: Optional[int] = None,
    ordering: str = "-created_at",
    page: int = 1,
    page_size: int = 20
) -> None:
    # Never cache empty results — prevents stale empty responses after create
    if not resources:
        return

    set_cached_list(
        "resources_list",
        resources,
        category=category or 'all',
        search=search or 'none',
        user_id=str(user_id) if user_id else 'all',
        ordering=ordering,
        page=page,
        page_size=page_size
    )


# ---------------------------------------------------------------------------
# Cache Invalidation
# ---------------------------------------------------------------------------

def invalidate_resource_cache(resource_id: int) -> None:
    """Invalidate single resource cache + flush all list caches."""
    cache.delete(get_cache_key("resource", resource_id))
    invalidate_list_cache()

def invalidate_list_cache() -> None:
    """Flush ALL cached resource list results (O(1) version increment)."""
    increment_cache_version("resources_list")