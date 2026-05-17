"""
Selectors
=========
Pure read layer — no writes, no side effects.

Caching policy:
- Single LiveSection/Content objects: NOT cached (mutable, causes stale-data bugs).
- Paginated list results: NOT cached (invalidation is unreliable across cache backends).
- Static lookups (links): NOT cached.

All reads go directly to the DB. Django's connection pooling and indexed PKs
make single-row lookups fast enough without an application-level cache.
"""

from typing import Optional, Any

from django.db.models import QuerySet, Q
from django.utils import timezone

from live_sections.models import LiveSection, LiveSectionContent, LiveSectionOfferLink


# ---------------------------------------------------------------------------
# Cache key helper — kept for call-site compatibility in services
# ---------------------------------------------------------------------------

def get_cache_key(prefix: str, identifier: str) -> str:
    return f"live_sections:{prefix}:{identifier}"


def invalidate_live_section_cache(ls_id: int) -> None:
    """No-op — live section objects are no longer cached."""
    pass


def invalidate_ls_list_cache() -> None:
    """No-op — list results are no longer cached."""
    pass

def invalidate_content_cache(content_id: int) -> None:
    """No-op — content objects are no longer cached."""
    pass


# ---------------------------------------------------------------------------
# LiveSection Selectors
# ---------------------------------------------------------------------------

def get_live_section_by_id(ls_id: int) -> Optional[LiveSection]:
    """Get a single live section by ID. Always reads from DB."""
    return (
        LiveSection.objects
        .select_related("user")
        .prefetch_related("contents")
        .filter(pk=ls_id)
        .first()
    )


def get_live_sections_queryset(
    category: Optional[str] = None,
    skill_level: Optional[str] = None,
    language: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    search: Optional[str] = None,
    ordering: str = "-created_at"
) -> QuerySet:
    """Get live sections queryset with optional filters."""
    queryset = LiveSection.objects.select_related("user").prefetch_related("contents").all()

    if category:
        queryset = queryset.filter(category=category)
    if skill_level:
        queryset = queryset.filter(skill_level=skill_level)
    if language:
        queryset = queryset.filter(language=language)
    if status:
        queryset = queryset.filter(status=status)
    if user_id:
        queryset = queryset.filter(user_id=user_id)
    if search:
        queryset = queryset.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search)
        )

    return queryset.order_by(ordering)


def get_cached_live_section_list(
    category=None, skill_level=None, language=None, status=None,
    user_id=None, search=None, ordering="-created_at", page=1, page_size=20
):
    """Always returns None — caching removed. View will always query the DB."""
    return None


def set_cached_live_section_list(live_sections, **kwargs) -> None:
    """No-op — list caching removed."""
    pass


# ---------------------------------------------------------------------------
# Content Selectors
# ---------------------------------------------------------------------------

def get_content_by_id(content_id: int) -> Optional[LiveSectionContent]:
    """Get a single content by ID. Always reads from DB."""
    return (
        LiveSectionContent.objects
        .select_related("user", "live_section")
        .filter(pk=content_id)
        .first()
    )


def get_visible_contents_for_live_section(live_section: LiveSection, requesting_user: Any) -> QuerySet:
    """
    Get contents based on visibility rules:
    - Active: all authenticated users can see contents.
    - Inactive/Closed/Ended: only owner, manager, admin, superuser.
    """
    contents = live_section.contents.all()
    effective_status = live_section.get_effective_status()

    if effective_status == "active":
        return contents

    if requesting_user.is_staff or requesting_user.is_superuser:
        return contents
    if requesting_user.is_manager:
        return contents
    if live_section.user_id == requesting_user.pk:
        return contents

    return LiveSectionContent.objects.none()


# ---------------------------------------------------------------------------
# Link Selectors
# ---------------------------------------------------------------------------

def get_link_by_ls_and_offer(ls_id: int, offer_id: int) -> Optional[LiveSectionOfferLink]:
    """Get a link between a live section and an offer."""
    return (
        LiveSectionOfferLink.objects
        .select_related("live_section", "offer", "linked_by")
        .filter(live_section_id=ls_id, offer_id=offer_id)
        .first()
    )
