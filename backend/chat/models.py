"""
Chat Models
===========
Conversation, Message, Group, GroupMembership, Block, MessageReceipt
"""

from django.conf import settings
from django.db import models


class Conversation(models.Model):
    """
    Represents a 1-on-1 conversation between two users.
    Sorted composite key stored for fast lookup.
    """
    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="conversations_as_user1"
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="conversations_as_user2"
    )
    # Sorted composite: "smaller_id_larger_id"
    composite_key = models.CharField(max_length=50, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["user1", "user2"]
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["composite_key"]),
            models.Index(fields=["-updated_at"]),
        ]

    def __str__(self):
        return f"Conv({self.user1_id}, {self.user2_id})"

    @staticmethod
    def build_composite_key(user_a_id: int, user_b_id: int) -> str:
        smaller, larger = sorted([user_a_id, user_b_id])
        return f"{smaller}_{larger}"


class Group(models.Model):
    """
    Chat group. Owner creates it, admins manage members.
    Max 100 members. member_count is denormalized for O(1) access.
    """
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_groups"
    )
    member_count = models.PositiveIntegerField(default=1)  # denormalized
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Group: {self.name}"


class GroupMembership(models.Model):
    """
    Membership in a group.
    is_admin flag set by owner.
    """
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name="memberships"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="group_memberships"
    )
    is_admin = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["group", "user"]
        ordering = ["joined_at"]

    def __str__(self):
        return f"{self.user.email} in {self.group.name}"


class Message(models.Model):
    """
    Single message model for both 1-on-1 and group chats.
    conversation = null → 1-on-1 message
    group = null → group message
    """
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="messages"
    )
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["conversation", "created_at"]),
            models.Index(fields=["group", "created_at"]),
            models.Index(fields=["sender"]),
        ]

    def __str__(self):
        if self.conversation:
            return f"DM from {self.sender.email}: {self.content[:30]}"
        return f"GroupMsg from {self.sender.email}: {self.content[:30]}"


class MessageReceipt(models.Model):
    """
    Per-user read receipt for group messages.
    """
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name="receipts"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="message_receipts"
    )
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["message", "user"]

    def __str__(self):
        return f"User {self.user_id} read message {self.message_id}"


class Block(models.Model):
    """
    User A blocks user B.
    """
    blocker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="blocked_users"
    )
    blocked = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="blocked_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["blocker", "blocked"]

    def __str__(self):
        return f"{self.blocker.email} blocked {self.blocked.email}"