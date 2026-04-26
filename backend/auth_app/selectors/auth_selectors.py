"""
Selectors
=========
Pure read layer — no writes, no side effects.
"""

import logging

from django.conf import settings
from django.core.cache import cache

from users.models import User

from ..models import UserActivity

logger = logging.getLogger(__name__)

# ── Redis key templates ───────────────────────────────────────────────────────
_REFRESH_KEY  = "auth:refresh:{jti}"   # stores user_id, TTL = refresh lifetime
_BLACKLIST_KEY = "auth:blacklist:{jti}" # stores "1",    TTL = access lifetime


def get_user_by_email(email: str) -> User | None:
    return User.objects.filter(email=email).prefetch_related("roles").first()


def get_user_by_id(user_id: int) -> User | None:
    return (
        User.objects
        .filter(pk=user_id)
        .prefetch_related("roles")
        .first()
    )


def get_activity(user: User) -> UserActivity | None:
    return UserActivity.objects.filter(user=user).first()


# ── Token store helpers (Redis DB-1 via default cache) ───────────────────────

def is_refresh_token_valid(jti: str) -> bool:
    """Return True if the refresh JTI exists in Redis (not rotated/logged-out)."""
    try:
        return cache.get(_REFRESH_KEY.format(jti=jti)) is not None
    except Exception:
        logger.exception("Redis error checking refresh token jti=%s", jti)
        # Fail closed — treat as invalid if Redis is down.
        return False


def is_access_token_blacklisted(jti: str) -> bool:
    """Return True if the access JTI has been blacklisted (logout)."""
    try:
        return cache.get(_BLACKLIST_KEY.format(jti=jti)) is not None
    except Exception:
        logger.exception("Redis error checking blacklist jti=%s", jti)
        # Fail closed — treat as blacklisted if Redis is down.
        return True