"""
Serializers
===========
Input validation and output shaping for posts.
No business logic or DB writes live here.
"""

from rest_framework import serializers

from posts.models import Offer, Request, CategoryChoices, AvailabilityChoices, PostStatusChoices


# ---------------------------------------------------------------------------
# Offer Serializers
# ---------------------------------------------------------------------------

class OfferInputSerializer(serializers.Serializer):
    """Validates POST/PUT payload for Offer."""
    offer_name = serializers.CharField(max_length=255)
    category = serializers.ChoiceField(choices=CategoryChoices.choices)
    description = serializers.CharField()
    availability = serializers.ChoiceField(choices=AvailabilityChoices.choices)
    status = serializers.ChoiceField(
        choices=PostStatusChoices.choices,
        required=False,
        default=PostStatusChoices.ACTIVE
    )
    
    def validate_offer_name(self, value: str) -> str:
        return value.strip()
    
    def validate_description(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip()


class OfferUpdateSerializer(serializers.Serializer):
    """Validates PUT/PATCH payload for Offer update."""
    offer_name = serializers.CharField(max_length=255, required=False)
    category = serializers.ChoiceField(choices=CategoryChoices.choices, required=False)
    description = serializers.CharField(required=False)
    availability = serializers.ChoiceField(choices=AvailabilityChoices.choices, required=False)
    status = serializers.ChoiceField(choices=PostStatusChoices.choices, required=False)
    
    def validate_offer_name(self, value: str) -> str:
        return value.strip() if value else value
    
    def validate_description(self, value: str) -> str:
        if value and not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip() if value else value
    
    def validate(self, data):
        if not data:
            raise serializers.ValidationError("At least one field must be provided for update.")
        return data


class OfferOutputSerializer(serializers.ModelSerializer):
    """Output serializer for Offer responses."""
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Offer
        fields = [
            "id", "user", "user_email", "user_full_name",
            "offer_name", "category", "description", "availability",
            "status", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]
    
    def get_user_full_name(self, obj: Offer) -> str:
        return f"{obj.user.first_name} {obj.user.last_name}"


# ---------------------------------------------------------------------------
# Request Serializers
# ---------------------------------------------------------------------------

class RequestInputSerializer(serializers.Serializer):
    """Validates POST/PUT payload for Request."""
    request_name = serializers.CharField(max_length=255)
    category = serializers.ChoiceField(choices=CategoryChoices.choices)
    description = serializers.CharField()
    status = serializers.ChoiceField(
        choices=PostStatusChoices.choices,
        required=False,
        default=PostStatusChoices.ACTIVE
    )
    
    def validate_request_name(self, value: str) -> str:
        return value.strip()
    
    def validate_description(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip()


class RequestUpdateSerializer(serializers.Serializer):
    """Validates PUT/PATCH payload for Request update."""
    request_name = serializers.CharField(max_length=255, required=False)
    category = serializers.ChoiceField(choices=CategoryChoices.choices, required=False)
    description = serializers.CharField(required=False)
    status = serializers.ChoiceField(choices=PostStatusChoices.choices, required=False)
    
    def validate_request_name(self, value: str) -> str:
        return value.strip() if value else value
    
    def validate_description(self, value: str) -> str:
        if value and not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip() if value else value
    
    def validate(self, data):
        if not data:
            raise serializers.ValidationError("At least one field must be provided for update.")
        return data


class RequestOutputSerializer(serializers.ModelSerializer):
    """Output serializer for Request responses."""
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Request
        fields = [
            "id", "user", "user_email", "user_full_name",
            "request_name", "category", "description",
            "status", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]
    
    def get_user_full_name(self, obj: Request) -> str:
        return f"{obj.user.first_name} {obj.user.last_name}"


# ---------------------------------------------------------------------------
# Query Parameter Serializers for Listing
# ---------------------------------------------------------------------------

class OfferListQuerySerializer(serializers.Serializer):
    """Query parameters for listing offers."""
    category = serializers.ChoiceField(choices=CategoryChoices.choices, required=False)
    availability = serializers.ChoiceField(choices=AvailabilityChoices.choices, required=False)
    status = serializers.ChoiceField(choices=PostStatusChoices.choices, required=False)
    user_id = serializers.IntegerField(required=False)
    search = serializers.CharField(max_length=255, required=False)
    ordering = serializers.ChoiceField(
        choices=["created_at", "-created_at", "updated_at", "-updated_at", "offer_name", "-offer_name"],
        required=False,
        default="-created_at"
    )


class RequestListQuerySerializer(serializers.Serializer):
    """Query parameters for listing requests."""
    category = serializers.ChoiceField(choices=CategoryChoices.choices, required=False)
    status = serializers.ChoiceField(choices=PostStatusChoices.choices, required=False)
    user_id = serializers.IntegerField(required=False)
    search = serializers.CharField(max_length=255, required=False)
    ordering = serializers.ChoiceField(
        choices=["created_at", "-created_at", "updated_at", "-updated_at", "request_name", "-request_name"],
        required=False,
        default="-created_at"
    )

# ---------------------------------------------------------------------------
# Linked Courses & LiveSections Serializers (for Offer detail)
# ---------------------------------------------------------------------------

class LinkedCourseSerializer(serializers.Serializer):
    """Lightweight serializer for courses linked to an offer."""
    id = serializers.IntegerField()
    title = serializers.CharField()
    status = serializers.CharField()
    user_email = serializers.EmailField()


class LinkedLiveSectionSerializer(serializers.Serializer):
    """Lightweight serializer for live sections linked to an offer."""
    id = serializers.IntegerField()
    title = serializers.CharField()
    status = serializers.CharField()
    effective_status = serializers.CharField()
    ending_date = serializers.DateTimeField()
    user_email = serializers.EmailField()