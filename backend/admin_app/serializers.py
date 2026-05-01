"""
Serializers
===========
"""

from rest_framework import serializers
from users.models import User


class UserStatsOutputSerializer(serializers.Serializer):
    """Output for user statistics."""
    total_users = serializers.IntegerField()
    volunteers = serializers.IntegerField()
    seekers = serializers.IntegerField()
    both = serializers.IntegerField()
    managers = serializers.IntegerField()
    admins = serializers.IntegerField()
    inactive = serializers.IntegerField()


class UserRoleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for user lists (volunteers, seekers, etc.)."""
    roles = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "roles"]
    
    def get_roles(self, obj: User) -> list:
        return list(obj.roles.values_list("name", flat=True))