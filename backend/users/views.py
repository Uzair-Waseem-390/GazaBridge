"""
Views
=====
Thin HTTP layer with proper permissions.
Pattern per view: validate input → call service → return output.
"""

import logging

from rest_framework import generics, status, views
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError

from users.serializers import (
    RegisterInputSerializer, RegisterOutputSerializer,
    ResendVerificationInputSerializer, UserSerializer,
    UserUpdateInputSerializer, ChangePasswordSerializer,
    PromoteDemoteSerializer, UserListQuerySerializer,
    CreateSuperuserInputSerializer
)
from users.services.user_services import (
    register_user, resend_verification_email, verify_email,
    update_user_profile, delete_user, promote_to_manager,
    demote_from_manager, change_user_password, create_superuser_account
)
from users.selectors.user_selectors import (
    get_user_by_id, get_users_with_filters, get_user_with_permissions
)
from users.permissions import (
    IsAdminOrSuperuser, CanManageUser, CanPromoteDemoteUser, CanChangePassword
)

logger = logging.getLogger(__name__)

_VERIFY_ERRORS = {
    "invalid": "This verification link is invalid.",
    "used": "This verification link has already been used.",
    "expired": "This verification link has expired. Please request a new one.",
}


# ---------------------------------------------------------------------------
# Registration & Verification
# ---------------------------------------------------------------------------

class RegisterView(generics.CreateAPIView):
    """POST /users/register/ - Create new user account."""
    
    permission_classes = [AllowAny]
    serializer_class = RegisterInputSerializer
    
    def create(self, request, *args, **kwargs):
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data
        
        try:
            user = register_user(
                email=data["email"],
                password=data["password"],
                first_name=data["first_name"],
                last_name=data["last_name"],
                country=data["country"],
                gender=data["gender"],
                linkedin=data["linkedin"],
                roles=data["roles"],
                languages=data.get("languages", []),
                whatsapp_number=data.get("whatsapp_number", ""),
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            logger.exception("Unexpected error during user registration.")
            return Response(
                {"detail": "Registration failed due to a server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
        output = RegisterOutputSerializer(user).data
        return Response(
            {
                **output,
                "message": "Registration successful. Please check your inbox to verify your email.",
            },
            status=status.HTTP_201_CREATED,
        )


class CreateSuperuserView(generics.CreateAPIView):
    """POST /users/create-superuser/ - Create a superuser account."""
    
    permission_classes = [AllowAny]
    serializer_class = CreateSuperuserInputSerializer
    
    def create(self, request, *args, **kwargs):
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data
        
        try:
            user = create_superuser_account(
                email=data["email"],
                password=data["password"],
                first_name=data["first_name"],
                last_name=data["last_name"],
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            logger.exception("Unexpected error during superuser creation.")
            return Response(
                {"detail": "Superuser creation failed due to a server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
        output = UserSerializer(user).data
        return Response(
            {
                **output,
                "message": "Superuser created successfully.",
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(generics.GenericAPIView):
    """GET /users/verify-email/<token>/ - Verify user email."""
    
    permission_classes = [AllowAny]
    
    def get(self, request, token: str, *args, **kwargs):
        try:
            verify_email(token_value=token)
        except ValueError as exc:
            error_key = str(exc)
            message = _VERIFY_ERRORS.get(error_key, "Verification failed.")
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            logger.exception("Unexpected error during email verification.")
            return Response(
                {"detail": "Verification failed due to a server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
        return Response(
            {"detail": "Email verified successfully."},
            status=status.HTTP_200_OK,
        )


class ResendVerificationView(generics.GenericAPIView):
    """POST /users/resend-verification/ - Resend verification email."""
    
    permission_classes = [AllowAny]
    serializer_class = ResendVerificationInputSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            resend_verification_email(email=serializer.validated_data["email"])
        except Exception:
            logger.exception("Unexpected error during verification resend.")
        
        return Response(
            {
                "detail": "If that email address exists and is unverified, we've sent a new verification link."
            },
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# User Profile Management
# ---------------------------------------------------------------------------

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /users/<id>/ - Get user details
    PUT/PATCH /users/<id>/ - Update user profile
    DELETE /users/<id>/ - Delete user (soft/hard based on role)
    """
    
    permission_classes = [IsAuthenticated, CanManageUser]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateInputSerializer
        return UserSerializer
    
    def get_object(self):
        user_id = self.kwargs.get('pk')
        return get_user_with_permissions(user_id, self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = UserSerializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not getattr(instance, 'can_be_updated_by', False):
            raise PermissionDenied("You don't have permission to update this user.")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            updated_user = update_user_profile(
                user_id=instance.pk,
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
        
        output_serializer = UserSerializer(updated_user)
        return Response(output_serializer.data)
    
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not getattr(instance, 'can_be_deleted_by', False):
            raise PermissionDenied("You don't have permission to delete this user.")
        
        # Hard delete if requester is admin/superuser
        hard_delete = request.user.is_staff or request.user.is_superuser
        
        try:
            delete_user(
                user_id=instance.pk,
                requesting_user=request.user,
                hard_delete=hard_delete
            )
        except (ValueError, PermissionError) as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            {"detail": "User deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


class ChangePasswordView(generics.UpdateAPIView):
    """POST /users/change-password/<id>/ - Change user password."""
    
    permission_classes = [IsAuthenticated, CanChangePassword]
    serializer_class = ChangePasswordSerializer
    
    def get_object(self):
        user_id = self.kwargs.get('pk')
        return get_user_by_id(user_id)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if instance.pk != request.user.pk:
            raise PermissionDenied("You can only change your own password.")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            change_user_password(
                user_id=instance.pk,
                requesting_user=request.user,
                new_password=serializer.validated_data['new_password']
            )
        except (ValueError, PermissionError) as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            {"detail": "Password changed successfully."},
            status=status.HTTP_200_OK
        )


# ---------------------------------------------------------------------------
# User List (Admin & Manager)
# ---------------------------------------------------------------------------

class UserListView(generics.ListAPIView):
    """
    GET /users/ - List users with filtering.
    Access: Any Authenticated User (used for chat search)
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        query_serializer = UserListQuerySerializer(data=self.request.query_params)
        query_serializer.is_valid(raise_exception=True)
        
        params = query_serializer.validated_data
        
        result = get_users_with_filters(
            role=params.get('role'),
            country=params.get('country'),
            is_active=params.get('is_active'),
            search=params.get('search'),
            page=params.get('page', 1),
            page_size=params.get('page_size', 20)
        )
        
        self.pagination_results = result
        return result['users']
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            "users": serializer.data,
            "pagination": {
                "total_count": self.pagination_results['total_count'],
                "page": self.pagination_results['page'],
                "page_size": self.pagination_results['page_size'],
                "total_pages": self.pagination_results['total_pages']
            }
        })


# ---------------------------------------------------------------------------
# Role Management (Admin only)
# ---------------------------------------------------------------------------

class PromoteToManagerView(generics.GenericAPIView):
    """POST /users/promote-to-manager/ - Promote user to manager (Admin only)."""
    
    permission_classes = [IsAuthenticated, CanPromoteDemoteUser]
    serializer_class = PromoteDemoteSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            user = promote_to_manager(
                target_user_id=serializer.validated_data['user_id'],
                requesting_user=request.user
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        
        return Response({
            "detail": f"User {user.email} has been promoted to manager.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class DemoteFromManagerView(generics.GenericAPIView):
    """POST /users/demote-from-manager/ - Demote user from manager (Admin only)."""
    
    permission_classes = [IsAuthenticated, CanPromoteDemoteUser]
    serializer_class = PromoteDemoteSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            user = demote_from_manager(
                target_user_id=serializer.validated_data['user_id'],
                requesting_user=request.user
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionError as exc:
            raise PermissionDenied(str(exc))
        
        return Response({
            "detail": f"User {user.email} has been demoted from manager.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Current User Profile
# ---------------------------------------------------------------------------

class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    GET /users/me/ - Get current user profile
    PUT/PATCH /users/me/ - Update current user profile
    """
    
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateInputSerializer
        return UserSerializer
    
    def get_object(self):
        return get_user_by_id(self.request.user.pk)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = UserSerializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            updated_user = update_user_profile(
                user_id=instance.pk,
                requesting_user=request.user,
                update_data=serializer.validated_data
            )
        except (ValueError, PermissionError) as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        output_serializer = UserSerializer(updated_user)
        return Response(output_serializer.data)