from django.contrib import admin
from resources.models import Resource

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "category", "user", "created_at"]
    list_filter = ["category"]
    search_fields = ["title", "description", "user__email"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "updated_at"]