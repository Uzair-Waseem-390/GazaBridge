from pathlib import Path

from dotenv import load_dotenv
import os


BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.getenv('SECRET_KEY')


DEBUG = os.getenv('DEBUG')

ALLOWED_HOSTS = []



INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]


EXTERNAL_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "users",
]

INSTALLED_APPS += EXTERNAL_APPS



AUTH_USER_MODEL = "users.User"



MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'backend.middleware.GlobalRateLimitMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

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
        'NAME': os.getenv("NAME"),    
        'USER': os.getenv("USER"),   
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
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    # "DEFAULT_RENDERER_CLASSES": [
    #     "rest_framework.renderers.JSONRenderer",
    # ],
    # "DEFAULT_PARSER_CLASSES": [
    #     "rest_framework.parsers.JSONParser",
    # ],
}


from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,     # this enable the refresh token rotation
    "BLACKLIST_AFTER_ROTATION": True,  # this enable the blacklist after rotation
    "UPDATE_LAST_LOGIN": True,         # this update the last login time
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),   # <-- This is what you need
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
}



REFRESH_TOKEN_COOKIE_NAME = 'refresh_token'
REFRESH_TOKEN_COOKIE_SAMESITE = 'Lax'
REFRESH_TOKEN_COOKIE_SECURE = True   # HTTPS only — set False in local dev
REFRESH_TOKEN_COOKIE_HTTPONLY = True  # JS cannot read this cookie





# DB 0 — Celery broker & results
# DB 1 — Default / general use for django caches 
# DB 2 — Rate limiting  ← only this one is used by GlobalRateLimitMiddleware
 
RATE_LIMIT_REDIS = {
    "HOST": "localhost",
    "PORT": 6379,
    "DB": 2,
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
 
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
    }
}





