"""
Permissions
===========
Custom DRF permission classes for the live sections app.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class CanManageLiveSection(BasePermission):
    """
    Permission to manage live sections:
    - Owner can update/delete their own live section
    - Admin (is_staff) and Superuser can update/delete any live section
    - Manager can only delete live sections (not update)
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        
        if obj.user_id == request.user.pk:
            return True
        
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        if request.method == 'DELETE' and request.user.is_manager:
            return True
        
        return False


class CanManageLiveSectionContent(BasePermission):
    """
    Permission to manage live section content:
    - Owner (content creator) can update/delete their own content
    - Admin (is_staff) and Superuser can update/delete any content
    - Manager has NO permissions on content
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        
        if obj.user_id == request.user.pk:
            return True
        
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        return False


class CanCreateLiveSection(BasePermission):
    """Any authenticated user can create a live section."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class CanCreateLiveSectionContent(BasePermission):
    """
    Permission to create content:
    - Live section owner can create content
    - Admin and Superuser can create content for any live section
    - Manager cannot create content
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if obj.user_id == request.user.pk:
            return True
        
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        return False


class CanLinkLiveSectionToOffer(BasePermission):
    """
    Permission to link/unlink live sections to offers:
    - Normal user: can only link THEIR OWN live sections to THEIR OWN offers
    - Admin/Superuser: can link ANY live section to ANY offer
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated