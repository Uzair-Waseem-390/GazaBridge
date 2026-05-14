"""
Selectors
=========
Pure read layer with Redis caching (DB 1).
Write-through strategy: cache updated on every write, not invalidated.
"""

import hashlib
from typing import Optional, List

from django.core.cache import cache
from django.db.models import Q, Count

from chat.models import Conversation, Group, Message, Block


CACHE_TTL = 300  # 5 minutes
MAX_CACHED_PAGES = 10


def get_cache_key(prefix: str, identifier) -> str:
    return f"chat:{prefix}:{identifier}"


# ---------------------------------------------------------------------------
# Conversation
# ---------------------------------------------------------------------------

def get_conversation_by_id(conv_id: int) -> Optional[Conversation]:
    return Conversation.objects.filter(pk=conv_id).first()


def get_or_create_conversation(user_a_id: int, user_b_id: int) -> Conversation:
    composite = Conversation.build_composite_key(user_a_id, user_b_id)
    smaller, larger = sorted([user_a_id, user_b_id])
    
    conv, _ = Conversation.objects.get_or_create(
        composite_key=composite,
        defaults={"user1_id": smaller, "user2_id": larger}
    )
    return conv


def get_user_conversations(user_id: int):
    cache_key = get_cache_key("conversations", user_id)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached
    
    result = list(
        Conversation.objects
        .filter(Q(user1_id=user_id) | Q(user2_id=user_id))
        .select_related("user1", "user2")
        .prefetch_related("messages")
        .order_by("-updated_at")
    )
    cache.set(cache_key, result, timeout=CACHE_TTL)
    return result


def get_conversation_messages(conversation_id: int):
    return (
        Message.objects
        .filter(conversation_id=conversation_id)
        .select_related("sender")
        .order_by("created_at")
    )


# ---------------------------------------------------------------------------
# Group
# ---------------------------------------------------------------------------

def get_group_by_id(group_id: int) -> Optional[Group]:
    return Group.objects.filter(pk=group_id).prefetch_related("memberships__user").first()


def get_user_groups(user_id: int):
    cache_key = get_cache_key("user_groups", user_id)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached
    
    result = list(
        Group.objects
        .filter(memberships__user_id=user_id)
        .select_related("owner")
        .order_by("-updated_at")
    )
    cache.set(cache_key, result, timeout=CACHE_TTL)
    return result


def get_group_messages(group_id: int):
    return (
        Message.objects
        .filter(group_id=group_id)
        .select_related("sender")
        .order_by("created_at")
    )


# ---------------------------------------------------------------------------
# Block
# ---------------------------------------------------------------------------

def is_blocked(blocker_id: int, blocked_id: int) -> bool:
    return Block.objects.filter(blocker_id=blocker_id, blocked_id=blocked_id).exists()


def get_blocked_users(user_id: int):
    return (
        Block.objects
        .filter(blocker_id=user_id)
        .select_related("blocked")
        .order_by("-created_at")
    )


# ---------------------------------------------------------------------------
# Cache helpers (write-through)
# ---------------------------------------------------------------------------

def set_cached_conversations(user_id: int, conversations: List[Conversation]) -> None:
    cache_key = get_cache_key("conversations", user_id)
    cache.set(cache_key, conversations, timeout=CACHE_TTL)


def set_cached_groups(user_id: int, groups: List[Group]) -> None:
    cache_key = get_cache_key("user_groups", user_id)
    cache.set(cache_key, groups, timeout=CACHE_TTL)


def invalidate_user_chat_caches(user_id: int) -> None:
    """Invalidate all cached chat data for a user."""
    cache.delete(get_cache_key("conversations", user_id))
    cache.delete(get_cache_key("user_groups", user_id))