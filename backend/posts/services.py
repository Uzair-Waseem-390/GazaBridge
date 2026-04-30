"""
Services
========
Write layer and business-logic enforcement.
No HTTP awareness — views call services, never the ORM directly.
"""

import logging
from typing import Optional, Dict, Any

from django.db import transaction

from posts.models import Offer, Request
from posts.selectors import (
    get_offer_by_id, get_request_by_id,
    invalidate_offer_cache, invalidate_request_cache,
    invalidate_offers_list_cache          # === ADD THIS IMPORT ===
)

# Cross-app invalidation
from courses.selectors import invalidate_courses_list_cache
from live_sections.selectors import invalidate_ls_list_cache

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Offer Services
# ---------------------------------------------------------------------------

def create_offer(
    *,
    user: Any,
    offer_name: str,
    category: str,
    description: str,
    availability: str,
    status: str = "active"
) -> Offer:
    """Create a new offer post."""
    with transaction.atomic():
        offer = Offer.objects.create(
            user=user,
            offer_name=offer_name,
            category=category,
            description=description,
            availability=availability,
            status=status
        )
    
    invalidate_offer_cache(offer.pk)
    
    return offer


def update_offer(
    *,
    offer_id: int,
    requesting_user: Any,
    update_data: Dict[str, Any]
) -> Offer:
    """Update an existing offer post."""
    offer = get_offer_by_id(offer_id)
    
    if not offer:
        raise ValueError("Offer not found.")
    
    if not _can_update_offer(requesting_user, offer):
        raise PermissionError("You don't have permission to update this offer.")
    
    with transaction.atomic():
        for field, value in update_data.items():
            if hasattr(offer, field) and value is not None:
                setattr(offer, field, value)
        
        offer.save()
    
    invalidate_offer_cache(offer_id)
    
    return offer

def delete_offer(
    *,
    offer_id: int,
    requesting_user: Any
) -> None:
    """Delete an offer post. Cascades to unlink any linked courses."""
    offer = get_offer_by_id(offer_id)
    
    if not offer:
        raise ValueError("Offer not found.")
    
    if not _can_delete_offer(requesting_user, offer):
        raise PermissionError("You don't have permission to delete this offer.")
    
    offer.delete()  # CASCADE on CourseOfferLink automatically removes links
    
    # Invalidate both posts and courses caches
    invalidate_offer_cache(offer_id)
    invalidate_courses_list_cache()
    invalidate_ls_list_cache()


# ---------------------------------------------------------------------------
# Request Services
# ---------------------------------------------------------------------------

def create_request(
    *,
    user: Any,
    request_name: str,
    category: str,
    description: str,
    status: str = "active"
) -> Request:
    """Create a new request post."""
    with transaction.atomic():
        request_obj = Request.objects.create(
            user=user,
            request_name=request_name,
            category=category,
            description=description,
            status=status
        )
    
    # Invalidate list caches since new request is added
    invalidate_request_cache(request_obj.pk)
    
    return request_obj


def update_request(
    *,
    request_id: int,
    requesting_user: Any,
    update_data: Dict[str, Any]
) -> Request:
    """Update an existing request post."""
    request_obj = get_request_by_id(request_id)
    
    if not request_obj:
        raise ValueError("Request not found.")
    
    # Permission check
    if not _can_update_request(requesting_user, request_obj):
        raise PermissionError("You don't have permission to update this request.")
    
    with transaction.atomic():
        for field, value in update_data.items():
            if hasattr(request_obj, field) and value is not None:
                setattr(request_obj, field, value)
        
        request_obj.save()
    
    # Invalidate caches
    invalidate_request_cache(request_id)
    
    return request_obj


def delete_request(
    *,
    request_id: int,
    requesting_user: Any
) -> None:
    """Delete a request post."""
    request_obj = get_request_by_id(request_id)
    
    if not request_obj:
        raise ValueError("Request not found.")
    
    # Permission check
    if not _can_delete_request(requesting_user, request_obj):
        raise PermissionError("You don't have permission to delete this request.")
    
    request_obj.delete()
    
    # Invalidate caches
    invalidate_request_cache(request_id)


# ---------------------------------------------------------------------------
# Permission Helpers
# ---------------------------------------------------------------------------

def _can_update_offer(user: Any, offer: Offer) -> bool:
    """Check if user can update an offer."""
    # Owner can update
    if offer.user_id == user.pk:
        return True
    
    # Admin and Superuser can update
    if user.is_staff or user.is_superuser:
        return True
    
    # Manager cannot update
    return False


def _can_delete_offer(user: Any, offer: Offer) -> bool:
    """Check if user can delete an offer."""
    # Owner can delete
    if offer.user_id == user.pk:
        return True
    
    # Admin and Superuser can delete
    if user.is_staff or user.is_superuser:
        return True
    
    # Manager can delete
    if user.is_manager:
        return True
    
    return False


def _can_update_request(user: Any, request_obj: Request) -> bool:
    """Check if user can update a request."""
    # Owner can update
    if request_obj.user_id == user.pk:
        return True
    
    # Admin and Superuser can update
    if user.is_staff or user.is_superuser:
        return True
    
    # Manager cannot update
    return False


def _can_delete_request(user: Any, request_obj: Request) -> bool:
    """Check if user can delete a request."""
    # Owner can delete
    if request_obj.user_id == user.pk:
        return True
    
    # Admin and Superuser can delete
    if user.is_staff or user.is_superuser:
        return True
    
    # Manager can delete
    if user.is_manager:
        return True
    
    return False