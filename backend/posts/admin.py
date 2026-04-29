"""
Posts Admin
===========
Admin configuration for Offer and Request models.
"""

from django.contrib import admin

from posts.models import Offer, Request


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = [
        "id", "offer_name", "user", "category", "availability",
        "status", "created_at", "updated_at"
    ]
    list_filter = ["status", "category", "availability", "created_at"]
    search_fields = ["offer_name", "description", "user__email"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "updated_at"]
    
    fieldsets = (
        ("Post Information", {
            "fields": ("user", "offer_name", "category", "description", "availability")
        }),
        ("Status", {
            "fields": ("status",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = [
        "id", "request_name", "user", "category",
        "status", "created_at", "updated_at"
    ]
    list_filter = ["status", "category", "created_at"]
    search_fields = ["request_name", "description", "user__email"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "updated_at"]
    
    fieldsets = (
        ("Post Information", {
            "fields": ("user", "request_name", "category", "description")
        }),
        ("Status", {
            "fields": ("status",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )