import uuid

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


# ---------------------------------------------------------------------------
# Choices
# ---------------------------------------------------------------------------

class LanguageChoices(models.TextChoices):
    ENGLISH    = "en", "English"
    URDU       = "ur", "Urdu"
    ARABIC     = "ar", "Arabic"
    FRENCH     = "fr", "French"
    SPANISH    = "es", "Spanish"
    GERMAN     = "de", "German"
    CHINESE    = "zh", "Chinese"
    HINDI      = "hi", "Hindi"
    PORTUGUESE = "pt", "Portuguese"
    RUSSIAN    = "ru", "Russian"
    JAPANESE   = "ja", "Japanese"
    TURKISH    = "tr", "Turkish"


class GenderChoices(models.TextChoices):
    MALE   = "male",   "Male"
    FEMALE = "female", "Female"


# ---------------------------------------------------------------------------
# Role
# ---------------------------------------------------------------------------

class Role(models.Model):
    """
    Functional role a user can hold.

    Seeder-managed rows: volunteer, seeker, manager.
    admin tier → Django is_staff flag (no Role row needed).
    superuser  → Django is_superuser flag (no Role row needed).
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
        user  = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        # All self-registered users start inactive until email is verified.
        extra_fields.setdefault("is_active", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str, **extra_fields):
        # Superusers are created via shell — they don't go through email verification.
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
    - languages stored as comma-separated codes ("en,ur") for simplicity;
      exposed as a structured list via the language_list property.
    - linkedin and gender are required at registration.
    - whatsapp_number is optional.
    """

    username        = None
    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    # ── Core identity ────────────────────────────────────────────────────────
    email      = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name  = models.CharField(max_length=150)

    # ── Required profile fields ───────────────────────────────────────────────
    country  = models.CharField(max_length=100)
    gender   = models.CharField(max_length=10, choices=GenderChoices.choices, default="male")
    linkedin = models.URLField(max_length=255, blank=True, default="")

    # ── Optional profile fields ───────────────────────────────────────────────
    whatsapp_number = models.CharField(max_length=20, blank=True, default="")
    # Stored as "en,ur,fr"; surfaced as a list through language_list property.
    languages = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Comma-separated language codes from LanguageChoices.",
    )

    # ── Roles ────────────────────────────────────────────────────────────────
    roles = models.ManyToManyField(Role, blank=True, related_name="users")

    objects = UserManager()

    class Meta:
        verbose_name        = "User"
        verbose_name_plural = "Users"
        ordering            = ["email"]

    def __str__(self) -> str:
        return self.email

    # ── Helpers ──────────────────────────────────────────────────────────────

    @property
    def language_list(self) -> list[str]:
        if not self.languages:
            return []
        return [lang.strip() for lang in self.languages.split(",") if lang.strip()]

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


# ---------------------------------------------------------------------------
# Email verification token
# ---------------------------------------------------------------------------

class EmailVerificationToken(models.Model):
    """
    Single-use token that verifies a user's email address.

    Design decisions:
    - UUID4 token: cryptographically random, unguessable.
    - One active token per user: old tokens are deleted before a new one
      is created (enforced in the service layer).
    - expires_at is set to now + 24 hours at creation time.
    - is_used flag prevents replay attacks even if the token hasn't expired.
    """

    TOKEN_LIFETIME_HOURS = 24

    user       = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="verification_tokens",
    )
    token      = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used    = models.BooleanField(default=False)

    class Meta:
        verbose_name        = "Email Verification Token"
        verbose_name_plural = "Email Verification Tokens"

    def __str__(self) -> str:
        return f"Token for {self.user.email} (used={self.is_used})"

    def is_valid(self) -> bool:
        """True if the token has not been used and has not expired."""
        return not self.is_used and timezone.now() < self.expires_at

    @classmethod
    def lifetime(cls):
        from datetime import timedelta
        return timedelta(hours=cls.TOKEN_LIFETIME_HOURS)