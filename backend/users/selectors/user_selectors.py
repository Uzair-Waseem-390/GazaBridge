"""
Selectors
=========
Pure read layer — no writes, no side effects.
With Redis caching integration (DB 1).
"""

import json
import hashlib
from typing import Optional, List, Dict, Any

from django.core.cache import cache
from django.db.models import QuerySet, Q
from django.utils import timezone

from users.models import EmailVerificationToken, Role, User


# Redis cache configuration (DB 1)
CACHE_TTL_SHORT = 300  # 5 minutes
CACHE_TTL_MEDIUM = 3600  # 1 hour
CACHE_TTL_LONG = 86400  # 24 hours


def get_cache_key(prefix: str, identifier: Any) -> str:
    """Generate a consistent cache key."""
    return f"users:{prefix}:{identifier}"


def invalidate_user_cache(user_id: int) -> None:
    """Invalidate all cache entries for a specific user."""
    patterns = [
        get_cache_key("user", user_id),
        get_cache_key("user_email", "*"),
        get_cache_key("users_list", "*"),
    ]
    for pattern in patterns:
        keys = cache.keys(pattern) if hasattr(cache, 'keys') else []
        if keys:
            cache.delete_many(keys)


def invalidate_users_list_cache() -> None:
    """Invalidate users list cache when users are created/deleted/updated."""
    if hasattr(cache, 'keys'):
        keys = cache.keys("users:users_list:*")
        if keys:
            cache.delete_many(keys)


# ---------------------------------------------------------------------------
# Role selectors
# ---------------------------------------------------------------------------

def get_role_by_name(name: str) -> Role:
    """Return a Role by name. Raises Role.DoesNotExist if not found."""
    cache_key = get_cache_key("role", name)
    role = cache.get(cache_key)
    
    if role is None:
        role = Role.objects.get(name=name)
        cache.set(cache_key, role, timeout=CACHE_TTL_LONG)
    
    return role


def get_roles_by_names(names: List[str]) -> QuerySet:
    """Get roles by multiple names without caching (QuerySet)."""
    return Role.objects.filter(name__in=names)


def get_registerable_roles() -> QuerySet:
    """Roles a user may self-assign at registration. 'manager' is excluded."""
    return Role.objects.filter(name__in=["volunteer", "seeker"])


def get_all_roles() -> QuerySet:
    """Get all roles."""
    return Role.objects.all()


# ---------------------------------------------------------------------------
# User selectors
# ---------------------------------------------------------------------------

def get_user_by_email(email: str) -> Optional[User]:
    """Get user by email with caching."""
    cache_key = get_cache_key("user_email", email.lower())
    user_id = cache.get(cache_key)
    
    if user_id:
        return get_user_by_id(user_id)
    
    user = User.objects.filter(email=email.lower()).prefetch_related("roles").first()
    if user:
        cache.set(cache_key, user.pk, timeout=CACHE_TTL_MEDIUM)
        cache.set(get_cache_key("user", user.pk), user, timeout=CACHE_TTL_MEDIUM)
    
    return user


def email_exists(email: str) -> bool:
    """Lightweight existence check — does not load the full row."""
    return User.objects.filter(email=email.lower()).exists()


def get_user_by_id(user_id: int) -> Optional[User]:
    """Get user by ID with caching."""
    cache_key = get_cache_key("user", user_id)
    user = cache.get(cache_key)
    
    if user is None:
        user = (
            User.objects
            .filter(pk=user_id)
            .prefetch_related("roles")
            .first()
        )
        if user:
            cache.set(cache_key, user, timeout=CACHE_TTL_MEDIUM)
    
    return user


def get_users_with_filters(
    role: Optional[str] = None,
    country: Optional[str] = None,
    is_active: Optional[bool] = None,
    page: int = 1,
    page_size: int = 20
) -> Dict[str, Any]:
    """
    Get users with filters and pagination.
    Results are cached with filter parameters as part of the key.
    """
    # Build cache key from all parameters
    cache_key_data = f"role:{role or 'all'}|country:{country or 'all'}|active:{is_active or 'all'}|page:{page}|size:{page_size}"
    cache_key_hash = hashlib.md5(cache_key_data.encode()).hexdigest()
    cache_key = get_cache_key("users_list", cache_key_hash)
    
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return cached_result
    
    # Build queryset
    queryset = User.objects.select_related().prefetch_related("roles")
    
    if role:
        queryset = queryset.filter(roles__name=role)
    
    if country:
        queryset = queryset.filter(country__iexact=country)
    
    if is_active is not None:
        queryset = queryset.filter(is_active=is_active)
    
    # Exclude superusers from regular listing unless explicitly requested
    # (but admins can see them via admin interface)
    if not role:  # Only apply this filter for general listing
        queryset = queryset.filter(is_superuser=False)
    
    # Pagination
    start = (page - 1) * page_size
    end = start + page_size
    
    total_count = queryset.count()
    users = list(queryset[start:end])
    
    result = {
        "users": users,
        "total_count": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size if total_count > 0 else 1
    }
    
    # Cache the result
    cache.set(cache_key, result, timeout=CACHE_TTL_SHORT)
    
    return result


def get_user_with_permissions(user_id: int, requesting_user: User) -> Optional[User]:
    """
    Get user with permission checks for update/delete operations.
    This is a read operation but includes business logic for permissions.
    """
    target_user = get_user_by_id(user_id)
    
    if not target_user:
        return None
    
    # Attach permission info as attributes
    target_user.can_be_updated_by = requesting_user.can_update_user(target_user)
    target_user.can_be_deleted_by = requesting_user.can_delete_user(target_user)
    
    return target_user


# ---------------------------------------------------------------------------
# Token selectors
# ---------------------------------------------------------------------------

def get_token_by_value(token_value: str) -> Optional[EmailVerificationToken]:
    """Look up a verification token by its UUID string value."""
    try:
        return (
            EmailVerificationToken.objects
            .select_related("user")
            .get(token=token_value)
        )
    except (EmailVerificationToken.DoesNotExist, ValueError):
        return None


def get_active_token_for_user(user: User) -> Optional[EmailVerificationToken]:
    """Return the most recent unused, unexpired token for a user, if any."""
    return (
        EmailVerificationToken.objects
        .filter(user=user, is_used=False, expires_at__gt=timezone.now())
        .order_by("-created_at")
        .first()
    )