"""
Services
========
Write layer and business-logic enforcement.
"""

import logging
from typing import Optional, List, Set

from django.db import transaction

from notifications.models import Notification
from notifications.selectors import (
    get_notification_by_id,
    invalidate_notification_cache_for_user,
    invalidate_all_notification_caches
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Global Notification Function (reusable across all apps)
# ---------------------------------------------------------------------------

def send_notification(
    *,
    receiver_id: int,
    content: str,
    sender=None,
    notification_type: str = "normal"
) -> Notification:
    """
    Create a notification and queue email via Celery.
    
    Usage from any app:
        from notifications.services import send_notification
        send_notification(
            receiver_id=user.id,
            content="Your course has been approved!",
            sender=request.user,
            notification_type="normal"
        )
    """
    with transaction.atomic():
        notification = Notification.objects.create(
            receiver_id=receiver_id,
            sender=sender,
            type=notification_type,
            content=content
        )
    
    # Queue email task
    from notifications.tasks import send_notification_email
    send_notification_email.delay(notification.id)
    
    # Invalidate caches for the receiver + flush all list caches
    invalidate_notification_cache_for_user(receiver_id)
    invalidate_all_notification_caches()
    
    return notification


# ---------------------------------------------------------------------------
# Admin Bulk Notifications
# ---------------------------------------------------------------------------

def send_admin_notifications(
    *,
    sender,
    content: str,
    notification_type: str,
    target_user_ids: Set[int]
) -> int:
    """
    Send notifications to multiple users (admin only).
    Returns the number of notifications created.
    """
    notifications = []
    
    with transaction.atomic():
        for user_id in target_user_ids:
            notifications.append(
                Notification(
                    receiver_id=user_id,
                    sender=sender,
                    type=notification_type,
                    content=content
                )
            )
        
        if notifications:
            Notification.objects.bulk_create(notifications)
    
    # Queue email tasks for each notification
    created = Notification.objects.filter(
        receiver_id__in=target_user_ids,
        sender=sender,
        content=content
    ).order_by("-created_at")[:len(target_user_ids)]
    
    from notifications.tasks import send_notification_email
    for notification in created:
        send_notification_email.delay(notification.id)
    
    # Invalidate all caches
    for user_id in target_user_ids:
        invalidate_notification_cache_for_user(user_id)
    invalidate_all_notification_caches()
    
    return len(notifications)


# ---------------------------------------------------------------------------
# Mark Read
# ---------------------------------------------------------------------------

def mark_notification_read(notification_id: int, user_id: int) -> Notification:
    """Mark a single notification as read."""
    notification = get_notification_by_id(notification_id)
    
    if not notification:
        raise ValueError("Notification not found.")
    
    if notification.receiver_id != user_id:
        raise PermissionError("You can only mark your own notifications as read.")
    
    if not notification.is_read:
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        invalidate_notification_cache_for_user(user_id)
    
    return notification


def mark_all_notifications_read(user_id: int) -> int:
    """Mark all notifications for a user as read. Returns count updated."""
    count = Notification.objects.filter(
        receiver_id=user_id, is_read=False
    ).update(is_read=True)
    
    if count > 0:
        invalidate_notification_cache_for_user(user_id)
    
    return count


# ---------------------------------------------------------------------------
# Delete
# ---------------------------------------------------------------------------

def delete_notification(notification_id: int, user_id: int) -> None:
    """Delete a single notification. Only the receiver can delete."""
    notification = get_notification_by_id(notification_id)
    
    if not notification:
        raise ValueError("Notification not found.")
    
    if notification.receiver_id != user_id:
        raise PermissionError("You can only delete your own notifications.")
    
    notification.delete()
    invalidate_notification_cache_for_user(user_id)
    invalidate_all_notification_caches()


def delete_all_notifications(user_id: int) -> int:
    """Delete all notifications for a user. Returns count deleted."""
    count, _ = Notification.objects.filter(receiver_id=user_id).delete()
    
    if count > 0:
        invalidate_notification_cache_for_user(user_id)
        invalidate_all_notification_caches()
    
    return count