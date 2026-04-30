"""
Courses Models
==============
Separate models for Course, Content, and CourseOfferLink.
"""

from django.conf import settings
from django.db import models


# ---------------------------------------------------------------------------
# Choices
# ---------------------------------------------------------------------------

class CourseStatusChoices(models.TextChoices):
    ACTIVE = "active", "Active"
    INACTIVE = "inactive", "Inactive"
    CLOSED = "closed", "Closed"


class CourseCategoryChoices(models.TextChoices):
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
# Course Model
# ---------------------------------------------------------------------------

class Course(models.Model):
    """
    Course created by any authenticated user.
    Can be linked to multiple offers via CourseOfferLink.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses",
        help_text="User who created this course."
    )
    
    title = models.CharField(max_length=255, help_text="Title of the course.")
    category = models.CharField(max_length=50, choices=CourseCategoryChoices.choices, help_text="Category of the course.")
    description = models.TextField(help_text="Detailed description of the course.")
    skill_level = models.CharField(max_length=20, choices=SkillLevelChoices.choices, help_text="Required skill level for the course.")
    language = models.CharField(max_length=10, choices=LanguageChoices.choices, help_text="Language of instruction.")
    sessions_per_week = models.PositiveIntegerField(help_text="Number of sessions per week.")
    session_duration = models.PositiveIntegerField(help_text="Duration of each session in minutes.")
    course_duration_days = models.PositiveIntegerField(help_text="Total course duration in days.")
    
    status = models.CharField(
        max_length=10,
        choices=CourseStatusChoices.choices,
        default=CourseStatusChoices.ACTIVE,
        help_text="Current status of the course."
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Course"
        verbose_name_plural = "Courses"
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["category"]),
            models.Index(fields=["status"]),
            models.Index(fields=["skill_level"]),
            models.Index(fields=["language"]),
        ]
    
    def __str__(self) -> str:
        return f"Course: {self.title} by {self.user.email}"


# ---------------------------------------------------------------------------
# Content Model
# ---------------------------------------------------------------------------

class Content(models.Model):
    """
    Content item belonging to a course.
    Content cannot exist without a course.
    """
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="contents",
        help_text="Course this content belongs to."
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="course_contents",
        help_text="User who created this content."
    )
    
    content_title = models.CharField(max_length=255, help_text="Title of the content.")
    link = models.URLField(max_length=500, help_text="URL link to the content resource.")
    description = models.TextField(blank=True, default="", help_text="Optional description of the content.")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["created_at"]
        verbose_name = "Content"
        verbose_name_plural = "Contents"
        indexes = [
            models.Index(fields=["course", "created_at"]),
            models.Index(fields=["user"]),
        ]
    
    def __str__(self) -> str:
        return f"Content: {self.content_title} (Course: {self.course.title})"


# ---------------------------------------------------------------------------
# Course-Offer Link Model
# ---------------------------------------------------------------------------

class CourseOfferLink(models.Model):
    """
    Many-to-Many link between Course and Offer.
    A course can be linked to multiple offers, and an offer can have multiple courses.
    When a course or offer is deleted, the link is automatically removed (CASCADE).
    When the linking user is deleted, the link remains (SET_NULL).
    """
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="offer_links",
        help_text="Course being linked."
    )
    offer = models.ForeignKey(
        "posts.Offer",
        on_delete=models.CASCADE,
        related_name="course_links",
        help_text="Offer being linked to."
    )
    linked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,  # === CHANGED: keep link data even if user is deleted ===
        null=True,                   # === ADDED: allow null ===
        blank=True,                  # === ADDED: allow blank in forms ===
        related_name="course_links_created",
        help_text="User who created this link."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ["course", "offer"]
        ordering = ["-created_at"]
        verbose_name = "Course-Offer Link"
        verbose_name_plural = "Course-Offer Links"
        indexes = [
            models.Index(fields=["course"]),
            models.Index(fields=["offer"]),
        ]
    
    def __str__(self) -> str:
        return f"Link: {self.course.title} ↔ {self.offer.offer_name}"