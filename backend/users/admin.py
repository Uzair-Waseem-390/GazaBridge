from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Role, User


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display  = ["id", "name"]
    search_fields = ["name"]
    ordering      = ["name"]


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # ── List view ────────────────────────────────────────────────────────────
    list_display   = ["email", "first_name", "last_name", "country", "is_staff", "is_active"]
    list_filter    = ["is_staff", "is_superuser", "is_active", "roles"]
    search_fields  = ["email", "first_name", "last_name"]
    ordering       = ["email"]

    # ── Detail view ──────────────────────────────────────────────────────────
    fieldsets = (
        ("Identity",     {"fields": ("email", "password")}),
        ("Personal",     {"fields": ("first_name", "last_name", "country", "languages")}),
        ("Roles",        {"fields": ("roles",)}),
        ("Permissions",  {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Timestamps",   {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields":  ("email", "first_name", "last_name", "country", "password1", "password2", "roles"),
        }),
    )

    filter_horizontal = ["roles", "groups", "user_permissions"]

    # ── Restrict manager role assignment to superusers only ──────────────────
    def get_readonly_fields(self, request, obj=None):
        if not request.user.is_superuser:
            return ["is_superuser"]
        return []