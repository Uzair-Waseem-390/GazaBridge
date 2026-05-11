"""
Serializers
===========
"""

from rest_framework import serializers

from notifications.models import Notification, NotificationTypeChoices


class NotificationOutputSerializer(serializers.ModelSerializer):
    """Output serializer for Notification."""
    sender_email = serializers.EmailField(source="sender.email", read_only=True, allow_null=True)
    
    class Meta:
        model = Notification
        fields = [
            "id", "receiver", "sender", "sender_email",
            "type", "content", "is_read", "created_at"
        ]
        read_only_fields = ["id", "receiver", "sender", "created_at"]


class UnreadCountOutputSerializer(serializers.Serializer):
    """Output for unread count."""
    unread_count = serializers.IntegerField()


class AdminNotificationInputSerializer(serializers.Serializer):
    """Validates admin notification creation."""
    content = serializers.CharField()
    type = serializers.ChoiceField(
        choices=NotificationTypeChoices.choices,
        default=NotificationTypeChoices.NORMAL
    )
    target_groups = serializers.MultipleChoiceField(
        choices=[
            ("volunteers", "Volunteers"),
            ("seekers", "Seekers"),
            ("managers", "Managers"),
            ("admins", "Admins"),
            ("all_users", "All Users"),
        ]
    )
    
    def validate_content(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Content cannot be empty.")
        return value.strip()