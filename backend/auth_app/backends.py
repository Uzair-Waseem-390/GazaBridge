"""
Authentication backend
======================
Extends SimpleJWT's default authentication to check the Redis
blacklist on every request. If the access token JTI has been
blacklisted (logout), the request is rejected with 401.
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class BlacklistAwareJWTAuthentication(JWTAuthentication):
    """
    Drop-in replacement for JWTAuthentication.

    After SimpleJWT validates the token signature and expiry, we do
    one extra Redis lookup to confirm the JTI hasn't been blacklisted
    by a prior logout. The check is fast (single GET) and fails closed
    (treats Redis errors as blacklisted).
    """

    def get_validated_token(self, raw_token):
        # Let SimpleJWT do its standard validation first.
        validated = super().get_validated_token(raw_token)

        jti = str(validated.get("jti", ""))
        if not jti:
            raise InvalidToken("Token has no JTI claim.")

        from auth_app.selectors.auth_selectors import is_access_token_blacklisted
        if is_access_token_blacklisted(jti):
            raise InvalidToken("Token has been invalidated. Please log in again.")

        return validated