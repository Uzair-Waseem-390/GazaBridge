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
    path('', root, name="root"),
]
