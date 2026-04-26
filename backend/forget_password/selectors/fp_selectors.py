"""
Selectors
=========
Pure read layer — no writes, no side effects.
"""

from users.models import User

from ..models import PasswordResetToken


def get_user_by_email(email: str) -> User | None:
    """Return a User or None — never raises."""
    return User.objects.filter(email=email).first()


def get_token_by_value(token_value: str) -> PasswordResetToken | None:
    """
    Look up a reset token by its UUID string.
    Returns None for missing or malformed values — never raises.
    """
    try:
        return (
            PasswordResetToken.objects
            .select_related("user")
            .get(token=token_value)
        )
    except (PasswordResetToken.DoesNotExist, ValueError):
        # ValueError covers malformed UUID strings passed in the URL.
        return None