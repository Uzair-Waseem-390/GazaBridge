"""
Posts Models
============
Separate models for Offer and Request posts with complete field definitions.
"""

from django.conf import settings
from django.db import models


# ---------------------------------------------------------------------------
# Choices
# ---------------------------------------------------------------------------

class PostStatusChoices(models.TextChoices):
    ACTIVE = "active", "Active"
    INACTIVE = "inactive", "Inactive"
    CLOSED = "closed", "Closed"


class CategoryChoices(models.TextChoices):
    LEARN_LANGUAGE = "learn_language", "Learn a Language"
    LEARN_TECH_AI = "learn_tech_ai", "Learn Tech / AI"
    CAREER_CV_HELP = "career_cv_help", "Career / CV Help"
    MENTAL_HEALTH_SUPPORT = "mental_health_support", "Mental Health Support"
    ACADEMIC_TUITION = "academic_tuition", "Academic Tuition"
    CREATIVE_SKILL = "creative_skill", "Creative Skill"
    OTHERS = "others", "Others"


class AvailabilityChoices(models.TextChoices):
    ONE_TO_TWO = "1_2_hours", "1 - 2 hours / week"
    THREE_TO_FIVE = "3_5_hours", "3 - 5 hours / week"
    SIX_TO_EIGHT = "6_8_hours", "6 - 8 hours / week"
    EIGHT_TO_TEN = "8_10_hours", "8 - 10 hours / week"
    TEN_PLUS = "10_plus_hours", "10+ hours / week"


# ---------------------------------------------------------------------------
# Offer Model
# ---------------------------------------------------------------------------

class Offer(models.Model):
    """
    Offer post created by any authenticated user.
    Represents a service/skill the user is offering to others.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="offers",
        help_text="User who created this offer."
    )
    
    # Required fields
    offer_name = models.CharField(
        max_length=255,
        help_text="Name/title of the offer."
    )
    category = models.CharField(
        max_length=50,
        choices=CategoryChoices.choices,
        help_text="Category of the offer."
    )
    description = models.TextField(
        help_text="Detailed description of the offer."
    )
    availability = models.CharField(
        max_length=20,
        choices=AvailabilityChoices.choices,
        help_text="Weekly availability for this offer."
    )
    
    # Status
    status = models.CharField(
        max_length=10,
        choices=PostStatusChoices.choices,
        default=PostStatusChoices.ACTIVE,
        help_text="Current status of the offer."
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Offer"
        verbose_name_plural = "Offers"
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["category"]),
            models.Index(fields=["status"]),
            models.Index(fields=["availability"]),
        ]
    
    def __str__(self) -> str:
        return f"Offer: {self.offer_name} by {self.user.email}"


# ---------------------------------------------------------------------------
# Request Model
# ---------------------------------------------------------------------------

class Request(models.Model):
    """
    Request post created by any authenticated user.
    Represents a service/skill the user is requesting from others.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="requests",
        help_text="User who created this request."
    )
    
    # Required fields
    request_name = models.CharField(
        max_length=255,
        help_text="Name/title of the request."
    )
    category = models.CharField(
        max_length=50,
        choices=CategoryChoices.choices,
        help_text="Category of the request."
    )
    description = models.TextField(
        help_text="Detailed description of the request."
    )
    
    # Status
    status = models.CharField(
        max_length=10,
        choices=PostStatusChoices.choices,
        default=PostStatusChoices.ACTIVE,
        help_text="Current status of the request."
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Request"
        verbose_name_plural = "Requests"
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["category"]),
            models.Index(fields=["status"]),
        ]
    
    def __str__(self) -> str:
        return f"Request: {self.request_name} by {self.user.email}"