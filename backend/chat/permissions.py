"""
Permissions
===========
"""

from rest_framework.permissions import BasePermission


class IsConversationParticipant(BasePermission):
    """Only conversation participants can access."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        return obj.user1_id == request.user.pk or obj.user2_id == request.user.pk


class IsGroupMember(BasePermission):
    """Only group members can access group messages."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        return obj.memberships.filter(user_id=request.user.pk).exists()


class CanManageGroup(BasePermission):
    """Group owner, group admin, manager, admin, superuser can manage/delete."""
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_staff or user.is_superuser or user.is_manager:
            return True
        if obj.owner_id == user.pk:
            return True
        return obj.memberships.filter(user=user, is_admin=True).exists()