from django.conf import settings
from django.db import models


class UserActivity(models.Model):
    """
    Tracks the last login timestamp for a user.

    Privacy controls:
    - is_visible: user can hide their last login from others (default: visible).
    Only the owner may read or update this record — enforced at the
    permission and service layers, not here. Models stay free of
    business logic.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="activity",
    )
    last_login_at = models.DateTimeField(null=True, blank=True)
    is_visible    = models.BooleanField(
        default=True,
        help_text="When False, last_login_at is hidden from other users.",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = "User Activity"
        verbose_name_plural = "User Activities"

    def __str__(self) -> str:
        return f"Activity({self.user.email})"