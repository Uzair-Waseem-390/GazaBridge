import uuid
from datetime import timedelta

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone

# ---------------------------------------------------------------------------
# Choices
# ---------------------------------------------------------------------------

class LanguageChoices(models.TextChoices):
    ENGLISH = "en", "English"
    URDU = "ur", "Urdu"
    ARABIC = "ar", "Arabic"
    FRENCH = "fr", "French"
    SPANISH = "es", "Spanish"
    GERMAN = "de", "German"
    CHINESE = "zh", "Chinese"
    HINDI = "hi", "Hindi"
    PORTUGUESE = "pt", "Portuguese"
    RUSSIAN = "ru", "Russian"
    JAPANESE = "ja", "Japanese"
    TURKISH = "tr", "Turkish"


class GenderChoices(models.TextChoices):
    MALE = "male", "Male"
    FEMALE = "female", "Female"


# ---------------------------------------------------------------------------
# Role
# ---------------------------------------------------------------------------

class Role(models.Model):
    """
    Functional role a user can hold.
    
    Seeder-managed rows: volunteer, seeker, manager.
    admin tier → Django is_staff flag (no Role row needed).
    superuser → Django is_superuser flag (no Role row needed).
    """
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


# ---------------------------------------------------------------------------
# Custom manager
# ---------------------------------------------------------------------------

class UserManager(BaseUserManager):
    """Makes email the primary login identifier."""

    def _create_user(self, email: str, password: str, **extra_fields):
        if not email:
            raise ValueError("Email is required.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("is_active", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if not extra_fields["is_staff"]:
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields["is_superuser"]:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------

class User(AbstractUser):
    """
    Custom user model.
    
    Key decisions:
    - email is the login identifier (username removed).
    - is_active=False by default; flipped to True on email verification.
    - languages stored as comma-separated codes ("en,ur") for simplicity.
    - linkedin and gender are required at registration.
    - whatsapp_number is optional.
    - Soft delete via is_active=False (Manager level)
    - Hard delete (permanent) via Admin/Superuser only
    """
    
    username = None
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    # Core identity
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)

    # Required profile fields
    country = models.CharField(max_length=100)
    gender = models.CharField(max_length=10, choices=GenderChoices.choices)
    linkedin = models.URLField(max_length=255)

    # Optional profile fields
    whatsapp_number = models.CharField(max_length=20, blank=True, default="")
    languages = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Comma-separated language codes from LanguageChoices.",
    )

    # Roles
    roles = models.ManyToManyField(Role, blank=True, related_name="users")

    # Soft delete flag (Manager level deletion)
    is_active = models.BooleanField(default=False)  # Override to allow soft delete

    objects = UserManager()

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["email"]

    def __str__(self) -> str:
        return self.email

    @property
    def language_list(self) -> list[str]:
        if not self.languages:
            return []
        return [lang.strip() for lang in self.languages.split(",") if lang.strip()]

    def set_languages(self, language_codes: list[str]) -> None:
        """Set languages from a list of codes."""
        self.languages = ",".join(language_codes) if language_codes else ""

    def has_role(self, role_name: str) -> bool:
        return self.roles.filter(name=role_name).exists()

    @property
    def is_manager(self) -> bool:
        return self.has_role("manager")

    @property
    def is_volunteer(self) -> bool:
        return self.has_role("volunteer")

    @property
    def is_seeker(self) -> bool:
        return self.has_role("seeker")

    def can_delete_user(self, target_user: 'User') -> bool:
        """Check if current user can delete target user."""
        # Superuser can delete anyone
        if self.is_superuser:
            return True
        
        # Admin (is_staff) can delete anyone except superuser
        if self.is_staff:
            return not target_user.is_superuser
        
        # Manager can delete volunteers, seekers, or users with both roles
        if self.is_manager:
            # Cannot delete other managers, admins, or superusers
            if target_user.is_manager or target_user.is_staff or target_user.is_superuser:
                return False
            # Can delete volunteers, seekers, or both
            return target_user.is_volunteer or target_user.is_seeker
        
        # Regular users can only delete themselves
        return self.pk == target_user.pk
    
    def can_update_user(self, target_user: 'User') -> bool:
        """Check if current user can update target user."""
        # Everyone can update their own profile
        if self.pk == target_user.pk:
            return True
        
        # Admin can update anyone
        if self.is_staff:
            return True
        
        # Manager can only update their own profile (no updating others)
        if self.is_manager:
            return self.pk == target_user.pk
        
        return False


# ---------------------------------------------------------------------------
# Email verification token
# ---------------------------------------------------------------------------

class EmailVerificationToken(models.Model):
    """
    Single-use token that verifies a user's email address.
    
    Design decisions:
    - UUID4 token: cryptographically random, unguessable.
    - One active token per user: old tokens are deleted before a new one is created.
    - expires_at is set to now + 24 hours at creation time.
    - is_used flag prevents replay attacks even if the token hasn't expired.
    """
    
    TOKEN_LIFETIME_HOURS = 24

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="verification_tokens",
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Email Verification Token"
        verbose_name_plural = "Email Verification Tokens"

    def __str__(self) -> str:
        return f"Token for {self.user.email} (used={self.is_used})"

    def is_valid(self) -> bool:
        """True if the token has not been used and has not expired."""
        return not self.is_used and timezone.now() < self.expires_at

    @classmethod
    def lifetime(cls):
        return timedelta(hours=cls.TOKEN_LIFETIME_HOURS)