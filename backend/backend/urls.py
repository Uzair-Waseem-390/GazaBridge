from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


@api_view(['GET'])
@permission_classes([AllowAny])
def root(request):
    return Response({"message": "Hello Uzair, This is root url of GazeBridge API"})

urlpatterns = [
    path('thisis/admin/', admin.site.urls),
    path('', root, name="Uzair"),

    # swagger docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema')),

    # Apps urls
    path("users/",  include("users.urls", namespace="users")),
    path("auth/",   include("auth_app.urls", namespace="auth_app")),
    path("forget-password/", include("forget_password.urls", namespace="forget_password")),
    path("posts/", include("posts.urls", namespace="posts")),
    path("courses/", include("courses.urls", namespace="courses")),
    path("live-sections/", include("live_sections.urls", namespace="live_sections")),
    path("resources/", include("resources.urls", namespace="resources")),
    path("admin/", include("admin_app.urls", namespace="admin_app")),
    path("notifications/", include("notifications.urls", namespace="notifications")),
    path("chat/", include("chat.urls", namespace="chat")),
]
