"""
Permissions
===========
Only managers, admins (is_staff), and superusers can create/edit/delete.
Everyone authenticated can view.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class CanViewResource(BasePermission):
    """Any authenticated user can view resources."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class CanManageResource(BasePermission):
    """
    Only managers, admins (is_staff), and superusers can create/edit/delete.
    Everyone can view (SAFE_METHODS).
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Safe methods — anyone logged in can view
        if request.method in SAFE_METHODS:
            return True
        
        # Write operations — only manager, admin, superuser
        return (
            request.user.is_manager or
            request.user.is_staff or
            request.user.is_superuser
        )
    
    def has_object_permission(self, request, view, obj):
        # Anyone can view
        if request.method in SAFE_METHODS:
            return True
        
        # Only manager, admin, superuser can edit/delete
        return (
            request.user.is_manager or
            request.user.is_staff or
            request.user.is_superuser
        )