"""
Serializers
===========
Input validation and output shaping for courses.
No business logic or DB writes live here.
"""

from rest_framework import serializers

from courses.models import (
    Course, Content, CourseOfferLink,
    CourseCategoryChoices, CourseStatusChoices,
    SkillLevelChoices, LanguageChoices
)


# ---------------------------------------------------------------------------
# Course Serializers
# ---------------------------------------------------------------------------

class CourseInputSerializer(serializers.Serializer):
    """Validates POST payload for Course."""
    title = serializers.CharField(max_length=255)
    category = serializers.ChoiceField(choices=CourseCategoryChoices.choices)
    description = serializers.CharField()
    skill_level = serializers.ChoiceField(choices=SkillLevelChoices.choices)
    language = serializers.ChoiceField(choices=LanguageChoices.choices)
    sessions_per_week = serializers.IntegerField(min_value=1)
    session_duration = serializers.IntegerField(min_value=1, help_text="Duration in minutes")
    course_duration_days = serializers.IntegerField(min_value=1)
    status = serializers.ChoiceField(
        choices=CourseStatusChoices.choices,
        required=False,
        default=CourseStatusChoices.ACTIVE
    )
    
    def validate_title(self, value: str) -> str:
        return value.strip()
    
    def validate_description(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip()


class CourseUpdateSerializer(serializers.Serializer):
    """Validates PUT/PATCH payload for Course update."""
    title = serializers.CharField(max_length=255, required=False)
    category = serializers.ChoiceField(choices=CourseCategoryChoices.choices, required=False)
    description = serializers.CharField(required=False)
    skill_level = serializers.ChoiceField(choices=SkillLevelChoices.choices, required=False)
    language = serializers.ChoiceField(choices=LanguageChoices.choices, required=False)
    sessions_per_week = serializers.IntegerField(min_value=1, required=False)
    session_duration = serializers.IntegerField(min_value=1, required=False)
    course_duration_days = serializers.IntegerField(min_value=1, required=False)
    status = serializers.ChoiceField(choices=CourseStatusChoices.choices, required=False)
    
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


class CourseOutputSerializer(serializers.ModelSerializer):
    """Output serializer for Course responses."""
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.SerializerMethodField(read_only=True)
    contents_count = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Course
        fields = [
            "id", "user", "user_email", "user_full_name",
            "title", "category", "description", "skill_level",
            "language", "sessions_per_week", "session_duration",
            "course_duration_days", "status", "contents_count",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]
    
    def get_user_full_name(self, obj: Course) -> str:
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_contents_count(self, obj: Course) -> int:
        return obj.contents.count()


class CourseDetailOutputSerializer(serializers.ModelSerializer):
    """Output serializer for Course detail with contents."""
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.SerializerMethodField(read_only=True)
    contents = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Course
        fields = [
            "id", "user", "user_email", "user_full_name",
            "title", "category", "description", "skill_level",
            "language", "sessions_per_week", "session_duration",
            "course_duration_days", "status", "contents",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]
    
    def get_user_full_name(self, obj: Course) -> str:
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_contents(self, obj: Course) -> list:
        contents = obj.contents.all()
        return ContentOutputSerializer(contents, many=True).data


# ---------------------------------------------------------------------------
# Content Serializers
# ---------------------------------------------------------------------------

class ContentInputSerializer(serializers.Serializer):
    """Validates POST payload for Content."""
    content_title = serializers.CharField(max_length=255)
    link = serializers.URLField(max_length=500)
    description = serializers.CharField(required=False, allow_blank=True, default="")
    
    def validate_content_title(self, value: str) -> str:
        return value.strip()


class ContentUpdateSerializer(serializers.Serializer):
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


class ContentOutputSerializer(serializers.ModelSerializer):
    """Output serializer for Content responses."""
    user_email = serializers.EmailField(source="user.email", read_only=True)
    
    class Meta:
        model = Content
        fields = [
            "id", "course", "user", "user_email",
            "content_title", "link", "description",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "course", "user", "created_at", "updated_at"]


# ---------------------------------------------------------------------------
# Query Parameter Serializers for Listing
# ---------------------------------------------------------------------------

class CourseListQuerySerializer(serializers.Serializer):
    """Query parameters for listing courses."""
    category = serializers.ChoiceField(choices=CourseCategoryChoices.choices, required=False)
    skill_level = serializers.ChoiceField(choices=SkillLevelChoices.choices, required=False)
    language = serializers.ChoiceField(choices=LanguageChoices.choices, required=False)
    status = serializers.ChoiceField(choices=CourseStatusChoices.choices, required=False)
    user_id = serializers.IntegerField(required=False)
    search = serializers.CharField(max_length=255, required=False)
    ordering = serializers.ChoiceField(
        choices=[
            "created_at", "-created_at", "updated_at", "-updated_at",
            "title", "-title", "sessions_per_week", "-sessions_per_week"
        ],
        required=False,
        default="-created_at"
    )