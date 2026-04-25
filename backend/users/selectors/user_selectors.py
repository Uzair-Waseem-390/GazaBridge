"""
Selectors
=========
Pure read layer. No writes happen here.
Views and services call selectors to query the database.
Keeping reads separate makes them easy to cache, test, and reuse.
"""

from django.db.models import QuerySet

from ..models import Role, User


# ---------------------------------------------------------------------------
# Role selectors
# ---------------------------------------------------------------------------

def get_role_by_name(name: str) -> Role:
    """
    Return a Role instance by name.
    Raises Role.DoesNotExist if not found.
    """
    return Role.objects.get(name=name)


def get_roles_by_names(names: list[str]) -> QuerySet:
    """Return a QuerySet of Role objects matching the given names."""
    return Role.objects.filter(name__in=names)


def get_registerable_roles() -> QuerySet:
    """
    Return only the roles a user may self-assign at registration.
    'manager' is excluded — it can only be granted by an admin.
    """
    return Role.objects.filter(name__in=["volunteer", "seeker"])


# ---------------------------------------------------------------------------
# User selectors
# ---------------------------------------------------------------------------

def get_user_by_email(email: str) -> User | None:
    """Return a User or None — never raises."""
    return User.objects.filter(email=email).first()


def email_exists(email: str) -> bool:
    """Efficient existence check — does not load the full row."""
    return User.objects.filter(email=email).exists()


def get_user_by_id(user_id: int) -> User | None:
    """Return a User or None — never raises."""
    return User.objects.filter(pk=user_id).select_related().prefetch_related("roles").first()