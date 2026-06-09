from pathlib import Path

from dotenv import load_dotenv
import os
import urllib.parse
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# daphne backend.asgi:application
# daphne backend.asgi:application
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.getenv('SECRET_KEY')

backend_production_url = os.getenv('BACKEND_PRODUCTION_URL')

DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# Auto-add the Render production hostname so the admin panel and API work on deployment
if backend_production_url:
    _prod_host = urllib.parse.urlparse(backend_production_url).hostname
    if _prod_host and _prod_host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(_prod_host)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]


EXTERNAL_APPS = [
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    # "rest_framework_simplejwt.token_blacklist",
    "users",
    "auth_app",
    "forget_password",
    "posts",
    "courses",
    "live_sections",
    "resources",
    "admin_app",
    "drf_spectacular",
    "notifications",
    "channels",
    "chat",
]

INSTALLED_APPS += EXTERNAL_APPS



AUTH_USER_MODEL = "users.User"

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",   # <-- by me
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',          # ← must be before CommonMiddleware
    # 'backend.middleware.GlobalRateLimitMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


DATABASES = {
    'default': {
        'ENGINE': os.getenv('ENGINE'),
        'NAME': os.getenv("DB_NAME"),    
        'USER': os.getenv("DB_USER"),   
        'PASSWORD': os.getenv("PASSWORD"),    
        'HOST': os.getenv("HOST"),      
        'PORT': os.getenv("PORT")       
    }
}



AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]




LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True



STATIC_URL = 'static/'



REST_FRAMEWORK = {
    # Default to 403 for unauthenticated requests on protected endpoints.
    # RegisterView overrides this with AllowAny explicitly.
    'DEFAULT_AUTHENTICATION_CLASSES': (
        # 'rest_framework_simplejwt.authentication.JWTAuthentication',
        "auth_app.backends.BlacklistAwareJWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    # "DEFAULT_RENDERER_CLASSES": [
    #     "rest_framework.renderers.JSONRenderer",
    # ],
    # "DEFAULT_PARSER_CLASSES": [
    #     "rest_framework.parsers.JSONParser",
    # ],
}


from datetime import timedelta

# =============================================================================
# SIMPLE JWT
# =============================================================================
 
SIMPLE_JWT = {
    # Token lifetimes
    # "ACCESS_TOKEN_LIFETIME":  timedelta(minutes=15),
    "ACCESS_TOKEN_LIFETIME":  timedelta(days=3),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
 
    # We handle rotation manually in RefreshView — disable SimpleJWT's built-in
    # rotation so it doesn't interfere with our Redis-based one-time-use logic.
    "ROTATE_REFRESH_TOKENS":   False,
    "BLACKLIST_AFTER_ROTATION": False,
 
    # Signing
    "ALGORITHM":               "HS256",
    "SIGNING_KEY":             SECRET_KEY,  # noqa: F821 — injected by Django settings
 
    # Header format: Authorization: Bearer <token>
    "AUTH_HEADER_TYPES":       ("Bearer",),
 
    # Extra claims we embed manually in services.py
    "USER_ID_FIELD":           "id",
    "USER_ID_CLAIM":           "user_id",
 
    # Token classes
    "AUTH_TOKEN_CLASSES":      ("rest_framework_simplejwt.tokens.AccessToken",),
}
 


# REFRESH_TOKEN_COOKIE_NAME = 'refresh_token'
# REFRESH_TOKEN_COOKIE_SAMESITE = 'Lax'
# REFRESH_TOKEN_COOKIE_SECURE = True   # HTTPS only — set False in local dev
# REFRESH_TOKEN_COOKIE_HTTPONLY = True  # JS cannot read this cookie





# DB 0 — Celery broker & results
# DB 1 — Default / general use for django caches 
# DB 2 — Rate limiting  ← only this one is used by GlobalRateLimitMiddleware
 
_redis_parsed = urllib.parse.urlparse(REDIS_URL)
RATE_LIMIT_REDIS = {
    "HOST": _redis_parsed.hostname or "localhost",
    "PORT": _redis_parsed.port or 6379,
    "PASSWORD": _redis_parsed.password or None,
    "DB": 0,
    # How long (seconds) to wait when connecting to Redis.
    # Keep this low so a Redis outage doesn't stall your requests.
    "SOCKET_CONNECT_TIMEOUT": 1,
    "SOCKET_TIMEOUT": 1,
}
 
# =============================================================================
# RATE LIMIT TIERS
# =============================================================================
# LIMIT  — max requests allowed inside the sliding window
# WINDOW — window size in seconds
 
RATE_LIMIT = {
    "AUTHENTICATED": {
        "LIMIT": 100,
        "WINDOW": 60,   # 100 requests per minute per user ID
    },
    "ANONYMOUS": {
        "LIMIT": 20,
        "WINDOW": 60,   # 20 requests per minute per IP
    },
}
 
# =============================================================================
# TRUSTED PROXIES
# =============================================================================
# IPs listed here are treated as reverse proxies.
# When the direct connection comes from one of these IPs, the middleware will
# read the real client IP from the X-Forwarded-For header instead of
# REMOTE_ADDR, preventing IP spoofing by untrusted clients.
#
# Add your load balancer / Nginx / Gunicorn proxy IPs here.
# Leave as an empty set if you are running without a proxy (e.g. local dev).
 
RATE_LIMIT_TRUSTED_PROXIES = {
    "127.0.0.1",   # example: internal load balancer    
}


# =============================================================================
# CACHES — DB 1 for Django cache (separate from rate limiting)
# =============================================================================
 
# CACHES = {
#     "default": {
#         "BACKEND": "django.core.cache.backends.redis.RedisCache",
#         "LOCATION": "redis://127.0.0.1:6379/1",
#     }
# }

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': f'{REDIS_URL}/0',
        'TIMEOUT': 300,
        'OPTIONS': {
            'db': 1,
            'socket_connect_timeout': 1,
            'socket_timeout': 1,
            'retry_on_timeout': True,
        },
        'KEY_PREFIX': 'django_cache',
    }
}

# celery
# celery -A backend worker -l info
# =============================================================================
# CELERY — DB 0 for broker & results
# =============================================================================

# import ssl
# # Add SSL configuration for Celery
# CELERY_BROKER_USE_SSL = {
#     'ssl_cert_reqs': ssl.CERT_REQUIRED  # or ssl.CERT_NONE for testing
# }
# CELERY_REDIS_BACKEND_USE_SSL = {
#     'ssl_cert_reqs': ssl.CERT_REQUIRED  # or ssl.CERT_NONE for testing
# }
 
CELERY_BROKER_URL         = f"{REDIS_URL}/0"
CELERY_RESULT_BACKEND     = f"{REDIS_URL}/0"
CELERY_WORKER_POOL        = "solo"
CELERY_ACCEPT_CONTENT     = ["application/json"]
CELERY_RESULT_SERIALIZER  = "json"
CELERY_TASK_SERIALIZER    = "json"
CELERY_TIMEZONE           = "Asia/Karachi"
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT    = 30 * 60   # 30 minutes
CELERY_RESULT_EXPIRES     = 86400     # 1 day
CELERY_WORKER_POOL_RESTARTS = True




# =============================================================================
# EMAIL
# =============================================================================
 
EMAIL_BACKEND       = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST          = "smtp.gmail.com"
EMAIL_PORT          = 587
EMAIL_USE_TLS       = True
EMAIL_HOST_USER     = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")


# =============================================================================
# BACKEND BASE URL
# Used by the email task to build the verification link.
# Override per environment via .env — no trailing slash needed.
# =============================================================================
 
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")

# =============================================================================
# FRONTEND BASE URL
# Used to build links in emails (verify email, password reset) that the user
# clicks in their browser — these must point to the React app, not the API.
# =============================================================================

FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")


# =============================================================================
# CORS — allow the Vite dev server to call the Django API
# =============================================================================

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://gazabridgex.netlify.app",
]
_frontend_url = os.getenv("FRONTEND_URL")
if _frontend_url:
    CORS_ALLOWED_ORIGINS.append(_frontend_url)

# Allow the Authorization header so JWT tokens can be sent
CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "x-csrftoken",
]


# =============================================================================
# GOOGLE CLIENT
# =============================================================================

GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
# No hardcoded default — the frontend always sends its own redirect_uri in the
# request body, so this setting is no longer used by the backend directly.
# It is kept here only as documentation / fallback reference.
GOOGLE_REDIRECT_URI  = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5173/auth/google/callback")



# =============================================================================
# CHANNELS (WebSocket)
# =============================================================================

ASGI_APPLICATION = "backend.asgi.application"

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [f"{REDIS_URL}/0"],
            "capacity": 1500,
            "expiry": 10,
        },
    },
}