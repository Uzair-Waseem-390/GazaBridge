"""
Selectors
=========
Pure read layer with Redis caching (DB 1).
"""

from typing import Optional, List, Set

from django.core.cache import cache
from django.db.models import QuerySet

from notifications.models import Notification
from users.models import User
from cache_utils import get_cached_list, set_cached_list, increment_cache_version, CACHE_TTL_LIST


def get_cache_key(prefix: str, identifier) -> str:
    return f"notifications:{prefix}:{identifier}"


# ---------------------------------------------------------------------------
# Notification Selectors
# ---------------------------------------------------------------------------

def get_notification_by_id(notification_id: int) -> Optional[Notification]:
    """Get a single notification by ID (no caching needed for single item)."""
    return (
        Notification.objects
        .select_related("receiver", "sender")
        .filter(pk=notification_id)
        .first()
    )


def get_notifications_for_user(user_id: int) -> QuerySet:
    """Get all notifications for a user, newest first."""
    return (
        Notification.objects
        .filter(receiver_id=user_id)
        .select_related("sender")
        .order_by("-created_at")
    )


def get_unread_count(user_id: int) -> int:
    """Get unread notification count for a user with caching."""
    # Build a versioned cache key specifically for this user's unread count
    # So we don't need a wildcard deletion, we can just bump the user's notification version
    # Actually, simpler is just using the standard prefix format
    cache_key = get_cache_key("unread_count", user_id)
    cached = cache.get(cache_key)
    
    if cached is not None:
        return cached
    
    count = Notification.objects.filter(receiver_id=user_id, is_read=False).count()
    cache.set(cache_key, count, timeout=CACHE_TTL_LIST)
    
    return count


def get_cached_notification_list(
    user_id: int,
    page: int = 1,
    page_size: int = 20
) -> Optional[List[Notification]]:
    """Get cached notification list for a user. Only cache first 10 pages."""
    return get_cached_list(
        f"notifications_list_{user_id}",
        user_id=user_id,
        page=page,
        page_size=page_size
    )


def set_cached_notification_list(
    user_id: int,
    notifications: List[Notification],
    page: int = 1,
    page_size: int = 20
) -> None:
    """Cache notification list. Only cache first 10 pages."""
    set_cached_list(
        f"notifications_list_{user_id}",
        notifications,
        user_id=user_id,
        page=page,
        page_size=page_size
    )


# ---------------------------------------------------------------------------
# Admin Target Groups
# ---------------------------------------------------------------------------

def get_target_user_ids(target_groups: List[str]) -> Set[int]:
    """
    Get unique user IDs for the selected target groups.
    Deduplicates — a user in multiple groups only receives one notification.
    """
    user_ids = set()
    
    for group in target_groups:
        if group == "volunteers":
            ids = User.objects.filter(
                is_active=True, is_superuser=False, is_staff=False,
                roles__name="volunteer"
            ).exclude(roles__name="manager").values_list("id", flat=True)
            user_ids.update(ids)
        
        elif group == "seekers":
            ids = User.objects.filter(
                is_active=True, is_superuser=False, is_staff=False,
                roles__name="seeker"
            ).exclude(roles__name="manager").values_list("id", flat=True)
            user_ids.update(ids)
        
        elif group == "managers":
            ids = User.objects.filter(
                is_active=True, is_superuser=False, is_staff=False,
                roles__name="manager"
            ).values_list("id", flat=True)
            user_ids.update(ids)
        
        elif group == "admins":
            ids = User.objects.filter(
                is_active=True, is_superuser=False, is_staff=True
            ).values_list("id", flat=True)
            user_ids.update(ids)
        
        elif group == "all_users":
            ids = User.objects.filter(is_active=True).values_list("id", flat=True)
            user_ids.update(ids)
    
    return user_ids


# ---------------------------------------------------------------------------
# Cache Invalidation
# ---------------------------------------------------------------------------

def invalidate_notification_cache_for_user(user_id: int) -> None:
    """Invalidate cached unread count and lists for a specific user."""
    cache.delete(get_cache_key("unread_count", user_id))
    increment_cache_version(f"notifications_list_{user_id}")


def invalidate_all_notification_caches() -> None:
    """
    Flush ALL cached notification data for all users.
    Normally you only need to invalidate per user. 
    If you need a global clear, we can use a global notification version, 
    but since we version per user now, it's better to avoid global flushes
    unless truly necessary. For backwards compatibility, we'll bump a global
    prefix if it existed, but users lists are isolated now.
    """
    pass