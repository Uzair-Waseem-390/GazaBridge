"""
Views
=====
Thin HTTP layer only.
Every view follows the same pattern:
  1. Deserialise + validate input via serializer.
  2. Call the service.
  3. Serialise + return output.

No business logic or ORM calls live here.
"""

import logging

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import RegisterInputSerializer, RegisterOutputSerializer
from .services.user_services import register_user

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """
    POST /users/register/

    Open endpoint — no authentication required.
    Registers a new user as volunteer, seeker, or both.

    Request body:
        email       (string, required)
        password    (string, required, min 8 chars)
        first_name  (string, required)
        last_name   (string, required)
        country     (string, required)
        roles       (list,   required) — ["volunteer"], ["seeker"], or both
        languages   (list,   optional) — language codes from LanguageChoices

    Returns:
        201 — full user object (id, email, name, country, languages, roles)
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
                email      = data["email"],
                password   = data["password"],
                first_name = data["first_name"],
                last_name  = data["last_name"],
                country    = data["country"],
                roles      = data["roles"],
                languages  = data.get("languages", []),
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

        output_serializer = RegisterOutputSerializer(user)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)