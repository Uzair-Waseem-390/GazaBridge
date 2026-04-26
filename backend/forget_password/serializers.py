"""
Serializers
===========
Input validation and output shaping only.
No business logic or DB writes live here.
"""

from rest_framework import serializers


class PasswordResetRequestSerializer(serializers.Serializer):
    """Input for POST /forget-password/request/"""

    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        return value.lower().strip()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Input for POST /forget-password/confirm/<token>/"""

    new_password     = serializers.CharField(
        min_length=8,
        write_only=True,
        style={"input_type": "password"},
    )
    confirm_password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs: dict) -> dict:
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        return attrs