"""
Permissions
===========
"""

from rest_framework.permissions import BasePermission


class IsOwnerOfNotification(BasePermission):
    """Only the notification receiver can access it."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        return obj.receiver_id == request.user.pk


class IsManagerOrAdminOrSuperuser(BasePermission):
    """Only managers, admins (is_staff), and superusers."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return (
            request.user.is_manager or
            request.user.is_staff or
            request.user.is_superuser
        )