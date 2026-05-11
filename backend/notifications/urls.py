from django.urls import path
from notifications.views import (
    UnreadCountView,
    NotificationListView,
    MarkReadView,
    MarkAllReadView,
    NotificationDeleteView,
    NotificationDeleteAllView,
    AdminNotificationCreateView,
)

app_name = "notifications"

urlpatterns = [
    # User endpoints
    path("unread-count/", UnreadCountView.as_view(), name="unread-count"),
    path("<int:user_id>/", NotificationListView.as_view(), name="notification-list"),
    path("<int:notification_id>/mark-read/", MarkReadView.as_view(), name="mark-read"),
    path("mark-all-read/", MarkAllReadView.as_view(), name="mark-all-read"),
    path("<int:user_id>/<int:notification_id>/", NotificationDeleteView.as_view(), name="notification-delete"),
    path("<int:user_id>/all/delete/", NotificationDeleteAllView.as_view(), name="notification-delete-all"),
    
    # Admin endpoints
    path("admin/send/", AdminNotificationCreateView.as_view(), name="admin-send"),
]