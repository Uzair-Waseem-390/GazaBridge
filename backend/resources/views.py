"""
Views
=====
"""

import logging

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from resources.serializers import (
    ResourceInputSerializer, ResourceUpdateSerializer,
    ResourceOutputSerializer, ResourceListQuerySerializer
)
from resources.services import create_resource, update_resource, delete_resource
from resources.selectors import (
    get_resource_by_id, get_resources_queryset,
    get_cached_resource_list, set_cached_resource_list
)
from resources.permissions import CanManageResource
from backend.pagination import StandardResultsSetPagination

logger = logging.getLogger(__name__)


class ResourceCreateView(generics.CreateAPIView):
    """POST /resources/create/ — Manager/Admin/Superuser only."""
    permission_classes = [IsAuthenticated, CanManageResource]
    serializer_class = ResourceInputSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            resource = create_resource(
                user=request.user,
                title=data["title"],
                category=data["category"],
                description=data["description"],
                link=data["link"]
            )
        except Exception:
            logger.exception("Resource creation failed.")
            return Response(
                {"detail": "Resource creation failed due to a server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            ResourceOutputSerializer(resource).data,
            status=status.HTTP_201_CREATED
        )


class ResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /resources/<id>/"""
    permission_classes = [IsAuthenticated, CanManageResource]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ResourceUpdateSerializer
        return ResourceOutputSerializer

    def get_object(self):
        return get_resource_by_id(self.kwargs.get('pk'))

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Resource not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(ResourceOutputSerializer(instance).data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Resource not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        partial = kwargs.pop('partial', False)
        serializer = ResourceUpdateSerializer(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        try:
            updated = update_resource(
                resource_id=instance.pk,
                update_data=serializer.validated_data
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(ResourceOutputSerializer(updated).data)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Resource not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            delete_resource(resource_id=instance.pk)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)


class ResourceListView(generics.ListAPIView):
    """GET /resources/ — Everyone authenticated."""
    permission_classes = [IsAuthenticated]
    serializer_class = ResourceOutputSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        query_serializer = ResourceListQuerySerializer(data=self.request.query_params)
        query_serializer.is_valid(raise_exception=True)
        params = query_serializer.validated_data

        page = int(self.request.query_params.get('page', 1))
        page_size = int(self.request.query_params.get('page_size', 20))

        cached = get_cached_resource_list(
            category=params.get('category'),
            search=params.get('search'),
            user_id=params.get('user_id'),
            ordering=params.get('ordering', '-created_at'),
            page=page,
            page_size=page_size
        )

        if cached is not None:
            return cached

        queryset = get_resources_queryset(
            category=params.get('category'),
            search=params.get('search'),
            user_id=params.get('user_id'),
            ordering=params.get('ordering', '-created_at')
        )

        result_list = list(queryset)
        set_cached_resource_list(
            result_list,
            category=params.get('category'),
            search=params.get('search'),
            user_id=params.get('user_id'),
            ordering=params.get('ordering', '-created_at'),
            page=page,
            page_size=page_size
        )

        return result_list