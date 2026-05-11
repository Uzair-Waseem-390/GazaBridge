from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "receiver",
        "sender",
        "type",
        "is_read",
        "short_content",
        "created_at",
    )

    list_filter = (
        "type",
        "is_read",
        "created_at",
    )

    search_fields = (
        "receiver__email",
        "sender__email",
        "content",
    )

    readonly_fields = (
        "created_at",
    )

    ordering = ("-created_at",)

    list_select_related = (
        "receiver",
        "sender",
    )

    actions = (
        "mark_as_read",
        "mark_as_unread",
    )

    fieldsets = (
        (
            "Notification Info",
            {
                "fields": (
                    "receiver",
                    "sender",
                    "type",
                    "content",
                )
            },
        ),
        (
            "Status",
            {
                "fields": (
                    "is_read",
                    "created_at",
                )
            },
        ),
    )

    @admin.display(description="Content")
    def short_content(self, obj):
        return obj.content[:50]

    @admin.action(description="Mark selected notifications as read")
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)

    @admin.action(description="Mark selected notifications as unread")
    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)