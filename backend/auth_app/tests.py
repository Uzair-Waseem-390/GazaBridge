"""
Test suite — auth app
=====================
Covers:
  - UserActivity model
  - Selectors (token store helpers)
  - Services (login, refresh, logout, activity)
  - LoginView, RefreshView, LogoutView, MyActivityView endpoints

Run with:
    python manage.py test auth_app
"""

from datetime import timedelta
from unittest.mock import MagicMock, patch

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import Role, User

from .models import UserActivity
from .services.auth_services import (
    login_user,
    logout_user,
    refresh_token,
    update_activity_visibility,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_roles():
    for name in ["volunteer", "seeker", "manager"]:
        Role.objects.get_or_create(name=name)


def make_active_user(**kwargs) -> User:
    make_roles()
    defaults = dict(
        email      = "active@example.com",
        password   = "StrongPass123",
        first_name = "Active",
        last_name  = "User",
        country    = "Pakistan",
        gender     = "male",
        linkedin   = "https://linkedin.com/in/active",
        is_active  = True,
    )
    defaults.update(kwargs)
    password = defaults.pop("password")
    user = User(**defaults)
    user.set_password(password)
    user.save()
    role = Role.objects.get(name="volunteer")
    user.roles.add(role)
    return user


def make_inactive_user(**kwargs) -> User:
    user = make_active_user(
        email     = "inactive@example.com",
        is_active = False,
        **kwargs,
    )
    return user


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class UserActivityModelTest(TestCase):
    def setUp(self):
        self.user = make_active_user()

    def test_str(self):
        activity = UserActivity.objects.create(user=self.user)
        self.assertIn(self.user.email, str(activity))

    def test_is_visible_default_true(self):
        activity = UserActivity.objects.create(user=self.user)
        self.assertTrue(activity.is_visible)

    def test_one_to_one_constraint(self):
        UserActivity.objects.create(user=self.user)
        with self.assertRaises(Exception):
            UserActivity.objects.create(user=self.user)


# ---------------------------------------------------------------------------
# Service: login_user
# ---------------------------------------------------------------------------

class LoginServiceTest(TestCase):
    def setUp(self):
        make_roles()
        self.user = make_active_user()

    def test_valid_credentials_return_tokens(self):
        result = login_user(email="active@example.com", password="StrongPass123")
        self.assertIn("access", result)
        self.assertIn("refresh", result)
        self.assertIn("user", result)

    def test_roles_in_response(self):
        result = login_user(email="active@example.com", password="StrongPass123")
        self.assertIn("volunteer", result["user"]["roles"])

    def test_unknown_email_raises(self):
        with self.assertRaises(ValueError) as ctx:
            login_user(email="ghost@example.com", password="whatever")
        self.assertEqual(str(ctx.exception), "not_found")

    def test_wrong_password_raises(self):
        with self.assertRaises(ValueError) as ctx:
            login_user(email="active@example.com", password="WrongPass!")
        self.assertEqual(str(ctx.exception), "wrong_password")

    def test_inactive_user_raises(self):
        inactive = make_inactive_user(email="inact@example.com")
        with self.assertRaises(ValueError) as ctx:
            login_user(email="inact@example.com", password="StrongPass123")
        self.assertEqual(str(ctx.exception), "not_verified")

    def test_last_login_updated_on_success(self):
        login_user(email="active@example.com", password="StrongPass123")
        activity = UserActivity.objects.filter(user=self.user).first()
        self.assertIsNotNone(activity)
        self.assertIsNotNone(activity.last_login_at)

    def test_staff_user_gets_admin_role(self):
        self.user.is_staff = True
        self.user.save()
        result = login_user(email="active@example.com", password="StrongPass123")
        self.assertIn("admin", result["user"]["roles"])

    def test_superuser_gets_superuser_role(self):
        self.user.is_superuser = True
        self.user.is_staff     = True
        self.user.save()
        result = login_user(email="active@example.com", password="StrongPass123")
        self.assertIn("superuser", result["user"]["roles"])
        self.assertNotIn("admin", result["user"]["roles"])


# ---------------------------------------------------------------------------
# Service: refresh_token
# ---------------------------------------------------------------------------

class RefreshTokenServiceTest(TestCase):
    def setUp(self):
        make_roles()
        self.user   = make_active_user()
        self.tokens = login_user(email="active@example.com", password="StrongPass123")

    def test_valid_refresh_returns_new_tokens(self):
        result = refresh_token(old_refresh_token=self.tokens["refresh"])
        self.assertIn("access", result)
        self.assertIn("refresh", result)

    def test_new_refresh_token_differs_from_old(self):
        result = refresh_token(old_refresh_token=self.tokens["refresh"])
        self.assertNotEqual(result["refresh"], self.tokens["refresh"])

    def test_old_refresh_token_rejected_after_rotation(self):
        refresh_token(old_refresh_token=self.tokens["refresh"])
        with self.assertRaises(ValueError) as ctx:
            refresh_token(old_refresh_token=self.tokens["refresh"])
        self.assertEqual(str(ctx.exception), "invalid")

    def test_garbage_token_raises_invalid(self):
        with self.assertRaises(ValueError) as ctx:
            refresh_token(old_refresh_token="not.a.real.token")
        self.assertEqual(str(ctx.exception), "invalid")


# ---------------------------------------------------------------------------
# Service: logout_user
# ---------------------------------------------------------------------------

class LogoutServiceTest(TestCase):
    def setUp(self):
        make_roles()
        self.user   = make_active_user()
        self.tokens = login_user(email="active@example.com", password="StrongPass123")

    def test_logout_blacklists_access_token(self):
        from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
        access_obj  = AccessToken(self.tokens["access"])
        refresh_obj = RefreshToken(self.tokens["refresh"])

        logout_user(
            access_jti              = str(access_obj["jti"]),
            refresh_jti             = str(refresh_obj["jti"]),
            access_lifetime_seconds = 900,
        )

        from auth_app.selectors.auth_selectors import is_access_token_blacklisted
        self.assertTrue(is_access_token_blacklisted(str(access_obj["jti"])))

    def test_logout_invalidates_refresh_token(self):
        from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
        access_obj  = AccessToken(self.tokens["access"])
        refresh_obj = RefreshToken(self.tokens["refresh"])

        logout_user(
            access_jti              = str(access_obj["jti"]),
            refresh_jti             = str(refresh_obj["jti"]),
            access_lifetime_seconds = 900,
        )

        from auth_app.selectors.auth_selectors import is_refresh_token_valid
        self.assertFalse(is_refresh_token_valid(str(refresh_obj["jti"])))


# ---------------------------------------------------------------------------
# Service: update_activity_visibility
# ---------------------------------------------------------------------------

class ActivityVisibilityServiceTest(TestCase):
    def setUp(self):
        make_roles()
        self.user = make_active_user()

    def test_set_invisible(self):
        activity = update_activity_visibility(user=self.user, is_visible=False)
        self.assertFalse(activity.is_visible)

    def test_set_visible(self):
        update_activity_visibility(user=self.user, is_visible=False)
        activity = update_activity_visibility(user=self.user, is_visible=True)
        self.assertTrue(activity.is_visible)

    def test_idempotent(self):
        update_activity_visibility(user=self.user, is_visible=True)
        update_activity_visibility(user=self.user, is_visible=True)
        count = UserActivity.objects.filter(user=self.user).count()
        self.assertEqual(count, 1)


# ---------------------------------------------------------------------------
# API: LoginView
# ---------------------------------------------------------------------------

class LoginEndpointTest(APITestCase):
    URL = "/auth/login/"

    def setUp(self):
        make_roles()
        self.user = make_active_user()

    def _payload(self, **overrides):
        defaults = {"email": "active@example.com", "password": "StrongPass123"}
        defaults.update(overrides)
        return defaults

    def test_login_returns_200(self):
        res = self.client.post(self.URL, self._payload(), format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_login_response_shape(self):
        res = self.client.post(self.URL, self._payload(), format="json")
        for key in ["access", "refresh", "user"]:
            self.assertIn(key, res.data)
        for key in ["id", "email", "roles"]:
            self.assertIn(key, res.data["user"])

    def test_wrong_password_returns_401(self):
        res = self.client.post(self.URL, self._payload(password="wrong"), format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unknown_email_returns_401(self):
        res = self.client.post(self.URL, self._payload(email="ghost@x.com"), format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_inactive_user_returns_401(self):
        inactive = make_inactive_user(email="inact2@example.com")
        res = self.client.post(
            self.URL, {"email": "inact2@example.com", "password": "StrongPass123"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("verified", res.data["detail"].lower())

    def test_missing_fields_returns_400(self):
        res = self.client.post(self.URL, {}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# API: RefreshView
# ---------------------------------------------------------------------------

class RefreshEndpointTest(APITestCase):
    URL = "/auth/refresh/"

    def setUp(self):
        make_roles()
        self.user   = make_active_user()
        res         = self.client.post("/auth/login/", {
            "email": "active@example.com", "password": "StrongPass123"
        }, format="json")
        self.tokens = res.data

    def test_valid_refresh_returns_200(self):
        res = self.client.post(self.URL, {"refresh": self.tokens["refresh"]}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)

    def test_replay_returns_401(self):
        self.client.post(self.URL, {"refresh": self.tokens["refresh"]}, format="json")
        res = self.client.post(self.URL, {"refresh": self.tokens["refresh"]}, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_garbage_token_returns_401(self):
        res = self.client.post(self.URL, {"refresh": "garbage"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# API: LogoutView
# ---------------------------------------------------------------------------

class LogoutEndpointTest(APITestCase):
    URL = "/auth/logout/"

    def setUp(self):
        make_roles()
        self.user   = make_active_user()
        res         = self.client.post("/auth/login/", {
            "email": "active@example.com", "password": "StrongPass123"
        }, format="json")
        self.tokens = res.data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}")

    def test_logout_returns_200(self):
        res = self.client.post(self.URL, {"refresh": self.tokens["refresh"]}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_access_token_rejected_after_logout(self):
        self.client.post(self.URL, {"refresh": self.tokens["refresh"]}, format="json")
        res = self.client.get("/auth/activity/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_logout_returns_401(self):
        self.client.credentials()
        res = self.client.post(self.URL, {"refresh": self.tokens["refresh"]}, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# API: MyActivityView
# ---------------------------------------------------------------------------

class ActivityEndpointTest(APITestCase):
    URL = "/auth/activity/"

    def setUp(self):
        make_roles()
        self.user = make_active_user()
        res = self.client.post("/auth/login/", {
            "email": "active@example.com", "password": "StrongPass123"
        }, format="json")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")

    def test_get_activity_returns_200(self):
        res = self.client.get(self.URL)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("is_visible", res.data)
        self.assertIn("last_login_at", res.data)

    def test_patch_visibility_to_false(self):
        res = self.client.patch(self.URL, {"is_visible": False}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data["is_visible"])

    def test_patch_visibility_back_to_true(self):
        self.client.patch(self.URL, {"is_visible": False}, format="json")
        res = self.client.patch(self.URL, {"is_visible": True}, format="json")
        self.assertTrue(res.data["is_visible"])

    def test_unauthenticated_returns_401(self):
        self.client.credentials()
        res = self.client.get(self.URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_put_returns_405(self):
        res = self.client.put(self.URL, {"is_visible": False}, format="json")
        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)