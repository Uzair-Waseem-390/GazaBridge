from django.urls import path

from .views import RegisterView, ResendVerificationView, VerifyEmailView

app_name = "users"

urlpatterns = [
    path("register/",             RegisterView.as_view(),             name="register"),
    path("verify-email/<str:token>/", VerifyEmailView.as_view(),      name="verify-email"),
    path("resend-verification/",  ResendVerificationView.as_view(),   name="resend-verification"),
]