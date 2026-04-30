from django.contrib import admin
from live_sections.models import LiveSection, LiveSectionContent, LiveSectionOfferLink


@admin.register(LiveSection)
class LiveSectionAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "user", "category", "status", "ending_date", "created_at"]
    list_filter = ["status", "category", "skill_level", "language"]
    search_fields = ["title", "description", "user__email"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(LiveSectionContent)
class LiveSectionContentAdmin(admin.ModelAdmin):
    list_display = ["id", "content_title", "live_section", "user", "created_at"]
    search_fields = ["content_title", "live_section__title", "user__email"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(LiveSectionOfferLink)
class LiveSectionOfferLinkAdmin(admin.ModelAdmin):
    list_display = ["id", "live_section", "offer", "linked_by", "created_at"]
    readonly_fields = ["created_at"]