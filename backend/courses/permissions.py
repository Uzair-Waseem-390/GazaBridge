"""
Permissions
===========
Custom DRF permission classes for the courses app.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class CanManageCourse(BasePermission):
    """
    Permission to manage courses:
    - Owner can update/delete their own course
    - Admin (is_staff) and Superuser can update/delete any course
    - Manager can only delete courses (not update)
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        
        # Owner can update/delete
        if obj.user_id == request.user.pk:
            return True
        
        # Admin and Superuser can update/delete
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        # Manager can only delete
        if request.method == 'DELETE' and request.user.is_manager:
            return True
        
        return False


class CanManageContent(BasePermission):
    """
    Permission to manage content:
    - Owner (content creator) can update/delete their own content
    - Admin (is_staff) and Superuser can update/delete any content
    - Manager has NO permissions on content
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        
        # Content owner can update/delete
        if obj.user_id == request.user.pk:
            return True
        
        # Admin and Superuser can update/delete
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        # Manager cannot do anything with content
        return False


class CanCreateCourse(BasePermission):
    """Any authenticated user can create a course."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class CanCreateContent(BasePermission):
    """
    Permission to create content:
    - Course owner can create content
    - Admin and Superuser can create content for any course
    - Manager cannot create content
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # obj is the course
        # Course owner can create content
        if obj.user_id == request.user.pk:
            return True
        
        # Admin and Superuser can create content
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        return False


class CanLinkCourseToOffer(BasePermission):
    """
    Permission to link/unlink courses to offers:
    - Normal user: can only link THEIR OWN courses to THEIR OWN offers
    - Admin/Superuser: can link ANY course to ANY offer
    - Manager: no linking permissions
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated