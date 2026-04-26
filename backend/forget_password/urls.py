from django.urls import path

from .views import PasswordResetConfirmView, PasswordResetRequestView

app_name = "forget_password"

urlpatterns = [
    path("request/",          PasswordResetRequestView.as_view(), name="request"),
    path("confirm/<str:token>/", PasswordResetConfirmView.as_view(), name="confirm"),
]