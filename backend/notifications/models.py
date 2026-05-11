"""
Notifications Models
====================
"""

from django.conf import settings
from django.db import models


class NotificationTypeChoices(models.TextChoices):
    NORMAL = "normal", "Normal"
    ALERT = "alert", "Alert"
    URGENT = "urgent", "Urgent"
    ANNOUNCEMENT = "announcement", "Announcement"


class Notification(models.Model):
    """
    Notification sent to a user.
    Sender is optional (nullable for system notifications).
    """
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
        help_text="User who receives this notification."
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_notifications",
        help_text="User who sent this notification (null for system)."
    )
    type = models.CharField(
        max_length=20,
        choices=NotificationTypeChoices.choices,
        default=NotificationTypeChoices.NORMAL,
        help_text="Type of notification."
    )
    content = models.TextField(help_text="Notification message.")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        indexes = [
            models.Index(fields=["receiver", "-created_at"]),
            models.Index(fields=["receiver", "is_read"]),
        ]

    def __str__(self) -> str:
        return f"Notification to {self.receiver.email}: {self.content[:50]}"