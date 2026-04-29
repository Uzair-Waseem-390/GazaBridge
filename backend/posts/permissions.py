"""
Permissions
===========
Custom DRF permission classes for the posts app.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class CanManageOffer(BasePermission):
    """
    Permission to manage offers:
    - Owner can update/delete their own offer
    - Admin (is_staff) can update/delete any offer
    - Superuser can update/delete any offer
    - Manager can only delete offers (not update)
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Safe methods allowed for everyone
        if request.method in SAFE_METHODS:
            return True
        
        # Owner can update/delete
        if obj.user_id == request.user.pk:
            return True
        
        # Admin and Superuser can update/delete
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        # Manager can only delete (not update)
        if request.method == 'DELETE' and request.user.is_manager:
            return True
        
        return False


class CanManageRequest(BasePermission):
    """
    Permission to manage requests:
    - Owner can update/delete their own request
    - Admin (is_staff) can update/delete any request
    - Superuser can update/delete any request
    - Manager can only delete requests (not update)
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Safe methods allowed for everyone
        if request.method in SAFE_METHODS:
            return True
        
        # Owner can update/delete
        if obj.user_id == request.user.pk:
            return True
        
        # Admin and Superuser can update/delete
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        # Manager can only delete (not update)
        if request.method == 'DELETE' and request.user.is_manager:
            return True
        
        return False


class CanCreatePost(BasePermission):
    """Any authenticated user can create a post."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated