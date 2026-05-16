"""
Services
========
Write layer and business-logic enforcement.
No HTTP awareness — views call services, never the ORM directly.
"""

import logging
from typing import List, Optional, Dict, Any

from django.core.cache import cache
from django.db import transaction
from django.utils import timezone

from users.models import EmailVerificationToken, User, Role
from users.selectors.user_selectors import (
    email_exists, get_registerable_roles, get_user_by_email,
    get_user_by_id, get_token_by_value, get_role_by_name,
    invalidate_user_cache, invalidate_users_list_cache
)
from users.tasks import send_verification_email, build_cache_key

logger = logging.getLogger(__name__)

_REGISTRATION_CACHE_TTL = 300


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _validate_role_selection(requested_roles: List[str]) -> List[str]:
    """Enforce self-registration role rules."""
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
    """Write the minimal payload the email task needs into Redis DB-1."""
    payload = {
        "email": user.email,
        "first_name": user.first_name,
        "token": str(token.token),
    }
    try:
        cache.set(build_cache_key(user.pk), payload, timeout=_REGISTRATION_CACHE_TTL)
    except Exception:
        logger.exception("Failed to cache registration payload for user %s.", user.pk)


# ---------------------------------------------------------------------------
# Token management
# ---------------------------------------------------------------------------

def create_verification_token(user: User) -> EmailVerificationToken:
    """Create a fresh verification token for the given user."""
    EmailVerificationToken.objects.filter(user=user, is_used=False).delete()
    
    return EmailVerificationToken.objects.create(
        user=user,
        expires_at=timezone.now() + EmailVerificationToken.lifetime(),
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
    roles: List[str],
    languages: Optional[List[str]] = None,
    whatsapp_number: str = "",
) -> User:
    """Create a new inactive user and queue the verification email."""
    if email_exists(email):
        raise ValueError(f"An account with the email '{email}' already exists.")

    validated_roles = _validate_role_selection(roles)
    role_qs = get_registerable_roles().filter(name__in=validated_roles)

    found_names = set(role_qs.values_list("name", flat=True))
    missing = set(validated_roles) - found_names
    if missing:
        logger.error("Role seed missing from DB: %s.", missing)
        raise ValueError(
            "Server configuration error: required roles are not seeded."
        )

    languages_str = ",".join(languages) if languages else ""

    with transaction.atomic():
        user = User.objects.create_user(
            email=email.lower(),
            password=password,
            first_name=first_name,
            last_name=last_name,
            country=country,
            gender=gender,
            linkedin=linkedin,
            whatsapp_number=whatsapp_number,
            languages=languages_str,
        )
        user.roles.set(role_qs)
        token = create_verification_token(user)

    _cache_registration_payload(user, token)
    send_verification_email.delay(user.pk)
    
    # Invalidate any cached list that might include this user
    invalidate_users_list_cache()

    return user


# ---------------------------------------------------------------------------
# Superuser Creation
# ---------------------------------------------------------------------------

def create_superuser_account(
    *,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
) -> User:
    """Create a new superuser account."""
    if email_exists(email):
        raise ValueError(f"An account with the email '{email}' already exists.")

    with transaction.atomic():
        user = User.objects.create_superuser(
            email=email.lower(),
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

    invalidate_users_list_cache()

    return user


# ---------------------------------------------------------------------------
# OAuth Registration
# ---------------------------------------------------------------------------

def register_oauth_user(
    *,
    email: str,
    first_name: str,
    last_name: str,
    country: str,
    gender: str,
    linkedin: str,
    roles: List[str],
    languages: Optional[List[str]] = None,
    whatsapp_number: str = "",
) -> User:
    """
    Create a new user verified via OAuth.
    The email is assumed to be verified, so is_active=True and no email is sent.
    An unusable password is set since authentication goes through OAuth.
    """
    if email_exists(email):
        raise ValueError(f"An account with the email '{email}' already exists.")

    validated_roles = _validate_role_selection(roles)
    role_qs = get_registerable_roles().filter(name__in=validated_roles)

    found_names = set(role_qs.values_list("name", flat=True))
    missing = set(validated_roles) - found_names
    if missing:
        logger.error("Role seed missing from DB: %s.", missing)
        raise ValueError(
            "Server configuration error: required roles are not seeded."
        )

    languages_str = ",".join(languages) if languages else ""

    with transaction.atomic():
        user = User(
            email=email.lower(),
            first_name=first_name,
            last_name=last_name,
            country=country,
            gender=gender,
            linkedin=linkedin,
            whatsapp_number=whatsapp_number,
            languages=languages_str,
            is_active=True,
        )
        user.set_unusable_password()
        user.save()
        
        user.roles.set(role_qs)

    invalidate_users_list_cache()

    return user


# ---------------------------------------------------------------------------
# Email verification
# ---------------------------------------------------------------------------

def verify_email(*, token_value: str) -> User:
    """Verify a user's email using the provided token string."""
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
        
        # Invalidate cache for this user
        invalidate_user_cache(token_obj.user.pk)
        invalidate_users_list_cache()

    return token_obj.user


# ---------------------------------------------------------------------------
# Resend verification
# ---------------------------------------------------------------------------

def resend_verification_email(*, email: str) -> None:
    """Issue a new verification token and re-queue the email task."""
    user = get_user_by_email(email)

    if user is None or user.is_active:
        return

    token = create_verification_token(user)
    _cache_registration_payload(user, token)
    send_verification_email.delay(user.pk)


# ---------------------------------------------------------------------------
# User management (CRUD)
# ---------------------------------------------------------------------------

def update_user_profile(
    *,
    user_id: int,
    requesting_user: User,
    update_data: Dict[str, Any]
) -> User:
    """
    Update a user's profile with permission checks.
    Email and roles cannot be updated here (separate endpoints).
    """
    target_user = get_user_by_id(user_id)
    
    if not target_user:
        raise ValueError("User not found.")
    
    if not requesting_user.can_update_user(target_user):
        raise PermissionError("You don't have permission to update this user.")
    
    # Fields that cannot be updated via profile update
    forbidden_fields = {'email', 'roles'}
    
    with transaction.atomic():
        for field, value in update_data.items():
            if field in forbidden_fields:
                continue

            # Special handling for languages
            if field == 'languages' and isinstance(value, list):
                target_user.set_languages(value)
            elif hasattr(target_user, field):
                setattr(target_user, field, value)

        target_user.save()

        # Invalidate list caches
        invalidate_user_cache(user_id)
        invalidate_users_list_cache()

    # Re-fetch fresh from DB to return the saved state
    fresh_user = User.objects.prefetch_related("roles").get(pk=user_id)
    return fresh_user


def delete_user(
    *,
    user_id: int,
    requesting_user: User,
    hard_delete: bool = False
) -> None:
    """
    Delete a user.
    - Soft delete (is_active=False) for Manager level
    - Hard delete (permanent) for Admin/Superuser
    """
    target_user = get_user_by_id(user_id)
    
    if not target_user:
        raise ValueError("User not found.")
    
    if not requesting_user.can_delete_user(target_user):
        raise PermissionError("You don't have permission to delete this user.")
    
    with transaction.atomic():
        if hard_delete or requesting_user.is_superuser or requesting_user.is_staff:
            # Hard delete (Admin/Superuser)
            target_user.delete()
        else:
            # Soft delete (Manager)
            target_user.is_active = False
            target_user.save(update_fields=["is_active"])
        
        # Invalidate caches
        invalidate_user_cache(user_id)
        invalidate_users_list_cache()


# ---------------------------------------------------------------------------
# Role management (Admin only)
# ---------------------------------------------------------------------------

def promote_to_manager(*, target_user_id: int, requesting_user: User) -> User:
    """Promote target_user to 'manager' (Admin only)."""
    if not (requesting_user.is_staff or requesting_user.is_superuser):
        raise PermissionError("Only admins can assign the manager role.")
    
    target_user = get_user_by_id(target_user_id)
    if not target_user:
        raise ValueError("User not found.")
    
    if not (target_user.is_volunteer or target_user.is_seeker):
        raise ValueError(
            "Cannot promote to manager: user must first be a volunteer or seeker."
        )
    
    with transaction.atomic():
        manager_role = get_role_by_name("manager")
        target_user.roles.add(manager_role)
        
        # Invalidate caches
        invalidate_user_cache(target_user_id)
        invalidate_users_list_cache()
    
    return target_user


def demote_from_manager(*, target_user_id: int, requesting_user: User) -> User:
    """Demote target_user from 'manager' (Admin only)."""
    if not (requesting_user.is_staff or requesting_user.is_superuser):
        raise PermissionError("Only admins can remove the manager role.")
    
    target_user = get_user_by_id(target_user_id)
    if not target_user:
        raise ValueError("User not found.")
    
    with transaction.atomic():
        manager_role = get_role_by_name("manager")
        target_user.roles.remove(manager_role)
        
        # Invalidate caches
        invalidate_user_cache(target_user_id)
        invalidate_users_list_cache()
    
    return target_user


def change_user_password(
    *,
    user_id: int,
    requesting_user: User,
    new_password: str
) -> User:
    """Change user's password (user can only change their own)."""
    target_user = get_user_by_id(user_id)
    
    if not target_user:
        raise ValueError("User not found.")
    
    if requesting_user.pk != target_user.pk:
        raise PermissionError("You can only change your own password.")
    
    with transaction.atomic():
        target_user.set_password(new_password)
        target_user.save()
        
        # Invalidate cache for this user
        invalidate_user_cache(user_id)
    
    return target_user