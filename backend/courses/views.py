"""
Views
=====
Thin HTTP layer with proper permissions.
Pattern per view: validate input → call service → return output.
"""

import logging

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from courses.serializers import (
    CourseInputSerializer, CourseUpdateSerializer,
    CourseOutputSerializer, CourseDetailOutputSerializer,
    ContentInputSerializer, ContentUpdateSerializer, ContentOutputSerializer,
    CourseListQuerySerializer
)
from courses.services import (
    create_course, update_course, delete_course,
    create_content, update_content, delete_content,
    link_course_to_offer, unlink_course_from_offer
)
from courses.selectors import (
    get_course_by_id, get_courses_queryset,
    get_content_by_id, get_visible_contents_for_course,
    get_cached_course_list, set_cached_course_list
)
from courses.permissions import (
    CanManageCourse, CanManageContent, CanCreateCourse,
    CanCreateContent, CanLinkCourseToOffer
)
from backend.pagination import StandardResultsSetPagination

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Course Views
# ---------------------------------------------------------------------------

class CourseCreateView(generics.CreateAPIView):
    """POST /courses/create/ - Create a new course."""
    
    permission_classes = [IsAuthenticated, CanCreateCourse]
    serializer_class = CourseInputSerializer
    
    def create(self, request, *args, **kwargs):
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data
        
        try:
            course = create_course(
                user=request.user,
                title=data["title"],
                category=data["category"],
                description=data["description"],
                skill_level=data["skill_level"],
                language=data["language"],
                sessions_per_week=data["sessions_per_week"],
                session_duration=data["session_duration"],
                course_duration_days=data["course_duration_days"],
                status=data.get("status", "active")
            )
        except Exception:
            logger.exception("Unexpected error during course creation.")
            return Response(
                {"detail": "Course creation failed due to a server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
        output = self._serialize_course_detail(course, request)
        return Response(output, status=status.HTTP_201_CREATED)
    
    def _serialize_course_detail(self, course, request):
        """Serialize course detail with visibility-filtered contents."""
        data = CourseDetailOutputSerializer(course).data
        visible_contents = get_visible_contents_for_course(course, request.user)
        data['contents'] = ContentOutputSerializer(visible_contents, many=True).data
        return data


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /courses/<id>/ - Get course details with contents
    PUT/PATCH /courses/<id>/ - Update course
    DELETE /courses/<id>/ - Delete course (cascades to contents and links)
    """
    
    permission_classes = [IsAuthenticated, CanManageCourse]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CourseUpdateSerializer
        return CourseDetailOutputSerializer
    
    def get_object(self):
        course_id = self.kwargs.get('pk')
        return get_course_by_id(course_id)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Course not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Serialize course with visibility-filtered contents
        data = CourseDetailOutputSerializer(instance).data
        visible_contents = get_visible_contents_for_course(instance, request.user)
        data['contents'] = ContentOutputSerializer(visible_contents, many=True).data
        
        return Response(data)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Course not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        self.check_object_permissions(request, instance)
        
        partial = kwargs.pop('partial', False)
        serializer = CourseUpdateSerializer(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        try:
            updated_course = update_course(
                course_id=instance.pk,
                requesting_user=request.user,
                update_data=serializer.validated_data
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        
        # Return with visibility-filtered contents
        data = CourseDetailOutputSerializer(updated_course).data
        visible_contents = get_visible_contents_for_course(updated_course, request.user)
        data['contents'] = ContentOutputSerializer(visible_contents, many=True).data
        
        return Response(data)
    
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Course not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        self.check_object_permissions(request, instance)
        
        try:
            delete_course(
                course_id=instance.pk,
                requesting_user=request.user
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        
        return Response(status=status.HTTP_204_NO_CONTENT)


class CourseListView(generics.ListAPIView):
    """
    GET /courses/ - List all courses with optional filters & pagination.
    
    Query Parameters:
    - category, skill_level, language, status, user_id, search, ordering
    - page, page_size
    
    Caching: First 10 pages cached for 5 minutes.
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = CourseOutputSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        query_serializer = CourseListQuerySerializer(data=self.request.query_params)
        query_serializer.is_valid(raise_exception=True)
        params = query_serializer.validated_data
        
        page = int(self.request.query_params.get('page', 1))
        page_size = int(self.request.query_params.get('page_size', 20))
        
        cached = get_cached_course_list(
            category=params.get('category'),
            skill_level=params.get('skill_level'),
            language=params.get('language'),
            status=params.get('status'),
            user_id=params.get('user_id'),
            search=params.get('search'),
            ordering=params.get('ordering', '-created_at'),
            page=page,
            page_size=page_size
        )
        
        if cached is not None:
            return cached
        
        queryset = get_courses_queryset(
            category=params.get('category'),
            skill_level=params.get('skill_level'),
            language=params.get('language'),
            status=params.get('status'),
            user_id=params.get('user_id'),
            search=params.get('search'),
            ordering=params.get('ordering', '-created_at')
        )
        
        result_list = list(queryset)
        set_cached_course_list(
            result_list,
            category=params.get('category'),
            skill_level=params.get('skill_level'),
            language=params.get('language'),
            status=params.get('status'),
            user_id=params.get('user_id'),
            search=params.get('search'),
            ordering=params.get('ordering', '-created_at'),
            page=page,
            page_size=page_size
        )
        
        return result_list


# ---------------------------------------------------------------------------
# Content Views
# ---------------------------------------------------------------------------

class ContentCreateView(generics.CreateAPIView):
    """POST /courses/<course_id>/contents/create/ - Create content for a course."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = ContentInputSerializer
    
    def create(self, request, course_id, *args, **kwargs):
        course = get_course_by_id(course_id)
        if not course:
            return Response(
                {"detail": "Course not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        permission = CanCreateContent()
        if not permission.has_object_permission(request, self, course):
            raise PermissionDenied("You don't have permission to create content for this course.")
        
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data
        
        try:
            content = create_content(
                course_id=course_id,
                user=request.user,
                content_title=data["content_title"],
                link=data["link"],
                description=data.get("description", "")
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        except Exception:
            logger.exception("Unexpected error during content creation.")
            return Response(
                {"detail": "Content creation failed due to a server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
        output = ContentOutputSerializer(content).data
        return Response(output, status=status.HTTP_201_CREATED)


class ContentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /courses/contents/<id>/ - Get content detail
    PUT/PATCH /courses/contents/<id>/ - Update content
    DELETE /courses/contents/<id>/ - Delete content
    """
    
    permission_classes = [IsAuthenticated, CanManageContent]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ContentUpdateSerializer
        return ContentOutputSerializer
    
    def get_object(self):
        content_id = self.kwargs.get('pk')
        return get_content_by_id(content_id)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Content not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ContentOutputSerializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Content not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        self.check_object_permissions(request, instance)
        
        partial = kwargs.pop('partial', False)
        serializer = ContentUpdateSerializer(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        try:
            updated_content = update_content(
                content_id=instance.pk,
                requesting_user=request.user,
                update_data=serializer.validated_data
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        
        output_serializer = ContentOutputSerializer(updated_content)
        return Response(output_serializer.data)
    
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Content not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        self.check_object_permissions(request, instance)
        
        try:
            delete_content(
                content_id=instance.pk,
                requesting_user=request.user
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Link/Unlink Views
# ---------------------------------------------------------------------------

class LinkCourseToOfferView(generics.GenericAPIView):
    """POST /courses/<course_id>/link/<offer_id>/ - Link a course to an offer."""
    
    permission_classes = [IsAuthenticated, CanLinkCourseToOffer]
    
    def post(self, request, course_id, offer_id, *args, **kwargs):
        try:
            link = link_course_to_offer(
                course_id=course_id,
                offer_id=offer_id,
                requesting_user=request.user
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        
        return Response(
            {"detail": f"Course '{link.course.title}' linked to offer '{link.offer.offer_name}'."},
            status=status.HTTP_201_CREATED
        )


class UnlinkCourseFromOfferView(generics.GenericAPIView):
    """DELETE /courses/<course_id>/unlink/<offer_id>/ - Unlink a course from an offer."""
    
    permission_classes = [IsAuthenticated, CanLinkCourseToOffer]
    
    def delete(self, request, course_id, offer_id, *args, **kwargs):
        try:
            unlink_course_from_offer(
                course_id=course_id,
                offer_id=offer_id,
                requesting_user=request.user
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        
        return Response(
            {"detail": "Course unlinked from offer."},
            status=status.HTTP_200_OK
        )