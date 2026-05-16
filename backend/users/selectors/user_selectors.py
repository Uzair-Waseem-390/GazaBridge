"""
Selectors
=========
Pure read layer — no writes, no side effects.

Caching policy:
- User objects (get_user_by_id / get_user_by_email): NO cache.
  Caching mutable model instances causes stale-data bugs on profile updates.
  A single-row PK lookup is fast enough without caching.
- Role objects: cached 24 h (they never change at runtime).
- Paginated user lists: cached 5 min (admin/list views only).
"""

import hashlib
from typing import Optional, List, Dict, Any

from django.core.cache import cache
from django.db.models import QuerySet
from django.utils import timezone

from users.models import EmailVerificationToken, Role, User


# ---------------------------------------------------------------------------
# Cache TTLs
# ---------------------------------------------------------------------------

CACHE_TTL_SHORT = 300    # 5 minutes  — paginated list results
CACHE_TTL_LONG  = 86400  # 24 hours   — static role objects


def get_cache_key(prefix: str, identifier: Any) -> str:
    """Generate a consistent cache key."""
    return f"users:{prefix}:{identifier}"


def invalidate_user_cache(user_id: int) -> None:
    """
    Kept for call-site compatibility.
    User objects are no longer cached, so only the list cache needs clearing.
    """
    invalidate_users_list_cache()


def invalidate_users_list_cache() -> None:
    """Invalidate paginated user-list cache entries."""
    if hasattr(cache, 'keys'):
        keys = cache.keys("users:users_list:*")
        if keys:
            cache.delete_many(keys)


# ---------------------------------------------------------------------------
# Role selectors  (safe to cache — roles are static)
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
    """Get roles by multiple names (returns a QuerySet, not cached)."""
    return Role.objects.filter(name__in=names)


def get_registerable_roles() -> QuerySet:
    """Roles a user may self-assign at registration ('manager' excluded)."""
    return Role.objects.filter(name__in=["volunteer", "seeker"])


def get_all_roles() -> QuerySet:
    """Get all roles."""
    return Role.objects.all()


# ---------------------------------------------------------------------------
# User selectors  (always hit the DB — no caching on mutable objects)
# ---------------------------------------------------------------------------

def get_user_by_email(email: str) -> Optional[User]:
    """Get user by email. Always reads from DB."""
    return (
        User.objects
        .filter(email=email.lower())
        .prefetch_related("roles")
        .first()
    )


def email_exists(email: str) -> bool:
    """Lightweight existence check — does not load the full row."""
    return User.objects.filter(email=email.lower()).exists()


def get_user_by_id(user_id: int) -> Optional[User]:
    """Get user by ID. Always reads from DB."""
    return (
        User.objects
        .filter(pk=user_id)
        .prefetch_related("roles")
        .first()
    )


def get_users_with_filters(
    role: Optional[str] = None,
    country: Optional[str] = None,
    is_active: Optional[bool] = None,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """
    Get users with filters and pagination.
    Results are cached briefly (5 min) — this is an admin/list view.
    """
    cache_key_data = (
        f"role:{role or 'all'}|country:{country or 'all'}"
        f"|active:{is_active or 'all'}|page:{page}|size:{page_size}"
    )
    cache_key_hash = hashlib.md5(cache_key_data.encode()).hexdigest()
    cache_key = get_cache_key("users_list", cache_key_hash)

    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return cached_result

    queryset = User.objects.select_related().prefetch_related("roles")

    if role:
        queryset = queryset.filter(roles__name=role)
    if country:
        queryset = queryset.filter(country__iexact=country)
    if is_active is not None:
        queryset = queryset.filter(is_active=is_active)
    if not role:
        queryset = queryset.filter(is_superuser=False)

    start = (page - 1) * page_size
    end   = start + page_size

    total_count = queryset.count()
    users = list(queryset[start:end])

    result = {
        "users": users,
        "total_count": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size if total_count > 0 else 1,
    }

    cache.set(cache_key, result, timeout=CACHE_TTL_SHORT)
    return result


def get_user_with_permissions(user_id: int, requesting_user: User) -> Optional[User]:
    """
    Get user with permission flags attached for update/delete operations.
    """
    target_user = get_user_by_id(user_id)
    if not target_user:
        return None

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
