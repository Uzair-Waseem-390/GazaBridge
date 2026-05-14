"""
ASGI config for backend project.
"""

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()

# These imports must come AFTER get_asgi_application() — that call sets up
# the app registry, so any module that touches Django models is safe after it.
from channels.routing import ProtocolTypeRouter, URLRouter
from backend.ws_auth import JWTAuthMiddleware
from chat.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})














# """
# ASGI config for backend project.
# """

# import os

# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from channels.security.websocket import AllowedHostsOriginValidator

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# django_asgi_app = get_asgi_application()

# from chat.routing import websocket_urlpatterns

# application = ProtocolTypeRouter({
#     "http": django_asgi_app,
#     "websocket": AllowedHostsOriginValidator(
#         AuthMiddlewareStack(
#             URLRouter(websocket_urlpatterns)
#         )
#     ),
# })