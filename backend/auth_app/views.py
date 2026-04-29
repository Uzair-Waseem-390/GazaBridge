"""
Views
=====
Thin HTTP layer only.
Pattern: validate input → call service → return output.
"""

import logging
from datetime import timedelta

from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from auth_app.permissions import IsOwnerOfActivity
from auth_app.selectors.auth_selectors import get_activity
from auth_app.serializers import (
    ActivityOutputSerializer,
    ActivityVisibilityInputSerializer,
    LoginInputSerializer,
    LogoutInputSerializer,
    RefreshInputSerializer,
    GoogleAuthInputSerializer,
    GoogleRegisterInputSerializer,
)
from auth_app.services.auth_services import (
    login_user,
    logout_user,
    refresh_token,
    update_activity_visibility,
)
from auth_app.services.google_oauth import google_login, complete_google_registration

logger = logging.getLogger(__name__)

# Human-readable login error messages keyed by service error codes.
_LOGIN_ERRORS = {
    "not_found":      "No account found with this email address.",
    "wrong_password": "Incorrect password.",
    "not_verified":   (
        "Your email address has not been verified. "
        "Please check your inbox for the verification link."
    ),
}


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

class LoginView(generics.GenericAPIView):
    """
    POST /auth/login/

    Authenticates a user and returns a JWT token pair with role info.

    Request body:
        email    (string, required)
        password (string, required)

    Returns:
        200 — {access, refresh, user: {id, email, first_name, last_name, roles}}
        401 — invalid credentials or unverified email
    """

    permission_classes = [AllowAny]
    serializer_class   = LoginInputSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            token_data = login_user(
                email    = data["email"],
                password = data["password"],
            )
        except ValueError as exc:
            error_key = str(exc)
            message   = _LOGIN_ERRORS.get(error_key, "Authentication failed.")
            return Response({"detail": message}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception:
            logger.exception("Unexpected error during login.")
            return Response(
                {"detail": "Login failed due to a server error. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(token_data, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Google Auth
# ---------------------------------------------------------------------------

class GoogleAuthView(generics.GenericAPIView):
    """
    POST /auth/google/

    Exchanges the Google authorization code for tokens.

    The frontend must send:
        code         — the authorization code received from Google
        redirect_uri — the exact URI the frontend used when opening the consent
                       screen (must match a registered Authorized Redirect URI in
                       Google Cloud Console)

    Returns:
        Existing user → 200 {access, refresh, user, is_new_user: false}
        New user      → 200 {is_new_user: true, registration_token, user: {email, ...}}
    """
    permission_classes = [AllowAny]
    serializer_class = GoogleAuthInputSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            result = google_login(
                code=serializer.validated_data["code"],
                redirect_uri=serializer.validated_data["redirect_uri"],
            )
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            logger.exception("Unexpected error during Google login.")
            return Response(
                {"detail": "Login failed due to a server error. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GoogleRegisterView(generics.GenericAPIView):
    """
    POST /auth/google/register/
    Completes the registration for a new Google user using the temporary
    registration token and the required profile fields.
    """
    permission_classes = [AllowAny]
    serializer_class = GoogleRegisterInputSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = complete_google_registration(**serializer.validated_data)
            return Response(result, status=status.HTTP_201_CREATED)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            logger.exception("Unexpected error during Google registration.")
            return Response(
                {"detail": "Registration failed due to a server error. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ---------------------------------------------------------------------------
# Refresh
# ---------------------------------------------------------------------------

class RefreshView(generics.GenericAPIView):
    """
    POST /auth/refresh/

    Rotates the refresh token. The old refresh token is immediately
    invalidated — only the new one is valid going forward.

    Request body:
        refresh (string, required) — the current refresh token

    Returns:
        200 — {access, refresh, user: {...}}
        401 — token invalid, expired, or already rotated
    """

    permission_classes = [AllowAny]
    serializer_class   = RefreshInputSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            token_data = refresh_token(
                old_refresh_token=serializer.validated_data["refresh"]
            )
        except ValueError:
            return Response(
                {"detail": "Refresh token is invalid or has already been used."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except Exception:
            logger.exception("Unexpected error during token refresh.")
            return Response(
                {"detail": "Token refresh failed. Please log in again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(token_data, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------


class LogoutView(generics.GenericAPIView):
    """
    POST /auth/logout/

    Invalidates both the access token (Redis blacklist) and the
    refresh token (deleted from Redis). The client must discard both.

    Request body:
        refresh (string, required) — current refresh token

    Returns:
        200 — {"detail": "Logged out successfully."}
        400 — missing or malformed refresh token
        401 — not authenticated
    """

    permission_classes = [IsAuthenticated]
    serializer_class   = LogoutInputSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from rest_framework_simplejwt.exceptions import TokenError
        from rest_framework_simplejwt.tokens import RefreshToken

        # ── Extract refresh JTI ───────────────────────────────────────────
        try:
            refresh_obj = RefreshToken(serializer.validated_data["refresh"])
            refresh_jti = str(refresh_obj["jti"])
        except TokenError:
            return Response(
                {"detail": "Invalid refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Extract access JTI from the authenticated request ─────────────
        access_token  = request.auth  # set by BlacklistAwareJWTAuthentication
        access_jti    = str(access_token["jti"])
        access_exp    = access_token["exp"]

        from django.utils import timezone as tz
        import time
        remaining_seconds = max(0, int(access_exp - time.time()))

        try:
            logout_user(
                access_jti              = access_jti,
                refresh_jti             = refresh_jti,
                access_lifetime_seconds = remaining_seconds,
            )
        except Exception:
            logger.exception("Unexpected error during logout.")
            return Response(
                {"detail": "Logout failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# User Activity — own record only
# ---------------------------------------------------------------------------

class MyActivityView(generics.RetrieveUpdateAPIView):
    """
    GET  /auth/activity/   — retrieve own last login + visibility setting
    PATCH /auth/activity/  — toggle is_visible

    Rules:
    - Must be authenticated.
    - Can only access your own record.
    - last_login_at and updated_at are read-only.
    """

    permission_classes = [IsAuthenticated, IsOwnerOfActivity]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return ActivityVisibilityInputSerializer
        return ActivityOutputSerializer

    def get_object(self):
        from auth_app.models import UserActivity
        activity, _ = UserActivity.objects.get_or_create(
            user=self.request.user,
            defaults={"is_visible": True},
        )
        # Triggers has_object_permission on IsOwnerOfActivity.
        self.check_object_permissions(self.request, activity)
        return activity

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            activity = update_activity_visibility(
                user       = request.user,
                is_visible = serializer.validated_data["is_visible"],
            )
        except Exception:
            logger.exception("Unexpected error updating activity visibility.")
            return Response(
                {"detail": "Update failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            ActivityOutputSerializer(activity).data,
            status=status.HTTP_200_OK,
        )

    # Disable full PUT — only PATCH makes sense for a single boolean toggle.
    def put(self, request, *args, **kwargs):
        return Response(
            {"detail": "Use PATCH to update activity settings."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )