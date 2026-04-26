from django.contrib import admin

from .models import PasswordResetToken


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display    = ["user", "token", "created_at", "expires_at", "is_used"]
    list_filter     = ["is_used"]
    search_fields   = ["user__email"]
    ordering        = ["-created_at"]
    readonly_fields = ["token", "created_at", "expires_at", "user"]