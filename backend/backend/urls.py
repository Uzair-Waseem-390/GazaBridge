from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def root(request):
    return Response({"message": "Hello Uzair, This is root url of GazeBridge API"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', root, name="Uzair"),

    # Apps urls
    path("users/",  include("users.urls", namespace="users")),
    path("auth/",   include("auth_app.urls", namespace="auth_app")),
    path("forget-password/", include("forget_password.urls", namespace="forget_password")),
]
