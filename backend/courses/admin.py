"""
Courses Admin
=============
Admin configuration for Course, Content, and CourseOfferLink models.
"""

from django.contrib import admin

from courses.models import Course, Content, CourseOfferLink


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = [
        "id", "title", "user", "category", "skill_level",
        "language", "status", "created_at"
    ]
    list_filter = ["status", "category", "skill_level", "language", "created_at"]
    search_fields = ["title", "description", "user__email"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "updated_at"]
    
    fieldsets = (
        ("Course Information", {
            "fields": ("user", "title", "category", "description")
        }),
        ("Course Details", {
            "fields": ("skill_level", "language", "sessions_per_week", "session_duration", "course_duration_days")
        }),
        ("Status", {
            "fields": ("status",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )


@admin.register(Content)
class ContentAdmin(admin.ModelAdmin):
    list_display = [
        "id", "content_title", "course", "user", "created_at"
    ]
    list_filter = ["created_at"]
    search_fields = ["content_title", "description", "course__title", "user__email"]
    ordering = ["course", "created_at"]
    readonly_fields = ["created_at", "updated_at"]
    
    fieldsets = (
        ("Content Information", {
            "fields": ("course", "user", "content_title", "link", "description")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )


@admin.register(CourseOfferLink)
class CourseOfferLinkAdmin(admin.ModelAdmin):
    list_display = ["id", "course", "offer", "linked_by", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["course__title", "offer__offer_name", "linked_by__email"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at"]