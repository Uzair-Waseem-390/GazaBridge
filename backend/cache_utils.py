import hashlib
from typing import Any, Optional, Dict
from django.core.cache import cache

# Global TTL settings
CACHE_TTL_SINGLE = 3600   # 1 hour for single items
CACHE_TTL_LIST = 300      # 5 minutes for lists
CACHE_TTL_LONG = 86400    # 24 hours for static/roles
MAX_CACHED_PAGES = 10     # Maximum pages to cache


def get_cache_version(model_prefix: str) -> int:
    """
    Get the current cache version for a model/entity type.
    If it doesn't exist, initialize it to 1.
    """
    version_key = f"version:{model_prefix}"
    version = cache.get(version_key)
    if version is None:
        version = 1
        # Store version indefinitely (or very long)
        cache.set(version_key, version, timeout=None)
    return version


def increment_cache_version(model_prefix: str) -> int:
    """
    Increment the cache version for a model/entity type.
    This instantly invalidates all list caches tied to the previous version.
    """
    version_key = f"version:{model_prefix}"
    try:
        return cache.incr(version_key)
    except ValueError:
        # Key might not exist or be corrupted, reset it
        cache.set(version_key, 2, timeout=None)
        return 2


def build_list_cache_key(model_prefix: str, kwargs: Dict[str, Any]) -> str:
    """
    Build a versioned cache key for a list query.
    Example: model_prefix="offers_list"
    """
    version = get_cache_version(model_prefix)
    
    # Sort kwargs to ensure consistent key generation
    sorted_kwargs = sorted(kwargs.items())
    raw_key = f"{model_prefix}|v:{version}|" + "|".join(f"{k}:{v}" for k, v in sorted_kwargs)
    
    # Hash the parameters to keep the key length manageable
    key_hash = hashlib.md5(raw_key.encode()).hexdigest()
    return f"{model_prefix}:{version}:{key_hash}"


def get_cached_list(model_prefix: str, **kwargs) -> Optional[Any]:
    """
    Get a cached list result, automatically handling versioning and page limits.
    Assumes kwargs contains 'page' if pagination is used.
    """
    page = kwargs.get('page', 1)
    if isinstance(page, int) and page > MAX_CACHED_PAGES:
        return None
        
    cache_key = build_list_cache_key(model_prefix, kwargs)
    return cache.get(cache_key)


def set_cached_list(model_prefix: str, data: Any, **kwargs) -> None:
    """
    Set a cached list result, automatically handling versioning and page limits.
    """
    page = kwargs.get('page', 1)
    if isinstance(page, int) and page > MAX_CACHED_PAGES:
        return
        
    cache_key = build_list_cache_key(model_prefix, kwargs)
    cache.set(cache_key, data, timeout=CACHE_TTL_LIST)


def invalidate_model_cache(model_prefix: str, item_id: Any = None) -> None:
    """
    Invalidate caches for a model.
    1. If item_id is provided, deletes the specific item's cache (e.g. 'course:123').
    2. Always increments the list version for the model (e.g. 'courses_list' -> v+1) to instantly invalidate all lists.
    
    Expected prefix convention:
    - single item prefix: e.g. "course"
    - list item prefix is derived as: e.g. "courses_list" (by appending 's_list' to single word, but we'll accept list_prefix explicitly to be safe).
    Actually, let's keep it simple: caller passes the exact prefixes they want to clear.
    """
    pass # we'll implement this explicitly in the selectors to be safe with existing conventions
