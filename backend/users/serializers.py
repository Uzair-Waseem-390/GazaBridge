"""
Serializers
===========
Input validation and output shaping only.
No business logic or DB writes live here.
"""

from rest_framework import serializers

from users.models import GenderChoices, LanguageChoices, Role, User


# ---------------------------------------------------------------------------
# Role
# ---------------------------------------------------------------------------

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Role
        fields = ["id", "name"]


# ---------------------------------------------------------------------------
# Registration input
# ---------------------------------------------------------------------------

class RegisterInputSerializer(serializers.Serializer):
    """
    Validates POST /users/register/ payload.
    Plain Serializer (not ModelSerializer) to keep the API contract
    decoupled from the model layout.
    """

    ROLE_CHOICES = [("volunteer", "Volunteer"), ("seeker", "Seeker")]

    email      = serializers.EmailField()
    password   = serializers.CharField(
        min_length=8,
        write_only=True,
        style={"input_type": "password"},
    )
    first_name = serializers.CharField(max_length=150)
    last_name  = serializers.CharField(max_length=150)
    country    = serializers.CharField(max_length=100)
    gender     = serializers.ChoiceField(choices=GenderChoices.choices)
    linkedin   = serializers.URLField(max_length=255)
    roles      = serializers.MultipleChoiceField(choices=ROLE_CHOICES)

    # Optional fields
    languages       = serializers.MultipleChoiceField(
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

    def validate_email(self, value: str) -> str:
        return value.lower().strip()

    def validate_roles(self, value: set) -> list[str]:
        if not value:
            raise serializers.ValidationError(
                "At least one role must be selected: volunteer or seeker."
            )
        return list(value)

    def validate_languages(self, value: set) -> list[str]:
        return list(value)


# ---------------------------------------------------------------------------
# Registration output
# ---------------------------------------------------------------------------

class RegisterOutputSerializer(serializers.ModelSerializer):
    """
    201 response shape after a successful registration.
    Read-only — never used for writes.
    """
    roles     = RoleSerializer(many=True, read_only=True)
    languages = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "country",
            "gender",
            "linkedin",
            "whatsapp_number",
            "languages",
            "roles",
        ]
        read_only_fields = fields

    def get_languages(self, obj: User) -> list[dict]:
        label_map = dict(LanguageChoices.choices)
        return [
            {"code": code, "label": label_map.get(code, code)}
            for code in obj.language_list
        ]


# ---------------------------------------------------------------------------
# Resend verification input
# ---------------------------------------------------------------------------

class ResendVerificationInputSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        return value.lower().strip()