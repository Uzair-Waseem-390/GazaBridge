"""
Resources Models
================
Simple Resource model with category, title, description, and link.
Only managers, admins, and superusers can create/edit/delete.
Everyone can view.
"""

from django.conf import settings
from django.db import models


class ResourceCategoryChoices(models.TextChoices):
    JOB = "job", "Job Resources"
    INTERNSHIP = "internship", "Internship Resources"
    SCHOLARSHIP = "scholarship", "Scholarship Resources"
    GRANT = "grant", "Grant Resources"
    FELLOWSHIP = "fellowship", "Fellowship Resources"
    FUNDING = "funding", "Funding Resources"
    VOLUNTEER = "volunteer", "Volunteer Resources"
    OTHER = "other", "Other Resources"


class Resource(models.Model):
    """
    Resource created by manager, admin, or superuser.
    Viewable by all authenticated users.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resources",
        help_text="Manager/admin/superuser who created this resource."
    )

    title = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=ResourceCategoryChoices.choices)
    description = models.TextField()
    link = models.URLField(max_length=500)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Resource"
        verbose_name_plural = "Resources"
        indexes = [
            models.Index(fields=["category"]),
            models.Index(fields=["user", "-created_at"]),
        ]

    def __str__(self) -> str:
        return f"Resource: {self.title} by {self.user.email}"