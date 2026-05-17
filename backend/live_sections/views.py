"""
Views
=====
Thin HTTP layer with proper permissions.
"""

import logging

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from live_sections.serializers import (
    LiveSectionInputSerializer, LiveSectionUpdateSerializer,
    LiveSectionOutputSerializer, LiveSectionDetailOutputSerializer,
    LiveSectionContentInputSerializer, LiveSectionContentUpdateSerializer,
    LiveSectionContentOutputSerializer, LiveSectionListQuerySerializer
)
from live_sections.services import (
    create_live_section, update_live_section, delete_live_section,
    create_content, update_content, delete_content,
    link_ls_to_offer, unlink_ls_from_offer
)
from live_sections.selectors import (
    get_live_section_by_id, get_live_sections_queryset,
    get_content_by_id, get_visible_contents_for_live_section,
)
from live_sections.permissions import (
    CanManageLiveSection, CanManageLiveSectionContent,
    CanCreateLiveSection, CanCreateLiveSectionContent,
    CanLinkLiveSectionToOffer
)
from backend.pagination import StandardResultsSetPagination

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# LiveSection Views
# ---------------------------------------------------------------------------

class LiveSectionCreateView(generics.CreateAPIView):
    """POST /live-sections/create/"""
    
    permission_classes = [IsAuthenticated, CanCreateLiveSection]
    serializer_class = LiveSectionInputSerializer
    
    def create(self, request, *args, **kwargs):
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data
        
        try:
            ls = create_live_section(
                user=request.user,
                title=data["title"],
                category=data["category"],
                description=data["description"],
                skill_level=data["skill_level"],
                language=data["language"],
                sessions_per_week=data["sessions_per_week"],
                session_duration=data["session_duration"],
                duration_days=data["duration_days"],
                ending_date=data["ending_date"],
                status=data.get("status", "active")
            )
        except Exception:
            logger.exception("Unexpected error during live section creation.")
            return Response(
                {"detail": "Live section creation failed due to a server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
        output = self._serialize_detail(ls, request)
        return Response(output, status=status.HTTP_201_CREATED)
    
    def _serialize_detail(self, ls, request):
        data = LiveSectionDetailOutputSerializer(ls).data
        visible = get_visible_contents_for_live_section(ls, request.user)
        data['contents'] = LiveSectionContentOutputSerializer(visible, many=True).data
        return data


class LiveSectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /live-sections/<id>/"""
    
    permission_classes = [IsAuthenticated, CanManageLiveSection]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return LiveSectionUpdateSerializer
        return LiveSectionDetailOutputSerializer
    
    def get_object(self):
        return get_live_section_by_id(self.kwargs.get('pk'))
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response({"detail": "Live section not found."}, status=status.HTTP_404_NOT_FOUND)
        
        data = LiveSectionDetailOutputSerializer(instance).data
        visible = get_visible_contents_for_live_section(instance, request.user)
        data['contents'] = LiveSectionContentOutputSerializer(visible, many=True).data
        return Response(data)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response({"detail": "Live section not found."}, status=status.HTTP_404_NOT_FOUND)
        
        self.check_object_permissions(request, instance)
        
        partial = kwargs.pop('partial', False)
        serializer = LiveSectionUpdateSerializer(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        try:
            updated = update_live_section(
                ls_id=instance.pk,
                requesting_user=request.user,
                update_data=serializer.validated_data
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        
        data = LiveSectionDetailOutputSerializer(updated).data
        visible = get_visible_contents_for_live_section(updated, request.user)
        data['contents'] = LiveSectionContentOutputSerializer(visible, many=True).data
        return Response(data)
    
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response({"detail": "Live section not found."}, status=status.HTTP_404_NOT_FOUND)
        
        self.check_object_permissions(request, instance)
        
        try:
            delete_live_section(ls_id=instance.pk, requesting_user=request.user)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        
        return Response(status=status.HTTP_204_NO_CONTENT)


class LiveSectionListView(generics.ListAPIView):
    """GET /live-sections/"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = LiveSectionOutputSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        query_serializer = LiveSectionListQuerySerializer(data=self.request.query_params)
        query_serializer.is_valid(raise_exception=True)
        params = query_serializer.validated_data

        return get_live_sections_queryset(
            category=params.get('category'),
            skill_level=params.get('skill_level'),
            language=params.get('language'),
            status=params.get('status'),
            user_id=params.get('user_id'),
            search=params.get('search'),
            ordering=params.get('ordering', '-created_at')
        )


# ---------------------------------------------------------------------------
# Content Views
# ---------------------------------------------------------------------------

class ContentCreateView(generics.CreateAPIView):
    """POST /live-sections/<ls_id>/contents/create/"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = LiveSectionContentInputSerializer
    
    def create(self, request, ls_id, *args, **kwargs):
        ls = get_live_section_by_id(ls_id)
        if not ls:
            return Response({"detail": "Live section not found."}, status=status.HTTP_404_NOT_FOUND)
        
        permission = CanCreateLiveSectionContent()
        if not permission.has_object_permission(request, self, ls):
            raise PermissionDenied("You don't have permission to create content for this live section.")
        
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data
        
        try:
            content = create_content(
                ls_id=ls_id,
                user=request.user,
                content_title=data["content_title"],
                link=data["link"],
                description=data.get("description", "")
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        except Exception:
            logger.exception("Unexpected error during content creation.")
            return Response({"detail": "Content creation failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(LiveSectionContentOutputSerializer(content).data, status=status.HTTP_201_CREATED)


class ContentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /live-sections/contents/<id>/"""
    
    permission_classes = [IsAuthenticated, CanManageLiveSectionContent]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return LiveSectionContentUpdateSerializer
        return LiveSectionContentOutputSerializer
    
    def get_object(self):
        return get_content_by_id(self.kwargs.get('pk'))
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response({"detail": "Content not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(LiveSectionContentOutputSerializer(instance).data)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response({"detail": "Content not found."}, status=status.HTTP_404_NOT_FOUND)
        
        self.check_object_permissions(request, instance)
        
        partial = kwargs.pop('partial', False)
        serializer = LiveSectionContentUpdateSerializer(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        try:
            updated = update_content(
                content_id=instance.pk,
                requesting_user=request.user,
                update_data=serializer.validated_data
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        
        return Response(LiveSectionContentOutputSerializer(updated).data)
    
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response({"detail": "Content not found."}, status=status.HTTP_404_NOT_FOUND)
        
        self.check_object_permissions(request, instance)
        
        try:
            delete_content(content_id=instance.pk, requesting_user=request.user)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Link/Unlink Views
# ---------------------------------------------------------------------------

class LinkLiveSectionToOfferView(generics.GenericAPIView):
    """POST /live-sections/<ls_id>/link/<offer_id>/"""
    
    permission_classes = [IsAuthenticated, CanLinkLiveSectionToOffer]
    
    def post(self, request, ls_id, offer_id, *args, **kwargs):
        try:
            link = link_ls_to_offer(ls_id=ls_id, offer_id=offer_id, requesting_user=request.user)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        
        return Response(
            {"detail": f"Live section linked to offer."},
            status=status.HTTP_201_CREATED
        )


class UnlinkLiveSectionFromOfferView(generics.GenericAPIView):
    """DELETE /live-sections/<ls_id>/unlink/<offer_id>/"""
    
    permission_classes = [IsAuthenticated, CanLinkLiveSectionToOffer]
    
    def delete(self, request, ls_id, offer_id, *args, **kwargs):
        try:
            unlink_ls_from_offer(ls_id=ls_id, offer_id=offer_id, requesting_user=request.user)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        
        return Response({"detail": "Live section unlinked from offer."}, status=status.HTTP_200_OK)