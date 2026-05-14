"""
Serializers
===========
"""

from rest_framework import serializers

from chat.models import (
    Conversation, Group, GroupMembership, Message, Block
)


# ---------------------------------------------------------------------------
# Conversation
# ---------------------------------------------------------------------------

class ConversationOutputSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "other_user", "last_message", "unread_count", "updated_at"]

    def get_other_user(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        other = obj.user2 if obj.user1_id == request.user.pk else obj.user1
        return {
            "id": other.id,
            "email": other.email,
            "first_name": other.first_name,
            "last_name": other.last_name,
        }

    def get_last_message(self, obj):
        last = obj.messages.last()
        if last:
            return {"content": last.content[:100], "created_at": last.created_at, "sender_id": last.sender_id}
        return None

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if not request:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()


class MessageOutputSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source="sender.email", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "conversation", "group", "sender", "sender_email", "content", "is_read", "created_at"]
        read_only_fields = ["id", "sender", "created_at"]


# ---------------------------------------------------------------------------
# Group
# ---------------------------------------------------------------------------

class GroupInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_name(self, value):
        return value.strip()


class GroupOutputSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ["id", "name", "description", "owner", "owner_email", "member_count", "is_admin", "created_at", "updated_at"]
        read_only_fields = ["id", "owner", "member_count", "created_at", "updated_at"]

    def get_is_admin(self, obj):
        request = self.context.get("request")
        if not request:
            return False
        if obj.owner_id == request.user.pk:
            return True
        return obj.memberships.filter(user=request.user, is_admin=True).exists()


class GroupDetailOutputSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    members = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ["id", "name", "description", "owner", "owner_email", "member_count", "members", "created_at", "updated_at"]

    def get_members(self, obj):
        memberships = obj.memberships.select_related("user").all()
        return [
            {"id": m.user_id, "email": m.user.email, "first_name": m.user.first_name, "last_name": m.user.last_name, "is_admin": m.is_admin}
            for m in memberships
        ]


class AddMemberInputSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower().strip()


# ---------------------------------------------------------------------------
# Block
# ---------------------------------------------------------------------------

class BlockedUserOutputSerializer(serializers.ModelSerializer):
    blocked_email = serializers.EmailField(source="blocked.email", read_only=True)
    blocked_name = serializers.SerializerMethodField()

    class Meta:
        model = Block
        fields = ["id", "blocked", "blocked_email", "blocked_name", "created_at"]

    def get_blocked_name(self, obj):
        return f"{obj.blocked.first_name} {obj.blocked.last_name}"