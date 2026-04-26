"""
Services
========
All auth business logic lives here.
Views call services — never the ORM or cache directly.
"""

import logging
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import check_password
from django.core.cache import cache
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User

from ..models import UserActivity
from ..selectors.auth_selectors import (
    get_activity,
    get_user_by_email,
    is_refresh_token_valid,
)

logger = logging.getLogger(__name__)

# Redis key templates — must match selectors exactly.
_REFRESH_KEY   = "auth:refresh:{jti}"
_BLACKLIST_KEY = "auth:blacklist:{jti}"


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _resolve_roles(user: User) -> list[str]:
    """
    Build the complete role list for a user to embed in the JWT payload
    and return in the login response.

    Hierarchy (highest to lowest):
      superuser → admin (is_staff) → manager (Role row) → volunteer / seeker
    """
    roles = []

    if user.is_superuser:
        roles.append("superuser")
    if user.is_staff and not user.is_superuser:
        roles.append("admin")

    db_roles = list(user.roles.values_list("name", flat=True))
    roles.extend(db_roles)

    return roles


def _store_refresh_token(jti: str, user_id: int, lifetime: timedelta) -> None:
    """Persist refresh JTI → user_id in Redis with matching TTL."""
    try:
        cache.set(
            _REFRESH_KEY.format(jti=jti),
            user_id,
            timeout=int(lifetime.total_seconds()),
        )
    except Exception:
        logger.exception("Failed to store refresh token jti=%s in Redis.", jti)


def _delete_refresh_token(jti: str) -> None:
    """Remove a refresh JTI from Redis (rotation / logout)."""
    try:
        cache.delete(_REFRESH_KEY.format(jti=jti))
    except Exception:
        logger.exception("Failed to delete refresh token jti=%s from Redis.", jti)


def _blacklist_access_token(jti: str, lifetime_seconds: int) -> None:
    """
    Add an access JTI to the blacklist.
    TTL matches the remaining access token lifetime so the key
    auto-expires and doesn't bloat Redis.
    """
    try:
        cache.set(
            _BLACKLIST_KEY.format(jti=jti),
            "1",
            timeout=lifetime_seconds,
        )
    except Exception:
        logger.exception("Failed to blacklist access token jti=%s.", jti)


def _update_last_login(user: User) -> None:
    """
    Upsert UserActivity.last_login_at for the given user.
    Fire-and-forget — a failure must never abort a login.
    """
    try:
        UserActivity.objects.update_or_create(
            user=user,
            defaults={"last_login_at": timezone.now()},
        )
    except Exception:
        logger.exception("Failed to update last_login for user %s.", user.pk)


def _build_token_pair(user: User) -> dict:
    """
    Issue a fresh refresh + access token pair.
    Embeds roles and user_id into the JWT payload.
    Stores the refresh JTI in Redis.
    Returns a dict ready to send as a response.
    """
    roles         = _resolve_roles(user)
    refresh       = RefreshToken.for_user(user)

    # Embed extra claims into both tokens.
    refresh["user_id"] = user.pk
    refresh["roles"]   = roles
    refresh.access_token["user_id"] = user.pk
    refresh.access_token["roles"]   = roles

    refresh_lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]
    _store_refresh_token(str(refresh["jti"]), user.pk, refresh_lifetime)

    return {
        "access":  str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id":         user.pk,
            "email":      user.email,
            "first_name": user.first_name,
            "last_name":  user.last_name,
            "roles":      roles,
        },
    }


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

def login_user(*, email: str, password: str) -> dict:
    """
    Authenticate a user and return a token pair + role info.

    Raises:
        ValueError("not_found")    — email does not exist.
        ValueError("wrong_password") — password mismatch.
        ValueError("not_verified") — account email not verified (is_active=False).
    """
    user = get_user_by_email(email)

    if user is None:
        raise ValueError("not_found")

    if not check_password(password, user.password):
        raise ValueError("wrong_password")

    if not user.is_active:
        raise ValueError("not_verified")

    _update_last_login(user)
    return _build_token_pair(user)


# ---------------------------------------------------------------------------
# Refresh
# ---------------------------------------------------------------------------

def refresh_token(*, old_refresh_token: str) -> dict:
    """
    Rotate the refresh token.

    Steps:
    1. Decode the incoming refresh token (raises if expired / tampered).
    2. Confirm the JTI exists in Redis (not already rotated or logged out).
    3. Delete the old JTI from Redis (one-time use).
    4. Issue a fresh token pair and store the new JTI.

    Raises:
        ValueError("invalid")  — token is malformed, expired, or already used.
    """
    from rest_framework_simplejwt.exceptions import TokenError
    from rest_framework_simplejwt.tokens import RefreshToken as RT

    try:
        old_token = RT(old_refresh_token)
    except TokenError:
        raise ValueError("invalid")

    old_jti = str(old_token["jti"])

    if not is_refresh_token_valid(old_jti):
        raise ValueError("invalid")

    user_id = old_token.get("user_id")
    from auth_app.selectors.auth_selectors import get_user_by_id
    user = get_user_by_id(user_id)

    if user is None or not user.is_active:
        raise ValueError("invalid")

    # Invalidate old token before issuing new one — prevents race conditions.
    _delete_refresh_token(old_jti)

    return _build_token_pair(user)


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------

def logout_user(*, access_jti: str, refresh_jti: str, access_lifetime_seconds: int) -> None:
    """
    Invalidate both tokens immediately.

    - Refresh JTI is deleted from Redis (can no longer be rotated).
    - Access JTI is added to the blacklist with TTL = remaining lifetime.
      After 15 min it auto-expires — no permanent storage needed.
    """
    _delete_refresh_token(refresh_jti)
    _blacklist_access_token(access_jti, access_lifetime_seconds)


# ---------------------------------------------------------------------------
# User Activity
# ---------------------------------------------------------------------------

def update_activity_visibility(*, user: User, is_visible: bool) -> UserActivity:
    """
    Toggle whether the user's last_login_at is visible to others.
    Creates the activity record if it doesn't exist yet.
    """
    activity, _ = UserActivity.objects.update_or_create(
        user=user,
        defaults={"is_visible": is_visible},
    )
    return activity