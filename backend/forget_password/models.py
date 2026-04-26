import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class PasswordResetToken(models.Model):
    """
    Single-use token for password reset.

    Design mirrors EmailVerificationToken for consistency:
    - UUID4: cryptographically random, unguessable.
    - 15-minute TTL enforced via expires_at.
    - is_used flag prevents replay even within the window.
    - Old unused tokens are deleted before a new one is created
      (enforced in the service layer).
    """

    TOKEN_LIFETIME_MINUTES = 15

    user       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="password_reset_tokens",
    )
    token      = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used    = models.BooleanField(default=False)

    class Meta:
        verbose_name        = "Password Reset Token"
        verbose_name_plural = "Password Reset Tokens"

    def __str__(self) -> str:
        return f"PasswordReset({self.user.email}, used={self.is_used})"

    def is_valid(self) -> bool:
        """True only when the token is unused and not yet expired."""
        return not self.is_used and timezone.now() < self.expires_at

    @classmethod
    def lifetime(cls):
        from datetime import timedelta
        return timedelta(minutes=cls.TOKEN_LIFETIME_MINUTES)