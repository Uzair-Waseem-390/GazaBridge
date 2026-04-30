"""
Services
========
Write layer and business-logic enforcement.
"""

import logging
from typing import Dict, Any

from django.db import transaction
from django.utils import timezone

from live_sections.models import LiveSection, LiveSectionContent, LiveSectionOfferLink
from live_sections.selectors import (
    get_live_section_by_id, get_content_by_id,
    get_link_by_ls_and_offer,
    invalidate_live_section_cache, invalidate_content_cache,
    invalidate_ls_list_cache
)
from posts.selectors import invalidate_offers_list_cache

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# LiveSection Services
# ---------------------------------------------------------------------------

def create_live_section(
    *,
    user: Any,
    title: str,
    category: str,
    description: str,
    skill_level: str,
    language: str,
    sessions_per_week: int,
    session_duration: int,
    duration_days: int,
    ending_date,
    status: str = "active"
) -> LiveSection:
    """Create a new live section."""
    with transaction.atomic():
        ls = LiveSection.objects.create(
            user=user,
            title=title,
            category=category,
            description=description,
            skill_level=skill_level,
            language=language,
            sessions_per_week=sessions_per_week,
            session_duration=session_duration,
            duration_days=duration_days,
            ending_date=ending_date,
            status=status
        )
    
    invalidate_ls_list_cache()
    return ls


def update_live_section(
    *,
    ls_id: int,
    requesting_user: Any,
    update_data: Dict[str, Any]
) -> LiveSection:
    """Update an existing live section."""
    ls = get_live_section_by_id(ls_id)
    
    if not ls:
        raise ValueError("Live section not found.")
    
    if not _can_update(requesting_user, ls):
        raise PermissionError("You don't have permission to update this live section.")
    
    with transaction.atomic():
        for field, value in update_data.items():
            if hasattr(ls, field) and value is not None:
                setattr(ls, field, value)
        ls.save()
    
    invalidate_live_section_cache(ls_id)
    return ls


def delete_live_section(
    *,
    ls_id: int,
    requesting_user: Any
) -> None:
    """Delete a live section. Cascades contents and links."""
    ls = get_live_section_by_id(ls_id)
    
    if not ls:
        raise ValueError("Live section not found.")
    
    if not _can_delete(requesting_user, ls):
        raise PermissionError("You don't have permission to delete this live section.")
    
    ls.delete()
    
    invalidate_live_section_cache(ls_id)
    invalidate_offers_list_cache()


# ---------------------------------------------------------------------------
# Content Services
# ---------------------------------------------------------------------------

def create_content(
    *,
    ls_id: int,
    user: Any,
    content_title: str,
    link: str,
    description: str = ""
) -> LiveSectionContent:
    """Create content for a live section."""
    ls = get_live_section_by_id(ls_id)
    
    if not ls:
        raise ValueError("Live section not found.")
    
    if not _can_create_content(user, ls):
        raise PermissionError("You don't have permission to create content for this live section.")
    
    with transaction.atomic():
        content = LiveSectionContent.objects.create(
            live_section=ls,
            user=user,
            content_title=content_title,
            link=link,
            description=description
        )
    
    invalidate_live_section_cache(ls_id)
    return content


def update_content(
    *,
    content_id: int,
    requesting_user: Any,
    update_data: Dict[str, Any]
) -> LiveSectionContent:
    """Update existing content."""
    content = get_content_by_id(content_id)
    
    if not content:
        raise ValueError("Content not found.")
    
    if not _can_manage_content(requesting_user, content):
        raise PermissionError("You don't have permission to update this content.")
    
    with transaction.atomic():
        for field, value in update_data.items():
            if hasattr(content, field) and value is not None:
                setattr(content, field, value)
        content.save()
    
    invalidate_content_cache(content_id)
    invalidate_live_section_cache(content.live_section_id)
    return content


def delete_content(
    *,
    content_id: int,
    requesting_user: Any
) -> None:
    """Delete content."""
    content = get_content_by_id(content_id)
    
    if not content:
        raise ValueError("Content not found.")
    
    if not _can_manage_content(requesting_user, content):
        raise PermissionError("You don't have permission to delete this content.")
    
    ls_id = content.live_section_id
    content.delete()
    
    invalidate_content_cache(content_id)
    invalidate_live_section_cache(ls_id)


# ---------------------------------------------------------------------------
# Link Services
# ---------------------------------------------------------------------------

def link_ls_to_offer(
    *,
    ls_id: int,
    offer_id: int,
    requesting_user: Any
) -> LiveSectionOfferLink:
    """Link a live section to an offer."""
    ls = get_live_section_by_id(ls_id)
    if not ls:
        raise ValueError("Live section not found.")
    
    from posts.selectors import get_offer_by_id
    offer = get_offer_by_id(offer_id)
    if not offer:
        raise ValueError("Offer not found.")
    
    existing = get_link_by_ls_and_offer(ls_id, offer_id)
    if existing:
        raise ValueError("Live section is already linked to this offer.")
    
    if not _can_link(requesting_user, ls, offer):
        raise PermissionError("You don't have permission to link this.")
    
    with transaction.atomic():
        link = LiveSectionOfferLink.objects.create(
            live_section=ls,
            offer=offer,
            linked_by=requesting_user
        )
    
    invalidate_live_section_cache(ls_id)
    invalidate_offers_list_cache()

    # Invalidate linked live sections cache
    from django.core.cache import cache
    cache.delete(f"posts:linked_ls:{offer_id}")
    
    return link


def unlink_ls_from_offer(
    *,
    ls_id: int,
    offer_id: int,
    requesting_user: Any
) -> None:
    """Unlink a live section from an offer."""
    ls = get_live_section_by_id(ls_id)
    if not ls:
        raise ValueError("Live section not found.")
    
    from posts.selectors import get_offer_by_id
    offer = get_offer_by_id(offer_id)
    if not offer:
        raise ValueError("Offer not found.")
    
    link = get_link_by_ls_and_offer(ls_id, offer_id)
    if not link:
        raise ValueError("Live section is not linked to this offer.")
    
    if not _can_unlink(requesting_user, ls, offer):
        raise PermissionError("You don't have permission to unlink this.")
    
    link.delete()
    invalidate_live_section_cache(ls_id)
    invalidate_offers_list_cache()

    # Invalidate linked live sections cache
    from django.core.cache import cache
    cache.delete(f"posts:linked_ls:{offer_id}")

# ---------------------------------------------------------------------------
# Permission Helpers
# ---------------------------------------------------------------------------

def _can_update(user, ls):
    if ls.user_id == user.pk:
        return True
    if user.is_staff or user.is_superuser:
        return True
    return False


def _can_delete(user, ls):
    if ls.user_id == user.pk:
        return True
    if user.is_staff or user.is_superuser:
        return True
    if user.is_manager:
        return True
    return False


def _can_create_content(user, ls):
    if ls.user_id == user.pk:
        return True
    if user.is_staff or user.is_superuser:
        return True
    return False


def _can_manage_content(user, content):
    if content.user_id == user.pk:
        return True
    if user.is_staff or user.is_superuser:
        return True
    return False


def _can_link(user, ls, offer):
    if user.is_staff or user.is_superuser:
        return True
    return ls.user_id == user.pk and offer.user_id == user.pk


def _can_unlink(user, ls, offer):
    return _can_link(user, ls, offer)