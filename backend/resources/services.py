"""
Services
========
"""

import logging
from typing import Dict, Any

from django.db import transaction

from resources.models import Resource
from resources.selectors import (
    get_resource_by_id,
    invalidate_resource_cache, invalidate_list_cache
)

logger = logging.getLogger(__name__)


def create_resource(
    *,
    user: Any,
    title: str,
    category: str,
    description: str,
    link: str
) -> Resource:
    with transaction.atomic():
        resource = Resource.objects.create(
            user=user,
            title=title,
            category=category,
            description=description,
            link=link
        )

    invalidate_list_cache()
    return resource


def update_resource(
    *,
    resource_id: int,
    update_data: Dict[str, Any]
) -> Resource:
    resource = get_resource_by_id(resource_id)

    if not resource:
        raise ValueError("Resource not found.")

    with transaction.atomic():
        for field, value in update_data.items():
            if hasattr(resource, field) and value is not None:
                setattr(resource, field, value)
        resource.save()

    invalidate_resource_cache(resource_id)
    return resource


def delete_resource(*, resource_id: int) -> None:
    resource = get_resource_by_id(resource_id)

    if not resource:
        raise ValueError("Resource not found.")

    resource.delete()
    invalidate_resource_cache(resource_id)