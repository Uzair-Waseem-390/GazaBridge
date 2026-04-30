"""
Serializers
===========
Input validation and output shaping for live sections.
"""

from rest_framework import serializers

from live_sections.models import (
    LiveSection, LiveSectionContent,
    LiveSectionCategoryChoices, LiveSectionStatusChoices,
    SkillLevelChoices, LanguageChoices
)


# ---------------------------------------------------------------------------
# LiveSection Serializers
# ---------------------------------------------------------------------------

class LiveSectionInputSerializer(serializers.Serializer):
    """Validates POST payload for LiveSection."""
    title = serializers.CharField(max_length=255)
    category = serializers.ChoiceField(choices=LiveSectionCategoryChoices.choices)
    description = serializers.CharField()
    skill_level = serializers.ChoiceField(choices=SkillLevelChoices.choices)
    language = serializers.ChoiceField(choices=LanguageChoices.choices)
    sessions_per_week = serializers.IntegerField(min_value=1)
    session_duration = serializers.IntegerField(min_value=1, help_text="Duration in minutes")
    duration_days = serializers.IntegerField(min_value=1)
    ending_date = serializers.DateTimeField()
    status = serializers.ChoiceField(
        choices=LiveSectionStatusChoices.choices,
        required=False,
        default=LiveSectionStatusChoices.ACTIVE
    )
    
    def validate_title(self, value: str) -> str:
        return value.strip()
    
    def validate_description(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip()


class LiveSectionUpdateSerializer(serializers.Serializer):
    """Validates PUT/PATCH payload for LiveSection update."""
    title = serializers.CharField(max_length=255, required=False)
    category = serializers.ChoiceField(choices=LiveSectionCategoryChoices.choices, required=False)
    description = serializers.CharField(required=False)
    skill_level = serializers.ChoiceField(choices=SkillLevelChoices.choices, required=False)
    language = serializers.ChoiceField(choices=LanguageChoices.choices, required=False)
    sessions_per_week = serializers.IntegerField(min_value=1, required=False)
    session_duration = serializers.IntegerField(min_value=1, required=False)
    duration_days = serializers.IntegerField(min_value=1, required=False)
    ending_date = serializers.DateTimeField(required=False)
    status = serializers.ChoiceField(choices=LiveSectionStatusChoices.choices, required=False)
    
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


class LiveSectionOutputSerializer(serializers.ModelSerializer):
    """Output serializer for LiveSection list."""
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.SerializerMethodField(read_only=True)
    contents_count = serializers.SerializerMethodField(read_only=True)
    effective_status = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = LiveSection
        fields = [
            "id", "user", "user_email", "user_full_name",
            "title", "category", "description", "skill_level",
            "language", "sessions_per_week", "session_duration",
            "duration_days", "ending_date", "status", "effective_status",
            "contents_count", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]
    
    def get_user_full_name(self, obj: LiveSection) -> str:
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_contents_count(self, obj: LiveSection) -> int:
        return obj.contents.count()
    
    def get_effective_status(self, obj: LiveSection) -> str:
        return obj.get_effective_status()


class LiveSectionDetailOutputSerializer(serializers.ModelSerializer):
    """Output serializer for LiveSection detail with contents."""
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.SerializerMethodField(read_only=True)
    effective_status = serializers.SerializerMethodField(read_only=True)
    contents = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = LiveSection
        fields = [
            "id", "user", "user_email", "user_full_name",
            "title", "category", "description", "skill_level",
            "language", "sessions_per_week", "session_duration",
            "duration_days", "ending_date", "status", "effective_status",
            "contents", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]
    
    def get_user_full_name(self, obj: LiveSection) -> str:
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_effective_status(self, obj: LiveSection) -> str:
        return obj.get_effective_status()
    
    def get_contents(self, obj: LiveSection) -> list:
        from live_sections.serializers import LiveSectionContentOutputSerializer
        return LiveSectionContentOutputSerializer(obj.contents.all(), many=True).data


# ---------------------------------------------------------------------------
# Content Serializers
# ---------------------------------------------------------------------------

class LiveSectionContentInputSerializer(serializers.Serializer):
    """Validates POST payload for Content."""
    content_title = serializers.CharField(max_length=255)
    link = serializers.URLField(max_length=500)
    description = serializers.CharField(required=False, allow_blank=True, default="")
    
    def validate_content_title(self, value: str) -> str:
        return value.strip()


class LiveSectionContentUpdateSerializer(serializers.Serializer):
    """Validates PUT/PATCH payload for Content update."""
    content_title = serializers.CharField(max_length=255, required=False)
    link = serializers.URLField(max_length=500, required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    
    def validate_content_title(self, value: str) -> str:
        return value.strip() if value else value
    
    def validate(self, data):
        if not data:
            raise serializers.ValidationError("At least one field must be provided for update.")
        return data


class LiveSectionContentOutputSerializer(serializers.ModelSerializer):
    """Output serializer for Content."""
    user_email = serializers.EmailField(source="user.email", read_only=True)
    
    class Meta:
        model = LiveSectionContent
        fields = [
            "id", "live_section", "user", "user_email",
            "content_title", "link", "description",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "live_section", "user", "created_at", "updated_at"]


# ---------------------------------------------------------------------------
# Query Parameter Serializer
# ---------------------------------------------------------------------------

class LiveSectionListQuerySerializer(serializers.Serializer):
    """Query parameters for listing live sections."""
    category = serializers.ChoiceField(choices=LiveSectionCategoryChoices.choices, required=False)
    skill_level = serializers.ChoiceField(choices=SkillLevelChoices.choices, required=False)
    language = serializers.ChoiceField(choices=LanguageChoices.choices, required=False)
    status = serializers.ChoiceField(choices=LiveSectionStatusChoices.choices, required=False)
    user_id = serializers.IntegerField(required=False)
    search = serializers.CharField(max_length=255, required=False)
    ordering = serializers.ChoiceField(
        choices=[
            "created_at", "-created_at", "updated_at", "-updated_at",
            "title", "-title", "ending_date", "-ending_date"
        ],
        required=False,
        default="-created_at"
    )