import logging
import uuid

import requests
from django.conf import settings
from django.core.cache import cache

from auth_app.selectors.auth_selectors import get_user_by_email
from auth_app.services.auth_services import _build_token_pair, _update_last_login
from users.services.user_services import register_oauth_user

logger = logging.getLogger(__name__)


def exchange_code_for_tokens(code: str, redirect_uri: str) -> str:
    """
    Exchange the authorization code for a Google access token.

    Args:
        code:         The authorization code received from Google via the frontend.
        redirect_uri: The exact redirect URI the frontend used when initiating the
                      OAuth flow. Google validates this matches what was registered.
    """
    token_endpoint = "https://oauth2.googleapis.com/token"

    payload = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }

    # Initialise to None so the except block can safely reference it even if
    # requests.post() raises before a response is received (e.g. DNS failure).
    response = None
    try:
        response = requests.post(token_endpoint, data=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data["access_token"]
    except requests.RequestException as exc:
        logger.warning("Google token exchange failed: %s", exc)
        if response is not None:
            logger.warning("Google response body: %s", response.text)
        raise ValueError("google_exchange_failed")


def get_google_user_info(access_token: str) -> dict:
    """
    Fetch user profile info using the Google access token.
    """
    userinfo_endpoint = "https://www.googleapis.com/oauth2/v2/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}

    try:
        response = requests.get(userinfo_endpoint, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as exc:
        logger.error("Google userinfo fetch failed: %s", exc)
        raise ValueError("google_userinfo_failed")


def google_login(*, code: str, redirect_uri: str) -> dict:
    """
    Step 1: Process the Google OAuth code.

    The frontend sends both the authorization ``code`` and the ``redirect_uri``
    it used when opening the Google consent screen.  We forward that same
    redirect_uri to Google during the code-exchange — Google validates that the
    two values match exactly.

    Returns:
        Existing user  → full JWT token pair  + ``is_new_user: False``
        New user       → ``registration_token`` + ``is_new_user: True``
    """
    access_token = exchange_code_for_tokens(code, redirect_uri)
    user_info = get_google_user_info(access_token)

    email = user_info.get("email")
    verified = user_info.get("verified_email")

    if not email or not verified:
        raise ValueError("unverified_google_email")

    user = get_user_by_email(email)

    if user:
        if not user.is_active:
            raise ValueError("not_verified")
            
        _update_last_login(user)
        payload = _build_token_pair(user)
        payload["is_new_user"] = False
        return payload
    else:
        # User doesn't exist, store state in Redis instead of JWT
        registration_token = str(uuid.uuid4())
        cache_key = f"google_registration:{registration_token}"
        cache_data = {
            "email": email,
            "first_name": user_info.get("given_name", ""),
            "last_name": user_info.get("family_name", "")
        }
        
        # Store in Redis for 30 minutes
        cache.set(cache_key, cache_data, timeout=1800)
        
        return {
            "is_new_user": True,
            "registration_token": registration_token,
            "message": "User does not exist. Please complete registration.",
            "user": {
                "email": email,
                "first_name": cache_data["first_name"],
                "last_name": cache_data["last_name"]
            }
        }


def complete_google_registration(*, registration_token: str, **profile_data) -> dict:
    """
    Step 2: Use the temporary registration token from Redis + profile data to create the user.
    """
    cache_key = f"google_registration:{registration_token}"
    cache_data = cache.get(cache_key)
    
    if not cache_data:
        raise ValueError("invalid_registration_token")
        
    email = cache_data["email"]
    first_name = cache_data.get("first_name", "")
    last_name = cache_data.get("last_name", "")
    
    try:
        # Delegate to user service
        user = register_oauth_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            **profile_data
        )
        
        # Prevent reuse of the registration token to ensure consistency
        cache.delete(cache_key)
        
    except ValueError as exc:
        if "already exists" in str(exc):
            # Edge case: User was created between Step 1 and Step 2.
            cache.delete(cache_key)
            raise ValueError("Account was created concurrently. Please log in again.")
        raise exc
    
    _update_last_login(user)
    payload = _build_token_pair(user)
    payload["is_new_user"] = False
    return payload
