"""
Permissions
===========
Custom DRF permission classes for the auth app.
"""

from rest_framework.permissions import BasePermission, IsAuthenticated


class IsOwnerOfActivity(BasePermission):
    """
    Combines two checks:
    1. User must be authenticated.
    2. User may only access their own activity record.

    The view must pass the target user (from the URL or object) so
    we can compare against request.user.
    """

    message = "You do not have permission to access this activity record."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # obj is a UserActivity instance.
        return obj.user_id == request.user.pk