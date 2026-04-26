"""
Views
=====
Thin HTTP layer.
Pattern per view: validate input → call service → return output.
No business logic or ORM calls here.
"""

import logging

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from users.serializers import (
    RegisterInputSerializer,
    RegisterOutputSerializer,
    ResendVerificationInputSerializer,
)
from users.services.user_services import register_user, resend_verification_email, verify_email

logger = logging.getLogger(__name__)

# Human-readable messages for each token failure mode.
_VERIFY_ERRORS = {
    "invalid": "This verification link is invalid.",
    "used":    "This verification link has already been used.",
    "expired": "This verification link has expired. Please request a new one.",
}


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------

class RegisterView(generics.CreateAPIView):
    """
    POST /users/register/

    Creates an inactive user and dispatches a verification email via Celery.

    Request body:
        email            (string,   required)
        password         (string,   required, min 8 chars)
        first_name       (string,   required)
        last_name        (string,   required)
        country          (string,   required)
        gender           (string,   required) — "male" | "female"
        linkedin         (url,      required)
        roles            (list,     required) — ["volunteer"] | ["seeker"] | both
        languages        (list,     optional) — LanguageChoices codes
        whatsapp_number  (string,   optional)

    Returns:
        201 — user object + "Check your inbox to verify your email."
        400 — validation error or duplicate email
    """

    permission_classes = [AllowAny]
    serializer_class   = RegisterInputSerializer

    def create(self, request, *args, **kwargs):
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data

        try:
            user = register_user(
                email           = data["email"],
                password        = data["password"],
                first_name      = data["first_name"],
                last_name       = data["last_name"],
                country         = data["country"],
                gender          = data["gender"],
                linkedin        = data["linkedin"],
                roles           = data["roles"],
                languages       = data.get("languages", []),
                whatsapp_number = data.get("whatsapp_number", ""),
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            logger.exception("Unexpected error during user registration.")
            return Response(
                {"detail": "Registration failed due to a server error. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        output = RegisterOutputSerializer(user).data
        return Response(
            {
                **output,
                "message": (
                    "Registration successful. "
                    "Please check your inbox and verify your email to activate your account."
                ),
            },
            status=status.HTTP_201_CREATED,
        )


# ---------------------------------------------------------------------------
# Verify email
# ---------------------------------------------------------------------------

class VerifyEmailView(generics.GenericAPIView):
    """
    GET /users/verify-email/<token>/

    Validates the token, activates the user, returns JSON confirmation.

    Returns:
        200 — {"detail": "Email verified successfully."}
        400 — token invalid / expired / already used
    """

    permission_classes = [AllowAny]

    def get(self, request, token: str, *args, **kwargs):
        try:
            verify_email(token_value=token)
        except ValueError as exc:
            error_key = str(exc)
            message   = _VERIFY_ERRORS.get(error_key, "Verification failed.")
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            logger.exception("Unexpected error during email verification.")
            return Response(
                {"detail": "Verification failed due to a server error. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"detail": "Email verified successfully."},
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Resend verification email
# ---------------------------------------------------------------------------

class ResendVerificationView(generics.GenericAPIView):
    """
    POST /users/resend-verification/

    Queues a fresh verification email for an unverified account.

    Always returns 200 regardless of whether the email exists — this
    prevents user enumeration (attackers cannot probe which emails are
    registered by observing different responses).

    Request body:
        email (string, required)

    Returns:
        200 — {"detail": "If that email exists and is unverified, we've sent a new link."}
    """

    permission_classes = [AllowAny]
    serializer_class   = ResendVerificationInputSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            resend_verification_email(email=serializer.validated_data["email"])
        except Exception:
            logger.exception("Unexpected error during verification resend.")
            # Still return 200 — do not expose internals.

        return Response(
            {
                "detail": (
                    "If that email address exists and is unverified, "
                    "we've sent a new verification link."
                )
            },
            status=status.HTTP_200_OK,
        )