"""
Services
========
Write layer and business-logic enforcement.
"""

import logging
from typing import Optional

from django.db import transaction

from chat.models import (
    Conversation, Group, GroupMembership,
    Message, MessageReceipt, Block
)
from chat.selectors import (
    get_or_create_conversation, get_group_by_id,
    get_user_groups,
    set_cached_groups,
    invalidate_user_chat_caches, is_blocked,
)

logger = logging.getLogger(__name__)

MAX_GROUP_MEMBERS = 100


# ---------------------------------------------------------------------------
# Message
# ---------------------------------------------------------------------------

def save_message(
    *,
    sender_id: int,
    content: str,
    conversation_id: Optional[int] = None,
    group_id: Optional[int] = None,
) -> Message:
    """Save a message and update conversation/group timestamps."""
    with transaction.atomic():
        message = Message.objects.create(
            sender_id=sender_id,
            content=content,
            conversation_id=conversation_id,
            group_id=group_id,
        )
        if conversation_id:
            Conversation.objects.filter(pk=conversation_id).update(updated_at=message.created_at)
        if group_id:
            Group.objects.filter(pk=group_id).update(updated_at=message.created_at)

    # Invalidate both participants' caches so the next GET rebuilds from DB.
    # A write-through re-read here risks re-caching a stale snapshot if the
    # cache was already populated before this message (e.g. brand-new conversation).
    if conversation_id:
        conv = Conversation.objects.get(pk=conversation_id)
        invalidate_user_chat_caches(conv.user1_id)
        invalidate_user_chat_caches(conv.user2_id)

    return message


def mark_message_read(message_id: int, user_id: int) -> None:
    """Mark a 1-on-1 message as read."""
    Message.objects.filter(pk=message_id).update(is_read=True)


def mark_group_message_read(message_id: int, user_id: int) -> None:
    """Mark a group message as read for a specific user."""
    MessageReceipt.objects.get_or_create(message_id=message_id, user_id=user_id)


# ---------------------------------------------------------------------------
# Block
# ---------------------------------------------------------------------------

def block_user(blocker_id: int, blocked_id: int) -> Block:
    """Block a user."""
    if blocker_id == blocked_id:
        raise ValueError("You cannot block yourself.")
    
    if is_blocked(blocker_id, blocked_id):
        raise ValueError("User is already blocked.")
    
    block, _ = Block.objects.get_or_create(blocker_id=blocker_id, blocked_id=blocked_id)
    return block


def unblock_user(blocker_id: int, blocked_id: int) -> None:
    """Unblock a user."""
    Block.objects.filter(blocker_id=blocker_id, blocked_id=blocked_id).delete()


# ---------------------------------------------------------------------------
# Group
# ---------------------------------------------------------------------------

def create_group(*, owner_id: int, name: str, description: str = "") -> Group:
    """Create a group and add owner as admin member."""
    with transaction.atomic():
        group = Group.objects.create(
            name=name,
            description=description,
            owner_id=owner_id,
            member_count=1,
        )
        GroupMembership.objects.create(
            group=group,
            user_id=owner_id,
            is_admin=True,
        )
    
    # Write-through
    groups = get_user_groups(owner_id)
    set_cached_groups(owner_id, groups)
    
    return group


def add_member_to_group(*, group_id: int, email: str, added_by_id: int) -> GroupMembership:
    """Add a user to a group by email."""
    from users.models import User
    
    group = get_group_by_id(group_id)
    if not group:
        raise ValueError("Group not found.")
    
    # Check permission
    membership = GroupMembership.objects.filter(group=group, user_id=added_by_id).first()
    if not membership or (not membership.is_admin and group.owner_id != added_by_id):
        raise PermissionError("Only group admins can add members.")
    
    if group.member_count >= MAX_GROUP_MEMBERS:
        raise ValueError(f"Group is full. Max {MAX_GROUP_MEMBERS} members allowed.")
    
    user = User.objects.filter(email=email).first()
    if not user:
        raise ValueError("User with this email not found.")
    
    if GroupMembership.objects.filter(group=group, user=user).exists():
        raise ValueError("User is already a member.")
    
    with transaction.atomic():
        membership = GroupMembership.objects.create(group=group, user=user, is_admin=False)
        group.member_count = GroupMembership.objects.filter(group=group).count()
        group.save(update_fields=["member_count"])
    
    # # Write-through for new member
    # groups = get_user_groups(user.id)
    # set_cached_groups(user.id, groups)
    
    # Invalidate cache for both users — next read will rebuild correctly
    invalidate_user_chat_caches(added_by_id)
    invalidate_user_chat_caches(user.id)
    
    return membership


def remove_member_from_group(*, group_id: int, user_id: int, removed_by_id: int) -> None:
    """Remove a user from a group."""
    group = get_group_by_id(group_id)
    if not group:
        raise ValueError("Group not found.")
    
    if group.owner_id == user_id:
        raise ValueError("Cannot remove the group owner.")
    
    remover = GroupMembership.objects.filter(group=group, user_id=removed_by_id).first()
    if not remover or (not remover.is_admin and group.owner_id != removed_by_id):
        raise PermissionError("Only group admins can remove members.")
    
    with transaction.atomic():
        GroupMembership.objects.filter(group=group, user_id=user_id).delete()
        group.member_count = GroupMembership.objects.filter(group=group).count()
        group.save(update_fields=["member_count"])
    
    # Write-through
    invalidate_user_chat_caches(user_id)


def make_group_admin(*, group_id: int, user_id: int, promoter_id: int) -> None:
    """Make a member an admin. Only group owner can do this."""
    group = get_group_by_id(group_id)
    if not group:
        raise ValueError("Group not found.")
    
    if group.owner_id != promoter_id:
        raise PermissionError("Only the group owner can make admins.")
    
    GroupMembership.objects.filter(group=group, user_id=user_id).update(is_admin=True)


def leave_group(*, group_id: int, user_id: int) -> None:
    """Leave a group. The owner cannot leave — they must delete the group instead."""
    group = get_group_by_id(group_id)
    if not group:
        raise ValueError("Group not found.")

    if group.owner_id == user_id:
        raise ValueError("You are the owner. Transfer ownership or delete the group instead.")

    membership = GroupMembership.objects.filter(group=group, user_id=user_id).first()
    if not membership:
        raise ValueError("You are not a member of this group.")

    with transaction.atomic():
        membership.delete()
        group.member_count = GroupMembership.objects.filter(group=group).count()
        group.save(update_fields=["member_count"])

    invalidate_user_chat_caches(user_id)


def delete_group(*, group_id: int, requesting_user_id: int) -> None:
    """Delete a group. Owner, group admin, manager, admin, superuser can delete."""
    from users.models import User
    user = User.objects.get(pk=requesting_user_id)
    group = get_group_by_id(group_id)
    
    if not group:
        raise ValueError("Group not found.")
    
    # Check permission
    is_owner = group.owner_id == requesting_user_id
    is_group_admin = GroupMembership.objects.filter(group=group, user_id=requesting_user_id, is_admin=True).exists()
    is_staff = user.is_staff or user.is_superuser or user.is_manager
    
    if not (is_owner or is_group_admin or is_staff):
        raise PermissionError("You don't have permission to delete this group.")
    
    # Invalidate all members' caches
    member_ids = list(GroupMembership.objects.filter(group=group).values_list("user_id", flat=True))
    
    group.delete()  # CASCADE deletes memberships and messages
    
    for uid in member_ids:
        invalidate_user_chat_caches(uid)