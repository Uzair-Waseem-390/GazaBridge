"""
Services
========
Write layer and business-logic enforcement.
No HTTP awareness — views call services, never the ORM directly.
"""

import logging

from django.core.cache import cache
from django.db import transaction
from django.utils import timezone

from users.models import EmailVerificationToken, User
from users.tasks import build_cache_key
from users.tasks import send_verification_email
from users.selectors.user_selectors import email_exists, get_registerable_roles, get_user_by_email
from users.selectors.user_selectors import get_token_by_value
from users.selectors.user_selectors import get_role_by_name

logger = logging.getLogger(__name__)

# Redis DB-1 cache TTL for the registration payload (seconds).
# Must be long enough for Celery to pick up the task.
_REGISTRATION_CACHE_TTL = 300  # 5 minutes


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _validate_role_selection(requested_roles: list[str]) -> list[str]:
    """
    Enforce self-registration role rules:
    - Only 'volunteer' and/or 'seeker' allowed.
    - At least one must be chosen.
    - Duplicates are silently removed.
    Raises ValueError with a human-readable message on violation.
    """
    allowed = {"volunteer", "seeker"}
    cleaned = list(dict.fromkeys(r.strip().lower() for r in requested_roles))

    if not cleaned:
        raise ValueError("At least one role (volunteer or seeker) must be selected.")

    invalid = set(cleaned) - allowed
    if invalid:
        raise ValueError(
            f"Invalid role(s): {', '.join(sorted(invalid))}. "
            "Allowed values at registration: volunteer, seeker."
        )
    return cleaned


def _cache_registration_payload(user: User, token: EmailVerificationToken) -> None:
    """
    Write the minimal payload the email task needs into Redis DB-1.
    Key: email_verify:<user_id>    TTL: _REGISTRATION_CACHE_TTL seconds.

    Fire-and-forget — a Redis failure must never abort registration.
    The Celery task handles a cache miss gracefully by falling back to DB.
    """

    payload = {
        "email":      user.email,
        "first_name": user.first_name,
        "token":      str(token.token),
    }
    try:
        cache.set(build_cache_key(user.pk), payload, timeout=_REGISTRATION_CACHE_TTL)
    except Exception:
        logger.exception(
            "Failed to cache registration payload for user %s. "
            "Celery task will fall back to DB.",
            user.pk,
        )


# ---------------------------------------------------------------------------
# Token management
# ---------------------------------------------------------------------------

def create_verification_token(user: User) -> EmailVerificationToken:
    """
    Create a fresh verification token for the given user.
    Any existing unused tokens for this user are deleted first to keep
    the tokens table clean and prevent confusion from stale links.
    """
    EmailVerificationToken.objects.filter(user=user, is_used=False).delete()

    return EmailVerificationToken.objects.create(
        user       = user,
        expires_at = timezone.now() + EmailVerificationToken.lifetime(),
    )


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------

def register_user(
    *,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    country: str,
    gender: str,
    linkedin: str,
    roles: list[str],
    languages: list[str] | None = None,
    whatsapp_number: str = "",
) -> User:
    """
    Create a new inactive user and queue the verification email.

    Steps:
    1. Validate email uniqueness.
    2. Validate role selection.
    3. Confirm roles exist in DB.
    4. Create User (is_active=False) + assign roles — atomic.
    5. Create a verification token — atomic with user creation.
    6. Cache payload for the Celery task.
    7. Enqueue send_verification_email task.

    Returns the newly created (inactive) User.
    """
    if email_exists(email):
        raise ValueError(f"An account with the email '{email}' already exists.")

    validated_roles = _validate_role_selection(roles)
    role_qs         = get_registerable_roles().filter(name__in=validated_roles)

    found_names = set(role_qs.values_list("name", flat=True))
    missing     = set(validated_roles) - found_names
    if missing:
        logger.error("Role seed missing from DB: %s. Run `manage.py seed_roles`.", missing)
        raise ValueError(
            "Server configuration error: required roles are not seeded. "
            "Please contact support."
        )

    languages_str = ",".join(languages) if languages else ""

    with transaction.atomic():
        user = User.objects.create_user(
            email           = email,
            password        = password,
            first_name      = first_name,
            last_name       = last_name,
            country         = country,
            gender          = gender,
            linkedin        = linkedin,
            whatsapp_number = whatsapp_number,
            languages       = languages_str,
            # is_active defaults to False via UserManager.create_user
        )
        user.roles.set(role_qs)
        token = create_verification_token(user)

    # Cache first, then enqueue — task reads from cache on pickup.
    _cache_registration_payload(user, token)


    send_verification_email.delay(user.pk)

    return user


# ---------------------------------------------------------------------------
# Email verification
# ---------------------------------------------------------------------------

def verify_email(*, token_value: str) -> User:
    """
    Verify a user's email using the provided token string.

    Raises:
        ValueError("invalid")  — token does not exist or is malformed.
        ValueError("expired")  — token exists but has expired.
        ValueError("used")     — token has already been consumed.

    On success: marks the token as used, activates the user, returns User.
    The three distinct error keys let the view give targeted responses.
    """

    token_obj = get_token_by_value(token_value)

    if token_obj is None:
        raise ValueError("invalid")

    if token_obj.is_used:
        raise ValueError("used")

    if timezone.now() >= token_obj.expires_at:
        raise ValueError("expired")

    with transaction.atomic():
        token_obj.is_used = True
        token_obj.save(update_fields=["is_used"])

        token_obj.user.is_active = True
        token_obj.user.save(update_fields=["is_active"])

    return token_obj.user


# ---------------------------------------------------------------------------
# Resend verification
# ---------------------------------------------------------------------------

def resend_verification_email(*, email: str) -> None:
    """
    Issue a new verification token and re-queue the email task.

    Rules:
    - Silently succeeds if email is unknown (prevents user enumeration).
    - Silently succeeds if the user is already active (no harm done).
    - Old unused tokens are cleaned up inside create_verification_token().
    """
    user = get_user_by_email(email)

    if user is None or user.is_active:
        # Return without error — do not reveal whether the email exists.
        return

    token = create_verification_token(user)
    _cache_registration_payload(user, token)


    send_verification_email.delay(user.pk)


# ---------------------------------------------------------------------------
# Admin-only: promote to manager
# ---------------------------------------------------------------------------

def assign_manager_role(*, target_user: User, requesting_user: User) -> User:
    """
    Promote target_user to 'manager'.

    Rules:
    - Only admin (is_staff=True) or superuser may call this.
    - Target must already be a volunteer or seeker.
    - Idempotent: calling it twice is safe.
    """
    if not (requesting_user.is_staff or requesting_user.is_superuser):
        raise PermissionError("Only admins can assign the manager role.")

    if not (target_user.is_volunteer or target_user.is_seeker):
        raise ValueError(
            "Cannot promote to manager: user must first be a volunteer or seeker."
        )


    manager_role = get_role_by_name("manager")
    target_user.roles.add(manager_role)
    return target_user