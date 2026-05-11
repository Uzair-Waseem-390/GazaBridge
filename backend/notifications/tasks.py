"""
Tasks
=====
Celery tasks for notifications.
"""

import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from notifications.models import Notification

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    name="notifications.tasks.send_notification_email",
)
def send_notification_email(self, notification_id: int) -> None:
    """Send email notification to the receiver."""
    try:
        notification = (
            Notification.objects
            .select_related("receiver")
            .get(pk=notification_id)
        )
    except Notification.DoesNotExist:
        logger.warning("Notification %s not found. Skipping email.", notification_id)
        return
    
    context = {
        "first_name": notification.receiver.first_name,
        "content": notification.content,
        "notification_type": notification.get_type_display(),
        "created_at": notification.created_at.strftime("%B %d, %Y at %I:%M %p"),
        "support_email": settings.EMAIL_HOST_USER,
    }
    
    html_body = render_to_string("notifications/notification_email.html", context)
    plain_body = strip_tags(html_body)
    
    subject = f"You have a new {notification.get_type_display()} notification"
    
    msg = EmailMultiAlternatives(
        subject=subject,
        body=plain_body,
        from_email=settings.EMAIL_HOST_USER,
        to=[notification.receiver.email],
    )
    msg.attach_alternative(html_body, "text/html")
    
    try:
        msg.send(fail_silently=False)
        logger.info("Notification email sent to %s", notification.receiver.email)
    except Exception as exc:
        logger.exception("Failed to send notification email to %s.", notification.receiver.email)
        raise self.retry(exc=exc)