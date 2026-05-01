"""
Permissions
===========
Only managers, admins (is_staff), and superusers can access.
"""

from rest_framework.permissions import BasePermission


class IsManagerOrAdminOrSuperuser(BasePermission):
    """
    Allow access only to managers, admins (is_staff=True), and superusers.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return (
            request.user.is_manager or
            request.user.is_staff or
            request.user.is_superuser
        )