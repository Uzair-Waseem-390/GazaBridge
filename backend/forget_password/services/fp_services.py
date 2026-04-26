"""
Services
========
All forget-password business logic lives here.
Views call services — never the ORM or cache directly.
"""

import logging

from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone

from forget_password.models import PasswordResetToken
from forget_password.selectors.fp_selectors import get_token_by_value, get_user_by_email
from users.models import User

logger = logging.getLogger(__name__)

# Redis DB-1 cache TTL for the reset payload (seconds).
# Slightly longer than the token lifetime so Celery always has time to pick it up.
_RESET_CACHE_TTL = 60 * 20  # 20 minutes


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _create_reset_token(user: User) -> PasswordResetToken:
    """
    Create a fresh password reset token for the user.
    All previous unused tokens are deleted first — only one
    active reset link per user at any time.
    """
    PasswordResetToken.objects.filter(user=user, is_used=False).delete()

    return PasswordResetToken.objects.create(
        user       = user,
        expires_at = timezone.now() + PasswordResetToken.lifetime(),
    )


def _cache_reset_payload(user: User, token: PasswordResetToken) -> None:
    """
    Write the minimal payload the email task needs into Redis DB-1.
    Key: pwd_reset:<user_id>    TTL: _RESET_CACHE_TTL seconds.
    Fire-and-forget — Redis failure must never abort the reset request.
    """
    from forget_password.tasks import build_cache_key

    payload = {
        "email":      user.email,
        "first_name": user.first_name,
        "token":      str(token.token),
    }
    try:
        cache.set(build_cache_key(user.pk), payload, timeout=_RESET_CACHE_TTL)
    except Exception:
        logger.exception(
            "Failed to cache reset payload for user %s. "
            "Celery task will fall back to DB.",
            user.pk,
        )


# ---------------------------------------------------------------------------
# Request password reset
# ---------------------------------------------------------------------------

def request_password_reset(*, email: str) -> None:
    """
    Issue a reset token and queue the email.

    Silently succeeds for unknown emails — prevents user enumeration.
    Silently succeeds for inactive accounts — they should verify email first,
    but we don't reveal that distinction to the caller.
    """
    user = get_user_by_email(email)

    if user is None:
        raise ValueError("not_found")

    if not user.is_active:
        raise ValueError("not_verified")

    token = _create_reset_token(user)
    _cache_reset_payload(user, token)

    from forget_password.tasks import send_password_reset_email
    send_password_reset_email.delay(user.pk)


# ---------------------------------------------------------------------------
# Confirm password reset
# ---------------------------------------------------------------------------

def confirm_password_reset(*, token_value: str, new_password: str) -> None:
    """
    Validate the token and set the new password.

    Raises:
        ValueError("invalid")  — token does not exist or is malformed.
        ValueError("expired")  — token exists but the 15-minute window has passed.
        ValueError("used")     — token has already been consumed.

    On success: marks token as used, updates the user's password atomically.
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

        token_obj.user.set_password(new_password)
        token_obj.user.save(update_fields=["password"])