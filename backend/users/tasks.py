"""
Tasks
=====
Celery tasks for the users app.
All email delivery is async — registration returns immediately and
the email is dispatched in the background via Redis broker (DB 0).
"""

import logging

from celery import shared_task
from django.conf import settings
from django.core.cache import cache
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

# Redis DB-1 cache key used to ferry user+token data from the
# registration request to this background task.
_CACHE_KEY = "email_verify:{user_id}"
_CACHE_TTL  = 300  # 5 minutes — enough time for Celery to pick up the task


def build_cache_key(user_id: int) -> str:
    return _CACHE_KEY.format(user_id=user_id)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,  # retry after 60 s on transient failures
    name="users.tasks.send_verification_email",
)
def send_verification_email(self, user_id: int) -> None:
    """
    Read the user + token payload from Redis (DB-1 cache) and send the
    HTML verification email.

    Flow:
      1. Pull payload from Redis — written by register_user() service.
      2. Build the verification URL.
      3. Render the HTML email template.
      4. Send via Django's email backend (Gmail SMTP).
      5. Delete the cache key — it's no longer needed.

    Retries up to 3 times on any exception (SMTP timeouts, etc.).
    """
    cache_key = build_cache_key(user_id)
    payload   = cache.get(cache_key)

    if payload is None:
        # Cache expired or key was never written.
        # Fall back to DB to avoid silently dropping the email.
        logger.warning(
            "Cache miss for user_id=%s in send_verification_email. "
            "Fetching from DB.",
            user_id,
        )
        from .selectors import get_user_by_id
        from .services  import create_verification_token

        user  = get_user_by_id(user_id)
        if user is None:
            logger.error("User %s not found. Aborting email task.", user_id)
            return

        token = create_verification_token(user)
        payload = {
            "email":      user.email,
            "first_name": user.first_name,
            "token":      str(token.token),
        }

    verification_url = (
        f"{settings.BACKEND_BASE_URL.rstrip('/')}"
        f"/users/verify-email/{payload['token']}/"
    )

    context = {
        "first_name":        payload["first_name"],
        "verification_url":  verification_url,
        "expiry_hours":      24,
        "support_email":     settings.EMAIL_HOST_USER,
    }

    html_body  = render_to_string("users/verification_email.html", context)
    plain_body = strip_tags(html_body)

    msg = EmailMultiAlternatives(
        subject  = "Verify your email address",
        body     = plain_body,
        from_email = settings.EMAIL_HOST_USER,
        to       = [payload["email"]],
    )
    msg.attach_alternative(html_body, "text/html")

    try:
        msg.send(fail_silently=False)
        logger.info("Verification email sent to %s", payload["email"])
    except Exception as exc:
        logger.exception(
            "Failed to send verification email to %s. Retrying.",
            payload["email"],
        )
        raise self.retry(exc=exc)
    finally:
        # Always clean up the cache key whether send succeeded or failed.
        cache.delete(cache_key)