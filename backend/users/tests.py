"""
Test suite for the users app (v2 — with email verification)
============================================================
Covers:
  - Updated User model (new fields)
  - EmailVerificationToken model
  - Selectors (token lookups)
  - Services (register_user, verify_email, resend_verification_email)
  - RegisterView endpoint
  - VerifyEmailView endpoint
  - ResendVerificationView endpoint

Run with:
    python manage.py test users
"""

from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import EmailVerificationToken, GenderChoices, Role, User
from .selectors import get_token_by_value, get_user_by_email
from .services import assign_manager_role, register_user, resend_verification_email, verify_email


# ---------------------------------------------------------------------------
# Shared test helpers
# ---------------------------------------------------------------------------

def make_roles():
    for name in ["volunteer", "seeker", "manager"]:
        Role.objects.get_or_create(name=name)


def make_user(**kwargs) -> User:
    make_roles()
    defaults = dict(
        email      = "test@example.com",
        password   = "StrongPass123",
        first_name = "Test",
        last_name  = "User",
        country    = "Pakistan",
        gender     = "male",
        linkedin   = "https://linkedin.com/in/test",
        roles      = ["volunteer"],
    )
    defaults.update(kwargs)
    return register_user(**defaults)


def make_expired_token(user: User) -> EmailVerificationToken:
    """Create an already-expired token for testing."""
    EmailVerificationToken.objects.filter(user=user, is_used=False).delete()
    token = EmailVerificationToken.objects.create(
        user       = user,
        expires_at = timezone.now() - timedelta(hours=1),
    )
    return token


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class UserModelTest(TestCase):
    def setUp(self):
        make_roles()

    def test_new_user_is_inactive_by_default(self):
        user = User.objects.create_user(
            email="u@example.com", password="pass1234",
            first_name="A", last_name="B",
            country="PK", gender="male",
            linkedin="https://linkedin.com/in/a",
        )
        self.assertFalse(user.is_active)

    def test_superuser_is_active_by_default(self):
        su = User.objects.create_superuser(
            email="su@example.com", password="pass1234",
            first_name="S", last_name="U",
            country="PK", gender="male",
            linkedin="https://linkedin.com/in/su",
        )
        self.assertTrue(su.is_active)

    def test_gender_choices(self):
        user = User(gender=GenderChoices.FEMALE)
        self.assertEqual(user.gender, "female")

    def test_language_list_property(self):
        user = User(languages="en,ur,fr")
        self.assertEqual(user.language_list, ["en", "ur", "fr"])

    def test_language_list_empty(self):
        self.assertEqual(User(languages="").language_list, [])


class EmailVerificationTokenModelTest(TestCase):
    def setUp(self):
        make_roles()
        self.user = make_user()

    def test_token_is_valid_when_fresh(self):
        token = EmailVerificationToken.objects.filter(user=self.user).first()
        self.assertTrue(token.is_valid())

    def test_token_invalid_when_expired(self):
        token = make_expired_token(self.user)
        self.assertFalse(token.is_valid())

    def test_token_invalid_when_used(self):
        token = EmailVerificationToken.objects.filter(user=self.user).first()
        token.is_used = True
        token.save()
        self.assertFalse(token.is_valid())


# ---------------------------------------------------------------------------
# Selector tests
# ---------------------------------------------------------------------------

class TokenSelectorTest(TestCase):
    def setUp(self):
        make_roles()
        self.user = make_user()
        self.token = EmailVerificationToken.objects.filter(user=self.user).first()

    def test_get_token_by_value_found(self):
        result = get_token_by_value(str(self.token.token))
        self.assertIsNotNone(result)
        self.assertEqual(result.pk, self.token.pk)

    def test_get_token_by_value_not_found(self):
        import uuid
        self.assertIsNone(get_token_by_value(str(uuid.uuid4())))

    def test_get_token_by_value_malformed(self):
        self.assertIsNone(get_token_by_value("not-a-uuid"))


# ---------------------------------------------------------------------------
# Service: register_user
# ---------------------------------------------------------------------------

class RegisterUserServiceTest(TestCase):
    def setUp(self):
        make_roles()

    def _reg(self, **overrides):
        defaults = dict(
            email      = "new@example.com",
            password   = "StrongPass123",
            first_name = "Jane",
            last_name  = "Doe",
            country    = "Pakistan",
            gender     = "female",
            linkedin   = "https://linkedin.com/in/jane",
            roles      = ["volunteer"],
        )
        defaults.update(overrides)
        return register_user(**defaults)

    @patch("users.tasks.send_verification_email.delay")
    def test_user_created_inactive(self, mock_task):
        user = self._reg()
        self.assertFalse(user.is_active)

    @patch("users.tasks.send_verification_email.delay")
    def test_verification_token_created(self, mock_task):
        user = self._reg()
        self.assertTrue(
            EmailVerificationToken.objects.filter(user=user, is_used=False).exists()
        )

    @patch("users.tasks.send_verification_email.delay")
    def test_celery_task_enqueued(self, mock_task):
        user = self._reg()
        mock_task.assert_called_once_with(user.pk)

    @patch("users.tasks.send_verification_email.delay")
    def test_duplicate_email_raises(self, mock_task):
        self._reg()
        with self.assertRaises(ValueError) as ctx:
            self._reg()
        self.assertIn("already exists", str(ctx.exception))

    @patch("users.tasks.send_verification_email.delay")
    def test_new_fields_stored(self, mock_task):
        user = self._reg(
            gender="female",
            linkedin="https://linkedin.com/in/jane",
            whatsapp_number="+923001234567",
        )
        self.assertEqual(user.gender, "female")
        self.assertEqual(user.linkedin, "https://linkedin.com/in/jane")
        self.assertEqual(user.whatsapp_number, "+923001234567")

    @patch("users.tasks.send_verification_email.delay")
    def test_whatsapp_optional(self, mock_task):
        user = self._reg()
        self.assertEqual(user.whatsapp_number, "")


# ---------------------------------------------------------------------------
# Service: verify_email
# ---------------------------------------------------------------------------

class VerifyEmailServiceTest(TestCase):
    def setUp(self):
        make_roles()
        with patch("users.tasks.send_verification_email.delay"):
            self.user  = make_user()
        self.token = EmailVerificationToken.objects.filter(user=self.user).first()

    def test_valid_token_activates_user(self):
        verify_email(token_value=str(self.token.token))
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)

    def test_valid_token_marked_used(self):
        verify_email(token_value=str(self.token.token))
        self.token.refresh_from_db()
        self.assertTrue(self.token.is_used)

    def test_invalid_token_raises(self):
        import uuid
        with self.assertRaises(ValueError) as ctx:
            verify_email(token_value=str(uuid.uuid4()))
        self.assertEqual(str(ctx.exception), "invalid")

    def test_expired_token_raises(self):
        expired = make_expired_token(self.user)
        with self.assertRaises(ValueError) as ctx:
            verify_email(token_value=str(expired.token))
        self.assertEqual(str(ctx.exception), "expired")

    def test_used_token_raises(self):
        verify_email(token_value=str(self.token.token))
        with self.assertRaises(ValueError) as ctx:
            verify_email(token_value=str(self.token.token))
        self.assertEqual(str(ctx.exception), "used")

    def test_malformed_token_raises_invalid(self):
        with self.assertRaises(ValueError) as ctx:
            verify_email(token_value="not-a-real-token")
        self.assertEqual(str(ctx.exception), "invalid")


# ---------------------------------------------------------------------------
# Service: resend_verification_email
# ---------------------------------------------------------------------------

class ResendVerificationServiceTest(TestCase):
    def setUp(self):
        make_roles()
        with patch("users.tasks.send_verification_email.delay"):
            self.user = make_user()

    @patch("users.tasks.send_verification_email.delay")
    def test_resend_creates_new_token(self, mock_task):
        old_token = EmailVerificationToken.objects.filter(user=self.user).first()
        resend_verification_email(email=self.user.email)
        new_token = EmailVerificationToken.objects.filter(
            user=self.user, is_used=False
        ).order_by("-created_at").first()
        self.assertNotEqual(old_token.token, new_token.token)

    @patch("users.tasks.send_verification_email.delay")
    def test_resend_enqueues_task(self, mock_task):
        resend_verification_email(email=self.user.email)
        mock_task.assert_called_once_with(self.user.pk)

    @patch("users.tasks.send_verification_email.delay")
    def test_resend_unknown_email_is_silent(self, mock_task):
        # Must not raise — prevents user enumeration.
        resend_verification_email(email="nobody@example.com")
        mock_task.assert_not_called()

    @patch("users.tasks.send_verification_email.delay")
    def test_resend_already_active_is_silent(self, mock_task):
        self.user.is_active = True
        self.user.save()
        resend_verification_email(email=self.user.email)
        mock_task.assert_not_called()


# ---------------------------------------------------------------------------
# API: RegisterView
# ---------------------------------------------------------------------------

class RegisterEndpointTest(APITestCase):
    URL = "/users/register/"

    def setUp(self):
        make_roles()

    def _payload(self, **overrides):
        defaults = {
            "email":      "api@example.com",
            "password":   "StrongPass123",
            "first_name": "API",
            "last_name":  "User",
            "country":    "Pakistan",
            "gender":     "male",
            "linkedin":   "https://linkedin.com/in/api",
            "roles":      ["volunteer"],
        }
        defaults.update(overrides)
        return defaults

    @patch("users.tasks.send_verification_email.delay")
    def test_register_returns_201(self, mock_task):
        res = self.client.post(self.URL, self._payload(), format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    @patch("users.tasks.send_verification_email.delay")
    def test_response_contains_message(self, mock_task):
        res = self.client.post(self.URL, self._payload(), format="json")
        self.assertIn("message", res.data)
        self.assertIn("verify", res.data["message"].lower())

    @patch("users.tasks.send_verification_email.delay")
    def test_response_shape(self, mock_task):
        res = self.client.post(self.URL, self._payload(), format="json")
        for field in ["id", "email", "first_name", "last_name", "country",
                      "gender", "linkedin", "languages", "roles"]:
            self.assertIn(field, res.data)

    @patch("users.tasks.send_verification_email.delay")
    def test_password_not_in_response(self, mock_task):
        res = self.client.post(self.URL, self._payload(), format="json")
        self.assertNotIn("password", res.data)

    @patch("users.tasks.send_verification_email.delay")
    def test_missing_gender_returns_400(self, mock_task):
        payload = self._payload()
        del payload["gender"]
        res = self.client.post(self.URL, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("users.tasks.send_verification_email.delay")
    def test_invalid_gender_returns_400(self, mock_task):
        res = self.client.post(self.URL, self._payload(gender="other"), format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("users.tasks.send_verification_email.delay")
    def test_missing_linkedin_returns_400(self, mock_task):
        payload = self._payload()
        del payload["linkedin"]
        res = self.client.post(self.URL, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("users.tasks.send_verification_email.delay")
    def test_invalid_linkedin_url_returns_400(self, mock_task):
        res = self.client.post(self.URL, self._payload(linkedin="not-a-url"), format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_email_returns_400(self):
        with patch("users.tasks.send_verification_email.delay"):
            self.client.post(self.URL, self._payload(), format="json")
        with patch("users.tasks.send_verification_email.delay"):
            res = self.client.post(self.URL, self._payload(), format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already exists", res.data["detail"])


# ---------------------------------------------------------------------------
# API: VerifyEmailView
# ---------------------------------------------------------------------------

class VerifyEmailEndpointTest(APITestCase):
    def setUp(self):
        make_roles()
        with patch("users.tasks.send_verification_email.delay"):
            self.user  = make_user()
        self.token = EmailVerificationToken.objects.filter(user=self.user).first()

    def _url(self, token_value):
        return f"/users/verify-email/{token_value}/"

    def test_valid_token_returns_200(self):
        res = self.client.get(self._url(str(self.token.token)))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("verified", res.data["detail"].lower())

    def test_valid_token_activates_user(self):
        self.client.get(self._url(str(self.token.token)))
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)

    def test_invalid_token_returns_400(self):
        import uuid
        res = self.client.get(self._url(str(uuid.uuid4())))
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("invalid", res.data["detail"].lower())

    def test_expired_token_returns_400(self):
        expired = make_expired_token(self.user)
        res = self.client.get(self._url(str(expired.token)))
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("expired", res.data["detail"].lower())

    def test_used_token_returns_400(self):
        self.client.get(self._url(str(self.token.token)))  # first use
        res = self.client.get(self._url(str(self.token.token)))  # replay
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already been used", res.data["detail"].lower())


# ---------------------------------------------------------------------------
# API: ResendVerificationView
# ---------------------------------------------------------------------------

class ResendVerificationEndpointTest(APITestCase):
    URL = "/users/resend-verification/"

    def setUp(self):
        make_roles()
        with patch("users.tasks.send_verification_email.delay"):
            self.user = make_user()

    @patch("users.tasks.send_verification_email.delay")
    def test_returns_200_for_known_unverified_email(self, mock_task):
        res = self.client.post(self.URL, {"email": self.user.email}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    @patch("users.tasks.send_verification_email.delay")
    def test_returns_200_for_unknown_email(self, mock_task):
        # Must not reveal whether email exists.
        res = self.client.post(self.URL, {"email": "ghost@example.com"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    @patch("users.tasks.send_verification_email.delay")
    def test_returns_200_for_already_active_user(self, mock_task):
        self.user.is_active = True
        self.user.save()
        res = self.client.post(self.URL, {"email": self.user.email}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        mock_task.assert_not_called()

    def test_missing_email_returns_400(self):
        res = self.client.post(self.URL, {}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)