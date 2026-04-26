"""
Serializers
===========
Input validation and output shaping only.
"""

from rest_framework import serializers

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