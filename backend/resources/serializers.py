"""
Serializers
===========
"""

from rest_framework import serializers

from resources.models import Resource, ResourceCategoryChoices


class ResourceInputSerializer(serializers.Serializer):
    """Validates POST payload for Resource."""
    title = serializers.CharField(max_length=255)
    category = serializers.ChoiceField(choices=ResourceCategoryChoices.choices)
    description = serializers.CharField()
    link = serializers.URLField(max_length=500)

    def validate_title(self, value: str) -> str:
        return value.strip()

    def validate_description(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip()


class ResourceUpdateSerializer(serializers.Serializer):
    """Validates PUT/PATCH payload for Resource update."""
    title = serializers.CharField(max_length=255, required=False)
    category = serializers.ChoiceField(choices=ResourceCategoryChoices.choices, required=False)
    description = serializers.CharField(required=False)
    link = serializers.URLField(max_length=500, required=False)

    def validate_title(self, value: str) -> str:
        return value.strip() if value else value

    def validate_description(self, value: str) -> str:
        if value and not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip() if value else value

    def validate(self, data):
        if not data:
            raise serializers.ValidationError("At least one field must be provided for update.")
        return data


class ResourceOutputSerializer(serializers.ModelSerializer):
    """Output serializer for Resource."""
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Resource
        fields = [
            "id", "user", "user_email", "user_full_name",
            "title", "category", "description", "link",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def get_user_full_name(self, obj: Resource) -> str:
        return f"{obj.user.first_name} {obj.user.last_name}"


class ResourceListQuerySerializer(serializers.Serializer):
    """Query parameters for listing resources."""
    category = serializers.ChoiceField(choices=ResourceCategoryChoices.choices, required=False)
    search = serializers.CharField(max_length=255, required=False)
    user_id = serializers.IntegerField(required=False)
    ordering = serializers.ChoiceField(
        choices=[
            "created_at", "-created_at", "updated_at", "-updated_at",
            "title", "-title"
        ],
        required=False,
        default="-created_at"
    )