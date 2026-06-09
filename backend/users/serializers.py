"""
Serializers
===========
Input validation and output shaping only.
No business logic or DB writes live here.
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password

from users.models import GenderChoices, LanguageChoices, Role, User


# ---------------------------------------------------------------------------
# Role
# ---------------------------------------------------------------------------

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name"]


# ---------------------------------------------------------------------------
# User serializers
# ---------------------------------------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
    role_names = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    languages = serializers.ListField(
        child=serializers.ChoiceField(choices=LanguageChoices.choices),
        required=False
    )
    
    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "country",
            "gender", "linkedin", "whatsapp_number", "languages",
            "roles", "role_names", "is_active", "is_staff", "is_superuser",
            "date_joined", "last_login"
        ]
        read_only_fields = ["id", "email", "is_staff", "is_superuser", "date_joined", "last_login"]
    
    def to_representation(self, instance):
        """Convert languages from string to list for output."""
        data = super().to_representation(instance)
        data["languages"] = instance.language_list
        return data
    
    def update(self, instance, validated_data):
        """Handle languages list field."""
        languages = validated_data.pop('languages', None)
        if languages is not None:
            instance.set_languages(languages)
        
        return super().update(instance, validated_data)


class UserUpdateInputSerializer(serializers.Serializer):
    """Serializer for updating user profile (non-email, non-role fields)."""
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    country = serializers.CharField(max_length=100, required=False)
    gender = serializers.ChoiceField(choices=GenderChoices.choices, required=False)
    linkedin = serializers.URLField(max_length=255, required=False)
    whatsapp_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    languages = serializers.ListField(
        child=serializers.ChoiceField(choices=LanguageChoices.choices),
        required=False
    )
    
    def validate(self, data):
        """Ensure at least one field is provided for update."""
        if not data:
            raise serializers.ValidationError("At least one field must be provided for update.")
        return data


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data


# ---------------------------------------------------------------------------
# Registration serializers
# ---------------------------------------------------------------------------

class RegisterInputSerializer(serializers.Serializer):
    """Validates POST /users/register/ payload."""
    
    ROLE_CHOICES = [("volunteer", "Volunteer"), ("seeker", "Seeker")]
    
    email = serializers.EmailField()
    password = serializers.CharField(
        min_length=8,
        write_only=True,
        style={"input_type": "password"},
        validators=[validate_password]
    )
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
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
    
    def validate_email(self, value: str) -> str:
        return value.lower().strip()
    
    def validate_roles(self, value: set) -> list:
        if not value:
            raise serializers.ValidationError(
                "At least one role must be selected: volunteer or seeker."
            )
        return list(value)
    
    def validate_languages(self, value: set) -> list:
        return list(value)


class CreateSuperuserInputSerializer(serializers.Serializer):
    """Validates POST /users/create-superuser/ payload."""
    email = serializers.EmailField()
    password = serializers.CharField(
        min_length=8,
        write_only=True,
        style={"input_type": "password"},
        validators=[validate_password]
    )
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)

    def validate_email(self, value: str) -> str:
        return value.lower().strip()


class RegisterOutputSerializer(serializers.ModelSerializer):
    """201 response shape after a successful registration."""
    roles = RoleSerializer(many=True, read_only=True)
    languages = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "country",
            "gender", "linkedin", "whatsapp_number", "languages", "roles"
        ]
        read_only_fields = fields
    
    def get_languages(self, obj: User) -> list:
        label_map = dict(LanguageChoices.choices)
        return [
            {"code": code, "label": label_map.get(code, code)}
            for code in obj.language_list
        ]


# ---------------------------------------------------------------------------
# Other serializers
# ---------------------------------------------------------------------------

class ResendVerificationInputSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value: str) -> str:
        return value.lower().strip()


class PromoteDemoteSerializer(serializers.Serializer):
    """Serializer for promote/demote operations."""
    user_id = serializers.IntegerField()


class UserListQuerySerializer(serializers.Serializer):
    """Serializer for query parameters in user list."""
    role = serializers.ChoiceField(choices=["volunteer", "seeker", "manager"], required=False)
    country = serializers.CharField(max_length=100, required=False)
    # BooleanField defaults to False when absent — use allow_null so None means "no filter"
    is_active = serializers.BooleanField(required=False, allow_null=True, default=None)
    search = serializers.CharField(required=False, allow_blank=True)
    page = serializers.IntegerField(min_value=1, default=1)
    page_size = serializers.IntegerField(min_value=1, max_value=100, default=20)