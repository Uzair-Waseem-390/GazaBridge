from django.contrib import admin

from .models import UserActivity


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display   = ["user", "last_login_at", "is_visible", "updated_at"]
    list_filter    = ["is_visible"]
    search_fields  = ["user__email"]
    ordering       = ["-last_login_at"]
    readonly_fields = ["last_login_at", "updated_at", "user"]

    # Admins can toggle visibility on behalf of users if needed.
    list_editable  = ["is_visible"]