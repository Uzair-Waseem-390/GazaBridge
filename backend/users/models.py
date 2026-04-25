from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


# ---------------------------------------------------------------------------
# Choices
# ---------------------------------------------------------------------------

class LanguageChoices(models.TextChoices):
    ENGLISH    = "en",  "English"
    URDU       = "ur",  "Urdu"
    ARABIC     = "ar",  "Arabic"
    FRENCH     = "fr",  "French"
    SPANISH    = "es",  "Spanish"
    GERMAN     = "de",  "German"
    CHINESE    = "zh",  "Chinese"
    HINDI      = "hi",  "Hindi"
    PORTUGUESE = "pt",  "Portuguese"
    RUSSIAN    = "ru",  "Russian"
    JAPANESE   = "ja",  "Japanese"
    TURKISH    = "tr",  "Turkish"


# ---------------------------------------------------------------------------
# Role
# ---------------------------------------------------------------------------

class Role(models.Model):
    """
    Represents a functional role a user can hold.

    Seeder-managed roles: volunteer, seeker, manager.
    The 'admin' privilege is handled via Django's is_staff / is_superuser
    flags so it never needs to appear in this table.
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
    """Drop-in manager that makes email the primary identifier."""

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
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

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

    - Email is the login identifier (replaces username).
    - Roles are managed through the Role M2M.
    - 'manager' role can only be assigned by admin / superuser (enforced in
      the service layer, not here — keep models free of business logic).
    - languages is a comma-separated store of LanguageChoices codes, exposed
      as a clean list through the property below.
    """

    # AbstractUser ships with username; we disable it entirely.
    username      = None
    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    # ── Core identity ────────────────────────────────────────────────────────
    email      = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name  = models.CharField(max_length=150)

    # ── Location ─────────────────────────────────────────────────────────────
    country    = models.CharField(max_length=100)

    # ── Optional ─────────────────────────────────────────────────────────────
    # Stored as comma-separated codes, e.g. "en,ur,fr"
    languages  = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Comma-separated language codes from LanguageChoices.",
    )

    # ── Roles ────────────────────────────────────────────────────────────────
    roles = models.ManyToManyField(Role, blank=True, related_name="users")

    objects = UserManager()

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["email"]

    def __str__(self) -> str:
        return self.email

    # ── Helpers ──────────────────────────────────────────────────────────────

    @property
    def language_list(self) -> list[str]:
        """Return languages as a Python list of codes."""
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