"""
Serializers
===========
Input validation and output shaping only.
"""

from rest_framework import serializers

from users.models import GenderChoices, LanguageChoices
from .models import UserActivity


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

class LoginInputSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate_email(self, value: str) -> str:
        return value.lower().strip()


# ---------------------------------------------------------------------------
# Google Auth
# ---------------------------------------------------------------------------

class GoogleAuthInputSerializer(serializers.Serializer):
    code = serializers.CharField(help_text="The authorization code from Google.")
    redirect_uri = serializers.URLField(
        help_text=(
            "The exact redirect URI the frontend used when opening the Google "
            "consent screen. Must match what is registered in Google Cloud Console."
        )
    )


class GoogleRegisterInputSerializer(serializers.Serializer):
    ROLE_CHOICES = [("volunteer", "Volunteer"), ("seeker", "Seeker")]

    registration_token = serializers.CharField(
        help_text="The temporary token returned when a new Google user tries to log in."
    )
    country = serializers.CharField(max_length=100)
    gender = serializers.ChoiceField(choices=GenderChoices.choices)
    linkedin = serializers.URLField(max_length=255)
    roles = serializers.MultipleChoiceField(choices=ROLE_CHOICES)
    
    languages = serializers.MultipleChoiceField(
        choices=LanguageChoices.choices,
        required=False,
        allow_empty=True,
    )
    whatsapp_number = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_roles(self, value: set) -> list:
        if not value:
            raise serializers.ValidationError(
                "At least one role must be selected: volunteer or seeker."
            )
        return list(value)
    
    def validate_languages(self, value: set) -> list:
        return list(value)


# ---------------------------------------------------------------------------
# Refresh
# ---------------------------------------------------------------------------

class RefreshInputSerializer(serializers.Serializer):
    refresh = serializers.CharField()


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------

class LogoutInputSerializer(serializers.Serializer):
    refresh = serializers.CharField(
        help_text="The refresh token to invalidate alongside the access token."
    )


# ---------------------------------------------------------------------------
# User Activity
# ---------------------------------------------------------------------------

class ActivityOutputSerializer(serializers.ModelSerializer):
    """
    Output serializer for a user's own activity record.
    Exposes last_login_at and the visibility toggle.
    """

    class Meta:
        model  = UserActivity
        fields = ["last_login_at", "is_visible", "updated_at"]
        read_only_fields = ["last_login_at", "updated_at"]


class ActivityVisibilityInputSerializer(serializers.Serializer):
    """Input for toggling last-login visibility."""
    is_visible = serializers.BooleanField()