"""
Selectors
=========
Pure read layer with Redis caching (DB 1).
"""

import hashlib
from typing import Optional, List, Set

from django.core.cache import cache
from django.db.models import QuerySet

from notifications.models import Notification
from users.models import User


CACHE_TTL_LIST = 300  # 5 minutes


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
    if page > 10:
        return None
    
    cache_key = get_cache_key("list", f"{user_id}:{page}:{page_size}")
    return cache.get(cache_key)


def set_cached_notification_list(
    user_id: int,
    notifications: List[Notification],
    page: int = 1,
    page_size: int = 20
) -> None:
    """Cache notification list. Only cache first 10 pages."""
    if page > 10:
        return
    
    cache_key = get_cache_key("list", f"{user_id}:{page}:{page_size}")
    cache.set(cache_key, notifications, timeout=CACHE_TTL_LIST)


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
    """Invalidate cached unread count for a user."""
    cache.delete(get_cache_key("unread_count", user_id))


def invalidate_all_notification_caches() -> None:
    """Flush ALL cached notification data for all users."""
    import redis
    try:
        r = redis.Redis(host='localhost', port=6379, db=1)
        cursor = 0
        while True:
            cursor, keys = r.scan(cursor, match="*notifications:*", count=100)
            if keys:
                r.delete(*keys)
            if cursor == 0:
                break
    except Exception:
        pass