"""
Selectors
=========
Pure read layer with Redis caching (DB 1).

Caching Strategy:
- Single items: cached 1 hour, invalidated on update/delete
- Filtered lists: cached 5 minutes, first 10 pages only
- On any write: ALL list caches are flushed via SCAN iteration
- Empty lists are NOT cached to prevent stale empty responses
"""

import hashlib
from typing import Optional, List

from django.core.cache import cache
from django.db.models import QuerySet, Q

from resources.models import Resource


CACHE_TTL_SINGLE = 3600
CACHE_TTL_LIST = 300
MAX_CACHED_PAGES = 10


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
    if page > MAX_CACHED_PAGES:
        return None

    raw_key = (
        f"list|cat:{category or 'all'}|"
        f"search:{search or 'none'}|"
        f"user:{user_id or 'all'}|"
        f"order:{ordering}|"
        f"page:{page}|"
        f"size:{page_size}"
    )
    cache_key_hash = hashlib.md5(raw_key.encode()).hexdigest()
    cache_key = get_cache_key("list", cache_key_hash)

    return cache.get(cache_key)


def set_cached_resource_list(
    resources: List[Resource],
    category: Optional[str] = None,
    search: Optional[str] = None,
    user_id: Optional[int] = None,
    ordering: str = "-created_at",
    page: int = 1,
    page_size: int = 20
) -> None:
    if page > MAX_CACHED_PAGES:
        return

    # Never cache empty results — prevents stale empty responses after create
    if not resources:
        return

    raw_key = (
        f"list|cat:{category or 'all'}|"
        f"search:{search or 'none'}|"
        f"user:{user_id or 'all'}|"
        f"order:{ordering}|"
        f"page:{page}|"
        f"size:{page_size}"
    )
    cache_key_hash = hashlib.md5(raw_key.encode()).hexdigest()
    cache_key = get_cache_key("list", cache_key_hash)

    cache.set(cache_key, resources, timeout=CACHE_TTL_LIST)


# ---------------------------------------------------------------------------
# Cache Invalidation
# ---------------------------------------------------------------------------

def invalidate_resource_cache(resource_id: int) -> None:
    """Invalidate single resource cache + flush all list caches."""
    cache.delete(get_cache_key("resource", resource_id))
    invalidate_list_cache()

def invalidate_list_cache() -> None:
    """
    Flush ALL cached resource list results.
    Uses raw redis-py client since Django's RedisCache backend
    doesn't support get_redis_connection() or delete_pattern().
    """
    import redis
    
    try:
        r = redis.Redis(host='localhost', port=6379, db=1)
        cursor = 0
        while True:
            cursor, keys = r.scan(cursor, match="*resources:list:*", count=100)
            if keys:
                r.delete(*keys)
            if cursor == 0:
                break
    except Exception:
        pass