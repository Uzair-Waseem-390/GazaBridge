"""
Views
=====
Thin HTTP layer only.
Pattern: validate input → call service → return output.
"""

import logging

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from forget_password.serializers import (
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
)
from forget_password.services.fp_services import (
    confirm_password_reset,
    request_password_reset,
)

logger = logging.getLogger(__name__)

# Human-readable messages keyed by service error codes.
_CONFIRM_ERRORS = {
    "invalid": "This password reset link is invalid.",
    "used":    "This password reset link has already been used.",
    "expired": "This password reset link has expired. Please request a new one.",
}


# ---------------------------------------------------------------------------
# Request reset
# ---------------------------------------------------------------------------

class PasswordResetRequestView(generics.GenericAPIView):
    """
    POST /forget-password/request/

    Accepts an email address and queues a reset email if the account exists
    and is active. Always returns 200 regardless of whether the email exists
    — prevents user enumeration.

    Request body:
        email (string, required)

    Returns:
        200 — {"detail": "If that email exists, we've sent a reset link."}
        400 — invalid email format
    """

    permission_classes = [AllowAny]
    serializer_class   = PasswordResetRequestSerializer


    _REQUEST_ERRORS = {
        "not_found":    "No account found with this email address.",
        "not_verified": (
            "This account has not been verified yet. "
            "Please verify your email before resetting your password."
        ),
    }

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            request_password_reset(email=serializer.validated_data["email"])
        except ValueError as exc:
            message = self._REQUEST_ERRORS.get(str(exc), "Request failed.")
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            logger.exception("Unexpected error during password reset request.")
            return Response(
                {"detail": "Request failed due to a server error. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"detail": "Password reset link sent. Please check your inbox. The link expires in 15 minutes."},
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Confirm reset (user clicks link, submits new password)
# ---------------------------------------------------------------------------

class PasswordResetConfirmView(generics.GenericAPIView):
    """
    POST /forget-password/confirm/<token>/

    Validates the token and sets the new password.

    URL parameter:
        token (UUID string) — from the reset link

    Request body:
        new_password     (string, required, min 8 chars)
        confirm_password (string, required, must match new_password)

    Returns:
        200 — {"detail": "Password reset successful."}
        400 — token invalid / expired / used, or passwords don't match
    """

    permission_classes = [AllowAny]
    serializer_class   = PasswordResetConfirmSerializer

    def post(self, request, token: str, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            confirm_password_reset(
                token_value  = token,
                new_password = serializer.validated_data["new_password"],
            )
        except ValueError as exc:
            error_key = str(exc)
            message   = _CONFIRM_ERRORS.get(error_key, "Password reset failed.")
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            logger.exception("Unexpected error during password reset confirmation.")
            return Response(
                {"detail": "Password reset failed due to a server error. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"detail": "Password reset successful."},
            status=status.HTTP_200_OK,
        )