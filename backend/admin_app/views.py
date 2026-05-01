"""
Views
=====
"""

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from admin_app.serializers import UserStatsOutputSerializer, UserRoleListSerializer
from admin_app.selectors import (
    get_user_stats,
    get_volunteers, get_seekers, get_both,
    get_managers, get_admins, get_inactive_users
)
from admin_app.permissions import IsManagerOrAdminOrSuperuser
from backend.pagination import StandardResultsSetPagination


class UserStatsView(generics.GenericAPIView):
    """GET admin/users/stats/ — User statistics."""
    permission_classes = [IsAuthenticated, IsManagerOrAdminOrSuperuser]

    def get(self, request, *args, **kwargs):
        stats = get_user_stats()
        serializer = UserStatsOutputSerializer(stats)
        return Response(serializer.data)


class VolunteerListView(generics.ListAPIView):
    """GET admin/users/volunteers/ — List of volunteers only."""
    permission_classes = [IsAuthenticated, IsManagerOrAdminOrSuperuser]
    serializer_class = UserRoleListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return get_volunteers()


class SeekerListView(generics.ListAPIView):
    """GET admin/users/seekers/ — List of seekers only."""
    permission_classes = [IsAuthenticated, IsManagerOrAdminOrSuperuser]
    serializer_class = UserRoleListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return get_seekers()


class BothListView(generics.ListAPIView):
    """GET admin/users/both/ — List of users with both roles."""
    permission_classes = [IsAuthenticated, IsManagerOrAdminOrSuperuser]
    serializer_class = UserRoleListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return get_both()


class ManagerListView(generics.ListAPIView):
    """GET admin/users/managers/ — List of managers."""
    permission_classes = [IsAuthenticated, IsManagerOrAdminOrSuperuser]
    serializer_class = UserRoleListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return get_managers()


class AdminListView(generics.ListAPIView):
    """GET admin/users/admins/ — List of admins (is_staff)."""
    permission_classes = [IsAuthenticated, IsManagerOrAdminOrSuperuser]
    serializer_class = UserRoleListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return get_admins()


class InactiveUserListView(generics.ListAPIView):
    """GET admin/users/inactive/ — List of inactive users."""
    permission_classes = [IsAuthenticated, IsManagerOrAdminOrSuperuser]
    serializer_class = UserRoleListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return get_inactive_users()