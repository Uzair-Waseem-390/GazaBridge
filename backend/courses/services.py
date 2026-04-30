"""
Services
========
Write layer and business-logic enforcement.
No HTTP awareness — views call services, never the ORM directly.
"""

import logging
from typing import Dict, Any

from django.db import transaction

from courses.models import Course, Content, CourseOfferLink
from courses.selectors import (
    get_course_by_id, get_content_by_id,
    get_link_by_course_and_offer,
    invalidate_course_cache, invalidate_content_cache,
    invalidate_courses_list_cache          # === ADD THIS IMPORT ===
)

# Cross-app invalidation
from posts.selectors import invalidate_offers_list_cache


logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Course Services
# ---------------------------------------------------------------------------

def create_course(
    *,
    user: Any,
    title: str,
    category: str,
    description: str,
    skill_level: str,
    language: str,
    sessions_per_week: int,
    session_duration: int,
    course_duration_days: int,
    status: str = "active"
) -> Course:
    """Create a new course."""
    with transaction.atomic():
        course = Course.objects.create(
            user=user,
            title=title,
            category=category,
            description=description,
            skill_level=skill_level,
            language=language,
            sessions_per_week=sessions_per_week,
            session_duration=session_duration,
            course_duration_days=course_duration_days,
            status=status
        )
    
    invalidate_courses_list_cache()
    
    return course


def update_course(
    *,
    course_id: int,
    requesting_user: Any,
    update_data: Dict[str, Any]
) -> Course:
    """Update an existing course."""
    course = get_course_by_id(course_id)
    
    if not course:
        raise ValueError("Course not found.")
    
    if not _can_update_course(requesting_user, course):
        raise PermissionError("You don't have permission to update this course.")
    
    with transaction.atomic():
        for field, value in update_data.items():
            if hasattr(course, field) and value is not None:
                setattr(course, field, value)
        
        course.save()
    
    invalidate_course_cache(course_id)
    
    return course


def delete_course(
    *,
    course_id: int,
    requesting_user: Any
) -> None:
    """
    Delete a course.
    Cascades: deletes all contents and unlinks from all offers.
    Also invalidates posts list caches since linked offers may be affected.
    """
    course = get_course_by_id(course_id)
    
    if not course:
        raise ValueError("Course not found.")
    
    if not _can_delete_course(requesting_user, course):
        raise PermissionError("You don't have permission to delete this course.")
    
    course.delete()  # CASCADE handles contents and links
    
    # Invalidate both courses and posts caches
    # invalidate_course_cache(course_id)
    # invalidate_offers_list_cache()
    invalidate_course_cache(course_id)
    invalidate_offers_list_cache()


# ---------------------------------------------------------------------------
# Content Services
# ---------------------------------------------------------------------------

def create_content(
    *,
    course_id: int,
    user: Any,
    content_title: str,
    link: str,
    description: str = ""
) -> Content:
    """Create content for a course."""
    course = get_course_by_id(course_id)
    
    if not course:
        raise ValueError("Course not found.")
    
    if not _can_create_content(user, course):
        raise PermissionError("You don't have permission to create content for this course.")
    
    with transaction.atomic():
        content = Content.objects.create(
            course=course,
            user=user,
            content_title=content_title,
            link=link,
            description=description
        )
    
    # Invalidate course cache since contents changed
    invalidate_course_cache(course_id)
    
    return content


def update_content(
    *,
    content_id: int,
    requesting_user: Any,
    update_data: Dict[str, Any]
) -> Content:
    """Update an existing content."""
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
    invalidate_course_cache(content.course_id)
    
    return content


def delete_content(
    *,
    content_id: int,
    requesting_user: Any
) -> None:
    """Delete a content item."""
    content = get_content_by_id(content_id)
    
    if not content:
        raise ValueError("Content not found.")
    
    if not _can_manage_content(requesting_user, content):
        raise PermissionError("You don't have permission to delete this content.")
    
    course_id = content.course_id
    content.delete()
    
    invalidate_content_cache(content_id)
    invalidate_course_cache(course_id)


# ---------------------------------------------------------------------------
# Link Services
# ---------------------------------------------------------------------------

def link_course_to_offer(
    *,
    course_id: int,
    offer_id: int,
    requesting_user: Any
) -> CourseOfferLink:
    """Link a course to an offer."""
    course = get_course_by_id(course_id)
    if not course:
        raise ValueError("Course not found.")
    
    from posts.selectors import get_offer_by_id
    offer = get_offer_by_id(offer_id)
    if not offer:
        raise ValueError("Offer not found.")
    
    # Check if already linked
    existing = get_link_by_course_and_offer(course_id, offer_id)
    if existing:
        raise ValueError("Course is already linked to this offer.")
    
    # Permission check
    if not _can_link(requesting_user, course, offer):
        raise PermissionError("You don't have permission to link this course to this offer.")
    
    with transaction.atomic():
        link = CourseOfferLink.objects.create(
            course=course,
            offer=offer,
            linked_by=requesting_user
        )
    
    invalidate_course_cache(course_id)
    invalidate_offers_list_cache()

    # Invalidate linked courses cache
    from django.core.cache import cache
    cache.delete(f"posts:linked_courses:{offer_id}")
    
    return link


def unlink_course_from_offer(
    *,
    course_id: int,
    offer_id: int,
    requesting_user: Any
) -> None:
    """Unlink a course from an offer."""
    course = get_course_by_id(course_id)
    if not course:
        raise ValueError("Course not found.")
    
    from posts.selectors import get_offer_by_id
    offer = get_offer_by_id(offer_id)
    if not offer:
        raise ValueError("Offer not found.")
    
    link = get_link_by_course_and_offer(course_id, offer_id)
    if not link:
        raise ValueError("Course is not linked to this offer.")
    
    if not _can_unlink(requesting_user, course, offer):
        raise PermissionError("You don't have permission to unlink this course from this offer.")
    
    link.delete()
    invalidate_course_cache(course_id)
    invalidate_offers_list_cache()


    # Invalidate linked courses cache
    from django.core.cache import cache
    cache.delete(f"posts:linked_courses:{offer_id}")
# ---------------------------------------------------------------------------
# Permission Helpers
# ---------------------------------------------------------------------------

def _can_update_course(user: Any, course: Course) -> bool:
    if course.user_id == user.pk:
        return True
    if user.is_staff or user.is_superuser:
        return True
    return False


def _can_delete_course(user: Any, course: Course) -> bool:
    if course.user_id == user.pk:
        return True
    if user.is_staff or user.is_superuser:
        return True
    if user.is_manager:
        return True
    return False


def _can_create_content(user: Any, course: Course) -> bool:
    if course.user_id == user.pk:
        return True
    if user.is_staff or user.is_superuser:
        return True
    return False


def _can_manage_content(user: Any, content: Content) -> bool:
    if content.user_id == user.pk:
        return True
    if user.is_staff or user.is_superuser:
        return True
    return False


def _can_link(user: Any, course: Course, offer) -> bool:
    if user.is_staff or user.is_superuser:
        return True
    # Normal user: must own BOTH the course and the offer
    return course.user_id == user.pk and offer.user_id == user.pk


def _can_unlink(user: Any, course: Course, offer) -> bool:
    return _can_link(user, course, offer)