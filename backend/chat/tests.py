"""
Test File for Chat App
======================
Run with: python manage.py test chat
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from chat.models import (
    Conversation, Group, GroupMembership,
    Message, MessageReceipt, Block
)
from chat.services import (
    save_message, mark_message_read, mark_group_message_read,
    block_user, unblock_user,
    create_group, add_member_to_group, remove_member_from_group,
    make_group_admin, delete_group,
)
from chat.selectors import (
    get_or_create_conversation, get_user_conversations,
    get_user_groups, is_blocked, get_blocked_users,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Base Setup
# ---------------------------------------------------------------------------

class ChatTestCase(TestCase):
    """Base test case with common setup."""

    def setUp(self):
        self.client = APIClient()
        
        # Create users
        self.user1 = User.objects.create_user(
            email="user1@test.com",
            password="testpass123",
            first_name="User",
            last_name="One",
            country="PK",
            gender="male",
            linkedin="https://linkedin.com/user1",
        )
        self.user2 = User.objects.create_user(
            email="user2@test.com",
            password="testpass123",
            first_name="User",
            last_name="Two",
            country="PK",
            gender="female",
            linkedin="https://linkedin.com/user2",
        )
        self.user3 = User.objects.create_user(
            email="user3@test.com",
            password="testpass123",
            first_name="User",
            last_name="Three",
            country="PK",
            gender="male",
            linkedin="https://linkedin.com/user3",
        )
        
        # Activate users
        self.user1.is_active = True
        self.user1.save()
        self.user2.is_active = True
        self.user2.save()
        self.user3.is_active = True
        self.user3.save()

    def authenticate(self, user):
        """Helper to authenticate a user."""
        self.client.force_authenticate(user=user)


# ---------------------------------------------------------------------------
# Conversation & Message Tests
# ---------------------------------------------------------------------------

class ConversationTests(ChatTestCase):
    """Tests for 1-on-1 conversations."""

    def test_get_or_create_conversation(self):
        """Conversation should be created with sorted composite key."""
        conv = get_or_create_conversation(self.user1.id, self.user2.id)
        
        self.assertIsNotNone(conv)
        self.assertEqual(conv.composite_key, f"{self.user1.id}_{self.user2.id}")
        
        # Getting again returns the same conversation
        conv2 = get_or_create_conversation(self.user1.id, self.user2.id)
        self.assertEqual(conv.id, conv2.id)
        
        # Reverse order gives same conversation
        conv3 = get_or_create_conversation(self.user2.id, self.user1.id)
        self.assertEqual(conv.id, conv3.id)

    def test_list_user_conversations(self):
        """User should see their conversations."""
        get_or_create_conversation(self.user1.id, self.user2.id)
        get_or_create_conversation(self.user1.id, self.user3.id)
        
        self.authenticate(self.user1)
        response = self.client.get("/chat/conversations/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_other_user_cannot_see_conversation(self):
        """User3 should not see conversations between user1 and user2."""
        get_or_create_conversation(self.user1.id, self.user2.id)
        
        self.authenticate(self.user3)
        response = self.client.get("/chat/conversations/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_save_message_updates_conversation_timestamp(self):
        """Saving a message should update the conversation's updated_at."""
        conv = get_or_create_conversation(self.user1.id, self.user2.id)
        old_updated = conv.updated_at
        
        save_message(
            sender_id=self.user1.id,
            content="Hello!",
            conversation_id=conv.id,
        )
        
        conv.refresh_from_db()
        self.assertGreater(conv.updated_at, old_updated)

    def test_mark_message_read(self):
        """Message should be marked as read."""
        conv = get_or_create_conversation(self.user1.id, self.user2.id)
        msg = save_message(
            sender_id=self.user1.id,
            content="Hello!",
            conversation_id=conv.id,
        )
        
        self.assertFalse(msg.is_read)
        
        mark_message_read(msg.id, self.user2.id)
        msg.refresh_from_db()
        self.assertTrue(msg.is_read)

    def test_conversation_messages_paginated(self):
        """Messages endpoint should return paginated results."""
        conv = get_or_create_conversation(self.user1.id, self.user2.id)
        
        for i in range(5):
            save_message(
                sender_id=self.user1.id,
                content=f"Message {i}",
                conversation_id=conv.id,
            )
        
        self.authenticate(self.user1)
        response = self.client.get(f"/chat/conversations/{conv.id}/messages/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)


# ---------------------------------------------------------------------------
# Block Tests
# ---------------------------------------------------------------------------

class BlockTests(ChatTestCase):
    """Tests for user blocking."""

    def test_block_user(self):
        """User should be able to block another user."""
        block = block_user(self.user1.id, self.user2.id)
        
        self.assertIsNotNone(block)
        self.assertTrue(is_blocked(self.user1.id, self.user2.id))
        self.assertFalse(is_blocked(self.user2.id, self.user1.id))

    def test_block_twice_raises_error(self):
        """Blocking the same user twice should raise ValueError."""
        block_user(self.user1.id, self.user2.id)
        
        with self.assertRaises(ValueError):
            block_user(self.user1.id, self.user2.id)

    def test_block_self_raises_error(self):
        """Blocking yourself should raise ValueError."""
        with self.assertRaises(ValueError):
            block_user(self.user1.id, self.user1.id)

    def test_unblock_user(self):
        """User should be able to unblock another user."""
        block_user(self.user1.id, self.user2.id)
        self.assertTrue(is_blocked(self.user1.id, self.user2.id))
        
        unblock_user(self.user1.id, self.user2.id)
        self.assertFalse(is_blocked(self.user1.id, self.user2.id))

    def test_list_blocked_users(self):
        """Should list all blocked users."""
        block_user(self.user1.id, self.user2.id)
        block_user(self.user1.id, self.user3.id)
        
        blocked = get_blocked_users(self.user1.id)
        self.assertEqual(blocked.count(), 2)

    def test_block_api_endpoint(self):
        """Test the block REST endpoint."""
        self.authenticate(self.user1)
        response = self.client.post(f"/chat/block/{self.user2.id}/")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(is_blocked(self.user1.id, self.user2.id))

    def test_unblock_api_endpoint(self):
        """Test the unblock REST endpoint."""
        block_user(self.user1.id, self.user2.id)
        
        self.authenticate(self.user1)
        response = self.client.delete(f"/chat/unblock/{self.user2.id}/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(is_blocked(self.user1.id, self.user2.id))

    def test_blocked_list_api(self):
        """Test the blocked list REST endpoint."""
        block_user(self.user1.id, self.user2.id)
        
        self.authenticate(self.user1)
        response = self.client.get("/chat/blocked/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


# ---------------------------------------------------------------------------
# Group Tests
# ---------------------------------------------------------------------------

class GroupTests(ChatTestCase):
    """Tests for group chat."""

    def test_create_group(self):
        """Owner should be able to create a group."""
        group = create_group(
            owner_id=self.user1.id,
            name="Test Group",
            description="A test group",
        )
        
        self.assertIsNotNone(group)
        self.assertEqual(group.name, "Test Group")
        self.assertEqual(group.owner_id, self.user1.id)
        self.assertEqual(group.member_count, 1)

    def test_create_group_api(self):
        """Test group creation REST endpoint."""
        self.authenticate(self.user1)
        response = self.client.post("/chat/groups/create/", {
            "name": "API Group",
            "description": "Created via API",
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "API Group")

    def test_add_member_to_group(self):
        """Admin should be able to add members."""
        group = create_group(owner_id=self.user1.id, name="Test Group")
        
        membership = add_member_to_group(
            group_id=group.id,
            email=self.user2.email,
            added_by_id=self.user1.id,
        )
        
        self.assertIsNotNone(membership)
        group.refresh_from_db()
        self.assertEqual(group.member_count, 2)

    def test_non_admin_cannot_add_member(self):
        """Non-admin member should not be able to add members."""
        group = create_group(owner_id=self.user1.id, name="Test Group")
        add_member_to_group(
            group_id=group.id,
            email=self.user2.email,
            added_by_id=self.user1.id,
        )
        
        # user2 is not admin, try to add user3
        with self.assertRaises(PermissionError):
            add_member_to_group(
                group_id=group.id,
                email=self.user3.email,
                added_by_id=self.user2.id,
            )

    def test_make_admin(self):
        """Owner should be able to make a member admin."""
        group = create_group(owner_id=self.user1.id, name="Test Group")
        add_member_to_group(
            group_id=group.id,
            email=self.user2.email,
            added_by_id=self.user1.id,
        )
        
        make_group_admin(
            group_id=group.id,
            user_id=self.user2.id,
            promoter_id=self.user1.id,
        )
        
        membership = GroupMembership.objects.get(group=group, user=self.user2)
        self.assertTrue(membership.is_admin)

    def test_remove_member(self):
        """Admin should be able to remove a member."""
        group = create_group(owner_id=self.user1.id, name="Test Group")
        add_member_to_group(
            group_id=group.id,
            email=self.user2.email,
            added_by_id=self.user1.id,
        )
        
        remove_member_from_group(
            group_id=group.id,
            user_id=self.user2.id,
            removed_by_id=self.user1.id,
        )
        
        group.refresh_from_db()
        self.assertEqual(group.member_count, 1)
        self.assertFalse(
            GroupMembership.objects.filter(group=group, user=self.user2).exists()
        )

    def test_cannot_remove_owner(self):
        """Owner should not be removable."""
        group = create_group(owner_id=self.user1.id, name="Test Group")
        
        with self.assertRaises(ValueError):
            remove_member_from_group(
                group_id=group.id,
                user_id=self.user1.id,
                removed_by_id=self.user1.id,
            )

    def test_delete_group_by_owner(self):
        """Owner should be able to delete group."""
        group = create_group(owner_id=self.user1.id, name="Test Group")
        
        delete_group(group_id=group.id, requesting_user_id=self.user1.id)
        self.assertFalse(Group.objects.filter(pk=group.id).exists())

    def test_list_user_groups(self):
        """User should see groups they belong to."""
        import redis
        try:
            r = redis.Redis(host='localhost', port=6379, db=1)
            keys = r.keys("chat:user_groups:*")
            if keys:
                r.delete(*keys)
        except Exception:
            pass

        create_group(owner_id=self.user1.id, name="Group 1")
        group2 = create_group(owner_id=self.user2.id, name="Group 2")
        add_member_to_group(
            group_id=group2.id,
            email=self.user1.email,
            added_by_id=self.user2.id,
        )
    
        groups = get_user_groups(self.user1.id)
        self.assertEqual(len(groups), 2)

    def test_group_messages(self):
        """Messages in a group should be retrievable."""
        group = create_group(owner_id=self.user1.id, name="Test Group")
        
        save_message(
            sender_id=self.user1.id,
            content="Group message!",
            group_id=group.id,
        )
        
        self.authenticate(self.user1)
        response = self.client.get(f"/chat/groups/{group.id}/messages/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_group_member_limit(self):
        """Group should enforce max 100 members."""
        group = create_group(owner_id=self.user1.id, name="Test Group")
        
        # Add 99 more users (total = 100)
        for i in range(99):
            user = User.objects.create_user(
                email=f"bulk{i}@test.com",
                password="testpass123",
                first_name="Bulk",
                last_name=f"User{i}",
                country="PK",
                gender="male",
                linkedin=f"https://linkedin.com/bulk{i}",
            )
            user.is_active = True
            user.save()
            add_member_to_group(
                group_id=group.id,
                email=user.email,
                added_by_id=self.user1.id,
            )
        
        group.refresh_from_db()
        self.assertEqual(group.member_count, 100)  # 1 owner + 99 added = 100
        
        # 101st member should fail
        user101 = User.objects.create_user(
            email="user101@test.com",
            password="testpass123",
            first_name="Extra",
            last_name="User",
            country="PK",
            gender="male",
            linkedin="https://linkedin.com/user101",
        )
        user101.is_active = True
        user101.save()
        
        with self.assertRaises(ValueError):
            add_member_to_group(
                group_id=group.id,
                email=user101.email,
                added_by_id=self.user1.id,
            )

# ---------------------------------------------------------------------------
# Message Receipt Tests
# ---------------------------------------------------------------------------

class MessageReceiptTests(ChatTestCase):
    """Tests for group message read receipts."""

    def test_mark_group_message_read(self):
        """Group message should have per-user read receipt."""
        group = create_group(owner_id=self.user1.id, name="Test Group")
        add_member_to_group(
            group_id=group.id,
            email=self.user2.email,
            added_by_id=self.user1.id,
        )
        
        msg = save_message(
            sender_id=self.user1.id,
            content="Group message!",
            group_id=group.id,
        )
        
        mark_group_message_read(msg.id, self.user2.id)
        
        receipt = MessageReceipt.objects.filter(message=msg, user=self.user2).first()
        self.assertIsNotNone(receipt)
        self.assertIsNotNone(receipt.read_at)

    def test_unique_receipt_per_user(self):
        """Each user should have only one receipt per message."""
        group = create_group(owner_id=self.user1.id, name="Test Group")
        add_member_to_group(
            group_id=group.id,
            email=self.user2.email,
            added_by_id=self.user1.id,
        )
        
        msg = save_message(
            sender_id=self.user1.id,
            content="Group message!",
            group_id=group.id,
        )
        
        # Mark read twice — should not create duplicate
        mark_group_message_read(msg.id, self.user2.id)
        mark_group_message_read(msg.id, self.user2.id)
        
        count = MessageReceipt.objects.filter(message=msg, user=self.user2).count()
        self.assertEqual(count, 1)


# ---------------------------------------------------------------------------
# Cache Tests
# ---------------------------------------------------------------------------

class CacheTests(ChatTestCase):
    """Tests for Redis caching."""

    def test_write_through_cache_on_new_conversation(self):
        """Creating a conversation should update cache."""
        from chat.selectors import get_user_conversations, set_cached_conversations
        
        # Prime cache
        get_or_create_conversation(self.user1.id, self.user2.id)
        conversations = get_user_conversations(self.user1.id)
        self.assertEqual(len(conversations), 1)
        
        # Cache should return same data
        cached = get_user_conversations(self.user1.id)
        self.assertEqual(len(cached), 1)

    def test_write_through_cache_on_new_group(self):
        """Creating a group should update cache."""
        from chat.selectors import get_user_groups
        
        create_group(owner_id=self.user1.id, name="Cache Test")
        
        groups = get_user_groups(self.user1.id)
        self.assertEqual(len(groups), 1)
        
        cached = get_user_groups(self.user1.id)
        self.assertEqual(len(cached), 1)


# ---------------------------------------------------------------------------
# Permission Tests
# ---------------------------------------------------------------------------

class PermissionTests(ChatTestCase):
    """Tests for API permissions."""

    def test_unauthenticated_user_cannot_access(self):
        """Unauthenticated requests should be rejected."""
        response = self.client.get("/chat/conversations/")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_user_can_only_see_own_conversations(self):
        """User should not see other users' conversations."""
        get_or_create_conversation(self.user1.id, self.user2.id)
        
        self.authenticate(self.user3)
        response = self.client.get("/chat/conversations/")
        
        self.assertEqual(len(response.data), 0)

    def test_non_member_cannot_see_group_messages(self):
        """Non-members should not access group messages."""
        group = create_group(owner_id=self.user1.id, name="Private")
        
        self.authenticate(self.user3)
        response = self.client.get(f"/chat/groups/{group.id}/messages/")
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_non_admin_cannot_add_members(self):
        """Non-admin should not add members via API."""
        group = create_group(owner_id=self.user1.id, name="Test")
        add_member_to_group(
            group_id=group.id,
            email=self.user2.email,
            added_by_id=self.user1.id,
        )
        
        self.authenticate(self.user2)
        response = self.client.post(
            f"/chat/groups/{group.id}/add-member/",
            {"email": self.user3.email},
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)