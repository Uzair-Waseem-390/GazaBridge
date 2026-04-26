"""
Selectors
=========
Pure read layer — no writes, no side effects.
Views and services call selectors to fetch data.
"""

from django.db.models import QuerySet

from users.models import EmailVerificationToken, Role, User


# ---------------------------------------------------------------------------
# Role selectors
# ---------------------------------------------------------------------------

def get_role_by_name(name: str) -> Role:
    """Return a Role by name. Raises Role.DoesNotExist if not found."""
    return Role.objects.get(name=name)


def get_roles_by_names(names: list[str]) -> QuerySet:
    return Role.objects.filter(name__in=names)


def get_registerable_roles() -> QuerySet:
    """
    Roles a user may self-assign at registration.
    'manager' is excluded — admin-only grant.
    """
    return Role.objects.filter(name__in=["volunteer", "seeker"])


# ---------------------------------------------------------------------------
# User selectors
# ---------------------------------------------------------------------------

def get_user_by_email(email: str) -> User | None:
    return User.objects.filter(email=email).first()


def email_exists(email: str) -> bool:
    """Lightweight existence check — does not load the full row."""
    return User.objects.filter(email=email).exists()


def get_user_by_id(user_id: int) -> User | None:
    return (
        User.objects
        .filter(pk=user_id)
        .prefetch_related("roles")
        .first()
    )


# ---------------------------------------------------------------------------
# Token selectors
# ---------------------------------------------------------------------------

def get_token_by_value(token_value: str) -> EmailVerificationToken | None:
    """
    Look up a verification token by its UUID string value.
    Returns None if the token does not exist (never raises).
    """
    try:
        return (
            EmailVerificationToken.objects
            .select_related("user")
            .get(token=token_value)
        )
    except (EmailVerificationToken.DoesNotExist, ValueError):
        # ValueError covers malformed UUIDs passed in the URL.
        return None


def get_active_token_for_user(user: User) -> EmailVerificationToken | None:
    """Return the most recent unused, unexpired token for a user, if any."""
    from django.utils import timezone
    return (
        EmailVerificationToken.objects
        .filter(user=user, is_used=False, expires_at__gt=timezone.now())
        .order_by("-created_at")
        .first()
    )