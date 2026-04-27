"""
Tasks
=====
Celery tasks for the users app.
"""

import logging

from celery import shared_task
from django.conf import settings
from django.core.cache import cache
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

_CACHE_KEY = "email_verify:{user_id}"
_CACHE_TTL = 300


def build_cache_key(user_id: int) -> str:
    return _CACHE_KEY.format(user_id=user_id)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    name="users.tasks.send_verification_email",
)
def send_verification_email(self, user_id: int) -> None:
    """Send verification email to user."""
    cache_key = build_cache_key(user_id)
    payload = cache.get(cache_key)
    
    if payload is None:
        logger.warning("Cache miss for user_id=%s. Fetching from DB.", user_id)
        from .selectors.user_selectors import get_user_by_id
        from .services.user_services import create_verification_token
        
        user = get_user_by_id(user_id)
        if user is None:
            logger.error("User %s not found. Aborting email task.", user_id)
            return
        
        token = create_verification_token(user)
        payload = {
            "email": user.email,
            "first_name": user.first_name,
            "token": str(token.token),
        }
    
    verification_url = (
        f"{settings.BACKEND_BASE_URL.rstrip('/')}"
        f"/users/verify-email/{payload['token']}/"
    )
    
    context = {
        "first_name": payload["first_name"],
        "verification_url": verification_url,
        "expiry_hours": 24,
        "support_email": settings.EMAIL_HOST_USER,
    }
    
    html_body = render_to_string("users/verification_email.html", context)
    plain_body = strip_tags(html_body)
    
    msg = EmailMultiAlternatives(
        subject="Verify your email address",
        body=plain_body,
        from_email=settings.EMAIL_HOST_USER,
        to=[payload["email"]],
    )
    msg.attach_alternative(html_body, "text/html")
    
    try:
        msg.send(fail_silently=False)
        logger.info("Verification email sent to %s", payload["email"])
    except Exception as exc:
        logger.exception("Failed to send verification email to %s.", payload["email"])
        raise self.retry(exc=exc)
    finally:
        cache.delete(cache_key)