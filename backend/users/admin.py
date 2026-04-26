from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import EmailVerificationToken, Role, User


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display  = ["id", "name"]
    search_fields = ["name"]
    ordering      = ["name"]


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # ── List view ────────────────────────────────────────────────────────────
    list_display   = [
        "email", "first_name", "last_name", "country",
        "gender", "is_active", "is_staff",
    ]
    list_filter    = ["is_active", "is_staff", "is_superuser", "roles", "gender"]
    search_fields  = ["email", "first_name", "last_name"]
    ordering       = ["email"]

    # Allow toggling is_active directly from the list view.
    list_editable  = ["is_active"]

    # ── Detail view ──────────────────────────────────────────────────────────
    fieldsets = (
        ("Identity",    {"fields": ("email", "password")}),
        ("Personal",    {"fields": ("first_name", "last_name", "country", "gender")}),
        ("Profile",     {"fields": ("linkedin", "whatsapp_number", "languages")}),
        ("Roles",       {"fields": ("roles",)}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Timestamps",  {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email", "first_name", "last_name", "country", "gender",
                "linkedin", "password1", "password2", "roles",
            ),
        }),
    )

    filter_horizontal = ["roles", "groups", "user_permissions"]

    def get_readonly_fields(self, request, obj=None):
        # Non-superusers cannot elevate accounts to superuser.
        if not request.user.is_superuser:
            return ["is_superuser"]
        return []


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display   = ["user", "token", "created_at", "expires_at", "is_used"]
    list_filter    = ["is_used"]
    search_fields  = ["user__email"]
    ordering       = ["-created_at"]
    readonly_fields = ["token", "created_at", "expires_at", "user"]