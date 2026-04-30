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

from posts.serializers import (
    OfferInputSerializer, OfferUpdateSerializer, OfferOutputSerializer,
    RequestInputSerializer, RequestUpdateSerializer, RequestOutputSerializer,
    OfferListQuerySerializer, RequestListQuerySerializer,
    LinkedCourseSerializer, LinkedLiveSectionSerializer
)
from posts.services import (
    create_offer, update_offer, delete_offer,
    create_request, update_request, delete_request
)
from posts.selectors import (
    get_offer_by_id, get_offers_queryset,
    get_request_by_id, get_requests_queryset,
    get_cached_offer_list, set_cached_offer_list,
    get_cached_request_list, set_cached_request_list,
    get_linked_courses_for_offer, get_linked_live_sections_for_offer
)
from posts.permissions import CanManageOffer, CanManageRequest, CanCreatePost
from backend.pagination import StandardResultsSetPagination

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Offer Views
# ---------------------------------------------------------------------------

class OfferCreateView(generics.CreateAPIView):
    """POST /posts/offers/create/ - Create a new offer."""
    
    permission_classes = [IsAuthenticated, CanCreatePost]
    serializer_class = OfferInputSerializer
    
    def create(self, request, *args, **kwargs):
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data
        
        try:
            offer = create_offer(
                user=request.user,
                offer_name=data["offer_name"],
                category=data["category"],
                description=data["description"],
                availability=data["availability"],
                status=data.get("status", "active")
            )
        except Exception:
            logger.exception("Unexpected error during offer creation.")
            return Response(
                {"detail": "Offer creation failed due to a server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
        output = OfferOutputSerializer(offer).data
        return Response(output, status=status.HTTP_201_CREATED)


class OfferDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /posts/offers/<id>/ - Get offer details
    PUT/PATCH /posts/offers/<id>/ - Update offer
    DELETE /posts/offers/<id>/ - Delete offer
    """
    
    permission_classes = [IsAuthenticated, CanManageOffer]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return OfferUpdateSerializer
        return OfferOutputSerializer
    
    def get_object(self):
        offer_id = self.kwargs.get('pk')
        return get_offer_by_id(offer_id)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Offer not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = OfferOutputSerializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Offer not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        self.check_object_permissions(request, instance)
        
        partial = kwargs.pop('partial', False)
        serializer = OfferUpdateSerializer(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        try:
            updated_offer = update_offer(
                offer_id=instance.pk,
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
        
        output_serializer = OfferOutputSerializer(updated_offer)
        return Response(output_serializer.data)
    
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Offer not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        self.check_object_permissions(request, instance)
        
        try:
            delete_offer(
                offer_id=instance.pk,
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


class OfferListView(generics.ListAPIView):
    """
    GET /posts/offers/ - List all offers with optional filters & pagination.
    
    Query Parameters:
    - category: filter by category
    - availability: filter by availability
    - status: filter by status (active/inactive/closed)
    - user_id: filter by creator
    - search: search in offer_name & description
    - ordering: field name (default: -created_at)
    - page: page number (default: 1)
    - page_size: items per page (default: 20, max: 100)
    
    Caching: First 10 pages cached for 5 minutes. 100% consistency via aggressive invalidation.
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = OfferOutputSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        query_serializer = OfferListQuerySerializer(data=self.request.query_params)
        query_serializer.is_valid(raise_exception=True)
        params = query_serializer.validated_data
        
        # Extract pagination params
        page = int(self.request.query_params.get('page', 1))
        page_size = int(self.request.query_params.get('page_size', 20))
        
        # Try Redis cache first
        cached = get_cached_offer_list(
            category=params.get('category'),
            availability=params.get('availability'),
            status=params.get('status'),
            user_id=params.get('user_id'),
            search=params.get('search'),
            ordering=params.get('ordering', '-created_at'),
            page=page,
            page_size=page_size
        )
        
        if cached is not None:
            # Return cached queryset-like result
            return cached
        
        # Cache miss — fetch from DB
        queryset = get_offers_queryset(
            category=params.get('category'),
            availability=params.get('availability'),
            status=params.get('status'),
            user_id=params.get('user_id'),
            search=params.get('search'),
            ordering=params.get('ordering', '-created_at')
        )
        
        # Convert to list and cache it (queryset evaluation happens here)
        result_list = list(queryset)
        set_cached_offer_list(
            result_list,
            category=params.get('category'),
            availability=params.get('availability'),
            status=params.get('status'),
            user_id=params.get('user_id'),
            search=params.get('search'),
            ordering=params.get('ordering', '-created_at'),
            page=page,
            page_size=page_size
        )
        
        return result_list


# ---------------------------------------------------------------------------
# Request Views
# ---------------------------------------------------------------------------

class RequestCreateView(generics.CreateAPIView):
    """POST /posts/requests/create/ - Create a new request."""
    
    permission_classes = [IsAuthenticated, CanCreatePost]
    serializer_class = RequestInputSerializer
    
    def create(self, request, *args, **kwargs):
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data
        
        try:
            request_obj = create_request(
                user=request.user,
                request_name=data["request_name"],
                category=data["category"],
                description=data["description"],
                status=data.get("status", "active")
            )
        except Exception:
            logger.exception("Unexpected error during request creation.")
            return Response(
                {"detail": "Request creation failed due to a server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
        output = RequestOutputSerializer(request_obj).data
        return Response(output, status=status.HTTP_201_CREATED)


class RequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /posts/requests/<id>/ - Get request details
    PUT/PATCH /posts/requests/<id>/ - Update request
    DELETE /posts/requests/<id>/ - Delete request
    """
    
    permission_classes = [IsAuthenticated, CanManageRequest]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return RequestUpdateSerializer
        return RequestOutputSerializer
    
    def get_object(self):
        request_id = self.kwargs.get('pk')
        return get_request_by_id(request_id)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Request not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = RequestOutputSerializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Request not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        self.check_object_permissions(request, instance)
        
        partial = kwargs.pop('partial', False)
        serializer = RequestUpdateSerializer(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        try:
            updated_request = update_request(
                request_id=instance.pk,
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
        
        output_serializer = RequestOutputSerializer(updated_request)
        return Response(output_serializer.data)
    
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Request not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        self.check_object_permissions(request, instance)
        
        try:
            delete_request(
                request_id=instance.pk,
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


class RequestListView(generics.ListAPIView):
    """
    GET /posts/requests/ - List all requests with optional filters & pagination.
    
    Query Parameters:
    - category: filter by category
    - status: filter by status (active/inactive/closed)
    - user_id: filter by creator
    - search: search in request_name & description
    - ordering: field name (default: -created_at)
    - page: page number (default: 1)
    - page_size: items per page (default: 20, max: 100)
    
    Caching: First 10 pages cached for 5 minutes. 100% consistency via aggressive invalidation.
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = RequestOutputSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        query_serializer = RequestListQuerySerializer(data=self.request.query_params)
        query_serializer.is_valid(raise_exception=True)
        params = query_serializer.validated_data
        
        # Extract pagination params
        page = int(self.request.query_params.get('page', 1))
        page_size = int(self.request.query_params.get('page_size', 20))
        
        # Try Redis cache first
        cached = get_cached_request_list(
            category=params.get('category'),
            status=params.get('status'),
            user_id=params.get('user_id'),
            search=params.get('search'),
            ordering=params.get('ordering', '-created_at'),
            page=page,
            page_size=page_size
        )
        
        if cached is not None:
            # Return cached queryset-like result
            return cached
        
        # Cache miss — fetch from DB
        queryset = get_requests_queryset(
            category=params.get('category'),
            status=params.get('status'),
            user_id=params.get('user_id'),
            search=params.get('search'),
            ordering=params.get('ordering', '-created_at')
        )
        
        # Convert to list and cache it (queryset evaluation happens here)
        result_list = list(queryset)
        set_cached_request_list(
            result_list,
            category=params.get('category'),
            status=params.get('status'),
            user_id=params.get('user_id'),
            search=params.get('search'),
            ordering=params.get('ordering', '-created_at'),
            page=page,
            page_size=page_size
        )
        
        return result_list



# ---------------------------------------------------------------------------
# Linked Courses & LiveSections Views
# ---------------------------------------------------------------------------

class OfferLinkedCoursesView(generics.GenericAPIView):
    """
    GET /posts/offers/<pk>/linked-courses/
    Returns all courses linked to a specific offer.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk, *args, **kwargs):
        offer = get_offer_by_id(pk)
        if not offer:
            return Response(
                {"detail": "Offer not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        linked_courses = get_linked_courses_for_offer(pk)
        serializer = LinkedCourseSerializer(linked_courses, many=True)
        return Response(serializer.data)


class OfferLinkedLiveSectionsView(generics.GenericAPIView):
    """
    GET /posts/offers/<pk>/linked-live-sections/
    Returns all live sections linked to a specific offer.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk, *args, **kwargs):
        offer = get_offer_by_id(pk)
        if not offer:
            return Response(
                {"detail": "Offer not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        linked_ls = get_linked_live_sections_for_offer(pk)
        serializer = LinkedLiveSectionSerializer(linked_ls, many=True)
        return Response(serializer.data)