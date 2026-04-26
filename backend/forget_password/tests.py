"""
Test suite — forget_password app
==================================
Covers:
  - PasswordResetToken model
  - Selectors
  - Services (request_password_reset, confirm_password_reset)
  - PasswordResetRequestView endpoint
  - PasswordResetConfirmView endpoint

Run with:
    python manage.py test forget_password
"""

from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import Role, User

from .models import PasswordResetToken
from .selectors.fp_selectors import get_token_by_value
from .services.fp_services import confirm_password_reset, request_password_reset


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_active_user(**kwargs) -> User:
    for name in ["volunteer", "seeker", "manager"]:
        Role.objects.get_or_create(name=name)

    defaults = dict(
        email      = "user@example.com",
        first_name = "Test",
        last_name  = "User",
        country    = "Pakistan",
        gender     = "male",
        linkedin   = "https://linkedin.com/in/test",
        is_active  = True,
    )
    defaults.update(kwargs)
    password = kwargs.pop("password", "StrongPass123")
    user = User(**defaults)
    user.set_password(password)
    user.save()
    return user


def make_expired_token(user: User) -> PasswordResetToken:
    PasswordResetToken.objects.filter(user=user, is_used=False).delete()
    return PasswordResetToken.objects.create(
        user       = user,
        expires_at = timezone.now() - timedelta(minutes=1),
    )


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class PasswordResetTokenModelTest(TestCase):
    def setUp(self):
        self.user = make_active_user()

    def test_str(self):
        token = PasswordResetToken.objects.create(
            user=self.user,
            expires_at=timezone.now() + timedelta(minutes=15),
        )
        self.assertIn(self.user.email, str(token))

    def test_is_valid_when_fresh(self):
        token = PasswordResetToken.objects.create(
            user=self.user,
            expires_at=timezone.now() + timedelta(minutes=15),
        )
        self.assertTrue(token.is_valid())

    def test_is_invalid_when_expired(self):
        token = make_expired_token(self.user)
        self.assertFalse(token.is_valid())

    def test_is_invalid_when_used(self):
        token = PasswordResetToken.objects.create(
            user=self.user,
            expires_at=timezone.now() + timedelta(minutes=15),
            is_used=True,
        )
        self.assertFalse(token.is_valid())


# ---------------------------------------------------------------------------
# Selector tests
# ---------------------------------------------------------------------------

class SelectorTest(TestCase):
    def setUp(self):
        self.user = make_active_user()

    @patch("forget_password.tasks.send_password_reset_email.delay")
    def test_get_token_by_value_found(self, mock_task):
        request_password_reset(email=self.user.email)
        token = PasswordResetToken.objects.filter(user=self.user).first()
        result = get_token_by_value(str(token.token))
        self.assertIsNotNone(result)

    def test_get_token_by_value_not_found(self):
        import uuid
        self.assertIsNone(get_token_by_value(str(uuid.uuid4())))

    def test_get_token_by_value_malformed(self):
        self.assertIsNone(get_token_by_value("not-a-uuid"))


# ---------------------------------------------------------------------------
# Service: request_password_reset
# ---------------------------------------------------------------------------

class RequestResetServiceTest(TestCase):
    def setUp(self):
        self.user = make_active_user()

    @patch("forget_password.tasks.send_password_reset_email.delay")
    def test_creates_token_for_known_email(self, mock_task):
        request_password_reset(email=self.user.email)
        self.assertTrue(
            PasswordResetToken.objects.filter(user=self.user, is_used=False).exists()
        )

    @patch("forget_password.tasks.send_password_reset_email.delay")
    def test_enqueues_celery_task(self, mock_task):
        request_password_reset(email=self.user.email)
        mock_task.assert_called_once_with(self.user.pk)

    @patch("forget_password.tasks.send_password_reset_email.delay")
    def test_unknown_email_is_silent(self, mock_task):
        # Must not raise — prevents user enumeration.
        request_password_reset(email="ghost@example.com")
        mock_task.assert_not_called()

    @patch("forget_password.tasks.send_password_reset_email.delay")
    def test_inactive_user_is_silent(self, mock_task):
        self.user.is_active = False
        self.user.save()
        request_password_reset(email=self.user.email)
        mock_task.assert_not_called()

    @patch("forget_password.tasks.send_password_reset_email.delay")
    def test_old_token_deleted_on_new_request(self, mock_task):
        request_password_reset(email=self.user.email)
        first_token = PasswordResetToken.objects.filter(user=self.user).first()

        request_password_reset(email=self.user.email)
        self.assertFalse(
            PasswordResetToken.objects.filter(pk=first_token.pk).exists()
        )


# ---------------------------------------------------------------------------
# Service: confirm_password_reset
# ---------------------------------------------------------------------------

class ConfirmResetServiceTest(TestCase):
    def setUp(self):
        self.user = make_active_user()

    @patch("forget_password.tasks.send_password_reset_email.delay")
    def setUp_token(self, mock_task):
        request_password_reset(email=self.user.email)
        return PasswordResetToken.objects.filter(user=self.user).first()

    @patch("forget_password.tasks.send_password_reset_email.delay")
    def test_valid_token_changes_password(self, mock_task):
        request_password_reset(email=self.user.email)
        token = PasswordResetToken.objects.filter(user=self.user).first()

        confirm_password_reset(
            token_value  = str(token.token),
            new_password = "NewStrongPass456",
        )
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewStrongPass456"))

    @patch("forget_password.tasks.send_password_reset_email.delay")
    def test_token_marked_used_after_reset(self, mock_task):
        request_password_reset(email=self.user.email)
        token = PasswordResetToken.objects.filter(user=self.user).first()

        confirm_password_reset(
            token_value  = str(token.token),
            new_password = "NewStrongPass456",
        )
        token.refresh_from_db()
        self.assertTrue(token.is_used)

    def test_invalid_token_raises(self):
        import uuid
        with self.assertRaises(ValueError) as ctx:
            confirm_password_reset(token_value=str(uuid.uuid4()), new_password="pass1234")
        self.assertEqual(str(ctx.exception), "invalid")

    def test_expired_token_raises(self):
        token = make_expired_token(self.user)
        with self.assertRaises(ValueError) as ctx:
            confirm_password_reset(token_value=str(token.token), new_password="pass1234")
        self.assertEqual(str(ctx.exception), "expired")

    @patch("forget_password.tasks.send_password_reset_email.delay")
    def test_used_token_raises(self, mock_task):
        request_password_reset(email=self.user.email)
        token = PasswordResetToken.objects.filter(user=self.user).first()
        confirm_password_reset(token_value=str(token.token), new_password="NewPass123")

        with self.assertRaises(ValueError) as ctx:
            confirm_password_reset(token_value=str(token.token), new_password="AnotherPass123")
        self.assertEqual(str(ctx.exception), "used")


# ---------------------------------------------------------------------------
# API: PasswordResetRequestView
# ---------------------------------------------------------------------------

class RequestResetEndpointTest(APITestCase):
    URL = "/forget-password/request/"

    def setUp(self):
        self.user = make_active_user()

    @patch("forget_password.tasks.send_password_reset_email.delay")
    def test_returns_200_for_known_email(self, mock_task):
        res = self.client.post(self.URL, {"email": self.user.email}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    @patch("forget_password.tasks.send_password_reset_email.delay")
    def test_returns_200_for_unknown_email(self, mock_task):
        # Must not reveal whether email exists.
        res = self.client.post(self.URL, {"email": "ghost@example.com"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_missing_email_returns_400(self):
        res = self.client.post(self.URL, {}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_email_format_returns_400(self):
        res = self.client.post(self.URL, {"email": "not-an-email"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# API: PasswordResetConfirmView
# ---------------------------------------------------------------------------

class ConfirmResetEndpointTest(APITestCase):
    def setUp(self):
        self.user = make_active_user()

    def _url(self, token_value):
        return f"/forget-password/confirm/{token_value}/"

    def _get_token(self):
        with patch("forget_password.tasks.send_password_reset_email.delay"):
            request_password_reset(email=self.user.email)
        return PasswordResetToken.objects.filter(user=self.user).first()

    def test_valid_token_returns_200(self):
        token = self._get_token()
        res = self.client.post(
            self._url(str(token.token)),
            {"new_password": "NewPass1234", "confirm_password": "NewPass1234"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("successful", res.data["detail"].lower())

    def test_password_actually_changed(self):
        token = self._get_token()
        self.client.post(
            self._url(str(token.token)),
            {"new_password": "NewPass1234", "confirm_password": "NewPass1234"},
            format="json",
        )
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewPass1234"))

    def test_mismatched_passwords_returns_400(self):
        token = self._get_token()
        res = self.client.post(
            self._url(str(token.token)),
            {"new_password": "NewPass1234", "confirm_password": "Different5678"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_short_password_returns_400(self):
        token = self._get_token()
        res = self.client.post(
            self._url(str(token.token)),
            {"new_password": "short", "confirm_password": "short"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_token_returns_400(self):
        import uuid
        res = self.client.post(
            self._url(str(uuid.uuid4())),
            {"new_password": "NewPass1234", "confirm_password": "NewPass1234"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("invalid", res.data["detail"].lower())

    def test_expired_token_returns_400(self):
        token = make_expired_token(self.user)
        res = self.client.post(
            self._url(str(token.token)),
            {"new_password": "NewPass1234", "confirm_password": "NewPass1234"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("expired", res.data["detail"].lower())

    def test_used_token_returns_400(self):
        token = self._get_token()
        self.client.post(
            self._url(str(token.token)),
            {"new_password": "NewPass1234", "confirm_password": "NewPass1234"},
            format="json",
        )
        res = self.client.post(
            self._url(str(token.token)),
            {"new_password": "AnotherPass5678", "confirm_password": "AnotherPass5678"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already been used", res.data["detail"].lower())

    def test_missing_fields_returns_400(self):
        token = self._get_token()
        res = self.client.post(self._url(str(token.token)), {}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)