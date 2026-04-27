"""
Permissions
===========
Custom DRF permission classes for the users app.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrSuperuser(BasePermission):
    """Allow access only to admin (is_staff) or superuser."""
    
    def has_permission(self, request, view):
        return request.user and (
            request.user.is_staff or request.user.is_superuser
        )
    
    def has_object_permission(self, request, view, obj):
        return request.user and (
            request.user.is_staff or request.user.is_superuser
        )


class CanManageUser(BasePermission):
    """
    Permission to manage users based on roles:
    - Everyone can manage (update) their own profile
    - Managers can delete volunteers/seekers (soft delete)
    - Admins can delete anyone except superuser (hard delete)
    - Superusers can delete anyone
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # obj is a User instance
        
        # Delete operation
        if request.method == 'DELETE':
            return request.user.can_delete_user(obj)
        
        # Update/Patch operation
        if request.method in ['PUT', 'PATCH']:
            return request.user.can_update_user(obj)
        
        # Safe methods (GET, HEAD, OPTIONS)
        return True


class CanPromoteDemoteUser(BasePermission):
    """Only admin/superuser can promote/demote users to/from manager role."""
    
    def has_permission(self, request, view):
        return request.user and (
            request.user.is_staff or request.user.is_superuser
        )
    
    def has_object_permission(self, request, view, obj):
        return request.user and (
            request.user.is_staff or request.user.is_superuser
        )


class CanChangePassword(BasePermission):
    """Users can only change their own password."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # For password change, obj is the user who wants to change password
        return request.user.pk == obj.pk