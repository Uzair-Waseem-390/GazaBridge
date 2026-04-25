"""
Serializers
===========
Responsible only for:
  - Validating and deserialising incoming request data.
  - Serialising outgoing model data for responses.

No business logic or DB writes live here.
"""

from rest_framework import serializers

from .models import LanguageChoices, Role, User


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
    Validates the payload sent to POST /users/register/.
    Intentionally a plain Serializer (not ModelSerializer) so the shape
    of the API contract is decoupled from the model layout.
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
    roles      = serializers.MultipleChoiceField(choices=ROLE_CHOICES)
    languages  = serializers.MultipleChoiceField(
        choices=LanguageChoices.choices,
        required=False,
        allow_empty=True,
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
    Shape of the 201 response after a successful registration.
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
            "languages",
            "roles",
        ]
        read_only_fields = fields

    def get_languages(self, obj: User) -> list[dict]:
        """Return a list of {code, label} dicts for readability."""
        label_map = dict(LanguageChoices.choices)
        return [
            {"code": code, "label": label_map.get(code, code)}
            for code in obj.language_list
        ]