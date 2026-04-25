"""
Services
========
Write layer and business-logic enforcement.
Views never touch the ORM directly — they delegate to services.
This keeps views thin and makes business rules easy to unit-test
without spinning up HTTP machinery.
"""

import logging

from django.core.cache import cache
from django.db import transaction

from ..models import User
from ..selectors.user_selectors import email_exists, get_registerable_roles, get_roles_by_names

logger = logging.getLogger(__name__)

# How long (seconds) the cached user payload lives in Redis DB-1.
USER_CACHE_TTL = 60  # 1 minute — intentionally short for now


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _cache_user(user: User, roles: list[str]) -> None:
    """
    Write a lightweight user snapshot to Redis.
    Key: user:<id>   TTL: USER_CACHE_TTL seconds.
    This is fire-and-forget; a failure must never abort registration.
    """
    payload = {
        "id":         user.pk,
        "email":      user.email,
        "first_name": user.first_name,
        "last_name":  user.last_name,
        "country":    user.country,
        "languages":  user.language_list,
        "roles":      roles,
    }
    try:
        cache.set(f"user:{user.pk}", payload, timeout=USER_CACHE_TTL)
    except Exception:
        # Redis being down must never fail a registration.
        logger.exception("Failed to cache user %s after registration.", user.pk)


def _validate_role_selection(requested_roles: list[str]) -> list[str]:
    """
    Enforce registration role rules:
    - Only 'volunteer' and/or 'seeker' are self-assignable.
    - At least one role must be chosen.
    - Duplicate names are silently de-duplicated.
    Raises ValueError with a human-readable message on any violation.
    """
    allowed_names = {"volunteer", "seeker"}
    cleaned = list(dict.fromkeys(r.strip().lower() for r in requested_roles))  # dedup + normalise

    if not cleaned:
        raise ValueError("At least one role (volunteer or seeker) must be selected.")

    invalid = set(cleaned) - allowed_names
    if invalid:
        raise ValueError(
            f"Invalid role(s): {', '.join(sorted(invalid))}. "
            f"Allowed values at registration: volunteer, seeker."
        )

    return cleaned


# ---------------------------------------------------------------------------
# Public service
# ---------------------------------------------------------------------------

def register_user(
    *,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    country: str,
    roles: list[str],
    languages: list[str] | None = None,
) -> User:
    """
    Create and persist a new user.

    Rules enforced here (not in the model or serializer):
    1. Email uniqueness — returns a clear 400-friendly error.
    2. Role selection — only volunteer / seeker allowed at self-registration.
    3. Roles must exist in the DB (seeded via management command).
    4. User snapshot is written to Redis after a successful commit.

    All DB writes are wrapped in a single atomic transaction so a Redis
    failure or role-assignment failure never leaves a partial user row.

    Args are keyword-only to prevent accidental positional mismatches.
    """
    if email_exists(email):
        raise ValueError(f"An account with the email '{email}' already exists.")

    validated_roles = _validate_role_selection(roles)
    role_qs = get_registerable_roles().filter(name__in=validated_roles)

    # Guard: roles must exist in DB (populated by seed management command).
    found_names = set(role_qs.values_list("name", flat=True))
    missing = set(validated_roles) - found_names
    if missing:
        logger.error(
            "Role seed missing from DB: %s. Run `manage.py seed_roles`.", missing
        )
        raise ValueError(
            "Server configuration error: required roles are not seeded. "
            "Please contact support."
        )

    languages_str = ",".join(languages) if languages else ""

    with transaction.atomic():
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            country=country,
            languages=languages_str,
        )
        user.roles.set(role_qs)

    _cache_user(user, validated_roles)
    return user


# ---------------------------------------------------------------------------
# Admin-only service: promote a user to manager
# ---------------------------------------------------------------------------

def assign_manager_role(*, target_user: User, requesting_user: User) -> User:
    """
    Promote target_user to 'manager'.

    Rules:
    - Only admin (is_staff=True) or superuser may call this.
    - Target must already be a volunteer or seeker.
    - Idempotent: calling it twice is safe.

    This service is intentionally left thin for now — it will be wired
    to an endpoint once the auth app is in place.
    """
    if not (requesting_user.is_staff or requesting_user.is_superuser):
        raise PermissionError("Only admins can assign the manager role.")

    if not (target_user.is_volunteer or target_user.is_seeker):
        raise ValueError(
            "Cannot promote to manager: user must first be a volunteer or seeker."
        )

    from .selectors import get_role_by_name  # local import to avoid circular at module load
    manager_role = get_role_by_name("manager")
    target_user.roles.add(manager_role)
    return target_user