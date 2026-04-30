"""
Live Sections Models
====================
Models for LiveSection, LiveSectionContent, and LiveSectionOfferLink.
Mirrors the courses app structure with the addition of ending_date for auto-closing.
"""

from django.conf import settings
from django.db import models
from django.utils import timezone


# ---------------------------------------------------------------------------
# Choices (shared with courses but defined here for app independence)
# ---------------------------------------------------------------------------

class LiveSectionStatusChoices(models.TextChoices):
    ACTIVE = "active", "Active"
    INACTIVE = "inactive", "Inactive"
    CLOSED = "closed", "Closed"


class LiveSectionCategoryChoices(models.TextChoices):
    TEACHING_LANGUAGE = "teaching_language", "Teaching / Language"
    TECH_CODING_AI = "tech_coding_ai", "Tech / Coding / AI"
    CAREER_MENTORSHIP = "career_mentorship", "Career / Mentorship"
    MENTAL_HEALTH = "mental_health", "Mental Health"
    CREATIVE_DESIGN = "creative_design", "Creative / Design"
    ACADEMIC = "academic", "Academic"
    OTHERS = "others", "Others"


class SkillLevelChoices(models.TextChoices):
    BEGINNER = "beginner", "Beginner"
    INTERMEDIATE = "intermediate", "Intermediate"
    ADVANCED = "advanced", "Advanced"


class LanguageChoices(models.TextChoices):
    ENGLISH = "en", "English"
    URDU = "ur", "Urdu"
    ARABIC = "ar", "Arabic"
    FRENCH = "fr", "French"
    SPANISH = "es", "Spanish"
    GERMAN = "de", "German"
    CHINESE = "zh", "Chinese"
    HINDI = "hi", "Hindi"
    PORTUGUESE = "pt", "Portuguese"
    RUSSIAN = "ru", "Russian"
    JAPANESE = "ja", "Japanese"
    TURKISH = "tr", "Turkish"


# ---------------------------------------------------------------------------
# LiveSection Model
# ---------------------------------------------------------------------------

class LiveSection(models.Model):
    """
    LiveSection created by any authenticated user.
    Same as Course but with ending_date for auto-closing.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="live_sections",
        help_text="User who created this live section."
    )
    
    title = models.CharField(max_length=255, help_text="Title of the live section.")
    category = models.CharField(max_length=50, choices=LiveSectionCategoryChoices.choices, help_text="Category of the live section.")
    description = models.TextField(help_text="Detailed description of the live section.")
    skill_level = models.CharField(max_length=20, choices=SkillLevelChoices.choices, help_text="Required skill level.")
    language = models.CharField(max_length=10, choices=LanguageChoices.choices, help_text="Language of instruction.")
    sessions_per_week = models.PositiveIntegerField(help_text="Number of sessions per week.")
    session_duration = models.PositiveIntegerField(help_text="Duration of each session in minutes.")
    duration_days = models.PositiveIntegerField(help_text="Total duration in days.")
    
    # The only difference from Course — auto-close trigger
    ending_date = models.DateTimeField(help_text="Date and time when this live section ends.")
    
    status = models.CharField(
        max_length=10,
        choices=LiveSectionStatusChoices.choices,
        default=LiveSectionStatusChoices.ACTIVE,
        help_text="Current status of the live section."
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Live Section"
        verbose_name_plural = "Live Sections"
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["category"]),
            models.Index(fields=["status"]),
            models.Index(fields=["skill_level"]),
            models.Index(fields=["language"]),
            models.Index(fields=["ending_date"]),
        ]
    
    def __str__(self) -> str:
        return f"LiveSection: {self.title} by {self.user.email}"
    
    @property
    def is_ended(self) -> bool:
        """Check if the ending_date has passed."""
        return timezone.now() >= self.ending_date
    
    def get_effective_status(self) -> str:
        """
        Returns the effective status.
        If active but ending_date has passed, returns 'closed' without saving to DB.
        The DB status only changes when manually updated.
        """
        if self.status == LiveSectionStatusChoices.ACTIVE and self.is_ended:
            return LiveSectionStatusChoices.CLOSED
        return self.status


# ---------------------------------------------------------------------------
# LiveSectionContent Model
# ---------------------------------------------------------------------------

class LiveSectionContent(models.Model):
    """
    Content item belonging to a live section.
    Cannot exist without a live section.
    """
    live_section = models.ForeignKey(
        LiveSection,
        on_delete=models.CASCADE,
        related_name="contents",
        help_text="Live section this content belongs to."
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="live_section_contents",
        help_text="User who created this content."
    )
    
    content_title = models.CharField(max_length=255, help_text="Title of the content.")
    link = models.URLField(max_length=500, help_text="URL link to the content resource.")
    description = models.TextField(blank=True, default="", help_text="Optional description of the content.")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["created_at"]
        verbose_name = "Live Section Content"
        verbose_name_plural = "Live Section Contents"
        indexes = [
            models.Index(fields=["live_section", "created_at"]),
            models.Index(fields=["user"]),
        ]
    
    def __str__(self) -> str:
        return f"Content: {self.content_title} (LiveSection: {self.live_section.title})"


# ---------------------------------------------------------------------------
# LiveSection-Offer Link Model
# ---------------------------------------------------------------------------

class LiveSectionOfferLink(models.Model):
    """
    Many-to-Many link between LiveSection and Offer.
    """
    live_section = models.ForeignKey(
        LiveSection,
        on_delete=models.CASCADE,
        related_name="offer_links",
        help_text="Live section being linked."
    )
    offer = models.ForeignKey(
        "posts.Offer",
        on_delete=models.CASCADE,
        related_name="live_section_links",
        help_text="Offer being linked to."
    )
    linked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="live_section_links_created",
        help_text="User who created this link."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ["live_section", "offer"]
        ordering = ["-created_at"]
        verbose_name = "Live Section-Offer Link"
        verbose_name_plural = "Live Section-Offer Links"
        indexes = [
            models.Index(fields=["live_section"]),
            models.Index(fields=["offer"]),
        ]
    
    def __str__(self) -> str:
        return f"Link: {self.live_section.title} ↔ {self.offer.offer_name}"