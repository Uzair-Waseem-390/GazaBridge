"""
Views
=====
"""

import logging

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from notifications.serializers import (
    NotificationOutputSerializer,
    UnreadCountOutputSerializer,
    AdminNotificationInputSerializer,
)
from notifications.services import (
    send_admin_notifications,
    mark_notification_read, mark_all_notifications_read,
    delete_notification, delete_all_notifications,
)
from notifications.selectors import (
    get_unread_count,
    get_notifications_for_user,
    get_cached_notification_list, set_cached_notification_list,
    get_target_user_ids,
)
from notifications.permissions import IsOwnerOfNotification, IsManagerOrAdminOrSuperuser
from backend.pagination import StandardResultsSetPagination

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# User Notification Endpoints
# ---------------------------------------------------------------------------

class UnreadCountView(generics.GenericAPIView):
    """GET /notifications/unread-count/ — Get unread notification count."""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = get_unread_count(request.user.pk)
        serializer = UnreadCountOutputSerializer({"unread_count": count})
        return Response(serializer.data)


class NotificationListView(generics.ListAPIView):
    """
    GET /notifications/<user_id>/ — List user's notifications.
    Only works for the logged-in user's own notifications.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationOutputSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        
        # Only the logged-in user can see their own notifications
        if user_id != self.request.user.pk:
            raise PermissionDenied("You can only view your own notifications.")
        
        page = int(self.request.query_params.get("page", 1))
        page_size = int(self.request.query_params.get("page_size", 20))
        
        cached = get_cached_notification_list(user_id, page=page, page_size=page_size)
        if cached is not None:
            return cached
        
        queryset = get_notifications_for_user(user_id)
        result_list = list(queryset)
        set_cached_notification_list(user_id, result_list, page=page, page_size=page_size)
        
        return result_list


class MarkReadView(generics.GenericAPIView):
    """POST /notifications/<notification_id>/mark-read/ — Mark single notification as read."""
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id, *args, **kwargs):
        try:
            mark_notification_read(notification_id, request.user.pk)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        
        return Response({"detail": "Notification marked as read."})


class MarkAllReadView(generics.GenericAPIView):
    """POST /notifications/mark-all-read/ — Mark all notifications as read."""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        count = mark_all_notifications_read(request.user.pk)
        return Response({"detail": f"{count} notifications marked as read."})


class NotificationDeleteView(generics.GenericAPIView):
    """DELETE /notifications/<user_id>/<notification_id>/ — Delete a single notification."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id, notification_id, *args, **kwargs):
        try:
            delete_notification(notification_id, user_id)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationDeleteAllView(generics.GenericAPIView):
    """DELETE /notifications/<user_id>/ — Delete all notifications for a user."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id, *args, **kwargs):
        # Only the owner can delete their own notifications
        if user_id != request.user.pk:
            raise PermissionDenied("You can only delete your own notifications.")
        
        count = delete_all_notifications(user_id)
        return Response({"detail": f"{count} notifications deleted."})


# ---------------------------------------------------------------------------
# Admin Notification Endpoints
# ---------------------------------------------------------------------------

class AdminNotificationCreateView(generics.CreateAPIView):
    """
    POST /notifications/admin/send/ — Send bulk notifications (admin only).
    """
    permission_classes = [IsAuthenticated, IsManagerOrAdminOrSuperuser]
    serializer_class = AdminNotificationInputSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        target_user_ids = get_target_user_ids(data["target_groups"])
        
        if not target_user_ids:
            return Response(
                {"detail": "No users found for the selected target groups."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        count = send_admin_notifications(
            sender=request.user,
            content=data["content"],
            notification_type=data["type"],
            target_user_ids=target_user_ids,
        )
        
        return Response(
            {"detail": f"Notifications sent to {count} users."},
            status=status.HTTP_201_CREATED,
        )