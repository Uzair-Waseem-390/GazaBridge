"""
Selectors
=========
Pure read layer — no Redis, simple DB queries.
"""

from typing import Dict, List
from django.db.models import Q, Count
from users.models import User


def get_user_stats() -> Dict[str, int]:
    """
    Get user statistics excluding superusers.

    Rules:
    - inactive users: ONLY in inactive count
    - admins (is_staff=True): ONLY in admin count
    - managers (has manager role): ONLY in manager count
    - volunteer only (no seeker, no manager): volunteers count
    - seeker only (no volunteer, no manager): seekers count
    - both volunteer and seeker (no manager): both count

    Superusers excluded from all counts.
    """
    base_qs = User.objects.filter(is_superuser=False)

    volunteers = 0
    seekers = 0
    both = 0
    managers = 0
    admins = 0
    inactive = 0

    for user in base_qs.prefetch_related("roles"):
        # Inactive first — only in inactive
        if not user.is_active:
            inactive += 1
            continue

        # Admin (is_staff) — only in admin
        if user.is_staff:
            admins += 1
            continue

        # Manager role — only in manager
        if user.is_manager:
            managers += 1
            continue

        # Volunteer/Seeker/Both
        is_volunteer = user.is_volunteer
        is_seeker = user.is_seeker

        if is_volunteer and is_seeker:
            both += 1
        elif is_volunteer:
            volunteers += 1
        elif is_seeker:
            seekers += 1

    total = volunteers + seekers + both + managers + admins + inactive

    return {
        "total_users": total,
        "volunteers": volunteers,
        "seekers": seekers,
        "both": both,
        "managers": managers,
        "admins": admins,
        "inactive": inactive,
    }


def get_volunteers():
    """Get users who are ONLY volunteers (active, not staff, not manager, not superuser)."""
    return User.objects.filter(
        is_superuser=False,
        is_active=True,
        is_staff=False,
        roles__name="volunteer"
    ).exclude(
        roles__name="seeker"
    ).exclude(
        roles__name="manager"
    ).prefetch_related("roles").distinct().order_by("email")


def get_seekers():
    """Get users who are ONLY seekers (active, not staff, not manager, not superuser)."""
    return User.objects.filter(
        is_superuser=False,
        is_active=True,
        is_staff=False,
        roles__name="seeker"
    ).exclude(
        roles__name="volunteer"
    ).exclude(
        roles__name="manager"
    ).prefetch_related("roles").distinct().order_by("email")


def get_both():
    """Get users who are BOTH volunteer and seeker (active, not staff, not manager, not superuser)."""
    return User.objects.filter(
        is_superuser=False,
        is_active=True,
        is_staff=False,
        roles__name="volunteer"
    ).filter(
        roles__name="seeker"
    ).exclude(
        roles__name="manager"
    ).prefetch_related("roles").distinct().order_by("email")


def get_managers():
    """Get users with manager role (active, not staff, not superuser)."""
    return User.objects.filter(
        is_superuser=False,
        is_active=True,
        is_staff=False,
        roles__name="manager"
    ).prefetch_related("roles").distinct().order_by("email")


def get_admins():
    """Get users with is_staff=True (active, not superuser)."""
    return User.objects.filter(
        is_superuser=False,
        is_active=True,
        is_staff=True
    ).prefetch_related("roles").order_by("email")


def get_inactive_users():
    """Get users with is_active=False (not superuser)."""
    return User.objects.filter(
        is_superuser=False,
        is_active=False
    ).prefetch_related("roles").order_by("email")