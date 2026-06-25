from pathlib import Path

from dotenv import load_dotenv
import os
import urllib.parse


# daphne backend.asgi:application
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env.production')

REDIS_URL = os.getenv("REDIS_URL")

SECRET_KEY = os.getenv('SECRET_KEY')

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

DEBUG = os.getenv("DEBUG").lower() == "true"

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS").split(",")



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




REST_FRAMEWORK = {
    # Authentication
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "auth_app.backends.BlacklistAwareJWTAuthentication",
    ),

    # Protect everything by default
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),

    # OpenAPI docs
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",

    # Built-in DRF throttling
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ),

    "DEFAULT_THROTTLE_RATES": {
        "anon": "20/min",
        "user": "100/min",
    },
}


from datetime import timedelta

# =============================================================================
# SIMPLE JWT
# =============================================================================
 
SIMPLE_JWT = {
    # Token lifetimes
    "ACCESS_TOKEN_LIFETIME":  timedelta(minutes=15),
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
 

# Add your load balancer / Nginx / Gunicorn proxy IPs here.
# Leave as an empty set if you are running without a proxy (e.g. local dev).
 
RATE_LIMIT_TRUSTED_PROXIES = {
    "127.0.0.1",   # example: internal load balancer    
}

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

import ssl
import platform
# Add SSL configuration for Celery
CELERY_BROKER_USE_SSL = {
    'ssl_cert_reqs': ssl.CERT_REQUIRED  # or ssl.CERT_NONE for testing
}
CELERY_REDIS_BACKEND_USE_SSL = {
    'ssl_cert_reqs': ssl.CERT_REQUIRED  # or ssl.CERT_NONE for testing
}
 
CELERY_BROKER_URL         = f"{REDIS_URL}/0"
CELERY_RESULT_BACKEND     = f"{REDIS_URL}/0"
# CELERY_WORKER_POOL        = "solo"
if platform.system() == "Windows":
    CELERY_WORKER_POOL = "solo"
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

 
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")


FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")


# =============================================================================
# CORS — allow the Vite dev server to call the Django API
# =============================================================================

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOWED_ORIGINS").split(",")
    if origin.strip()
]

# Allow the Authorization header so JWT tokens can be sent
CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "x-csrftoken",
]


CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")
    if origin.strip()
]


# =============================================================================
# GOOGLE CLIENT
# =============================================================================

GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI  = os.getenv("GOOGLE_REDIRECT_URI")



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