from django.urls import path

from .views import (
    RegisterView, ResendVerificationView, VerifyEmailView,
    UserDetailView, UserListView, ChangePasswordView,
    PromoteToManagerView, DemoteFromManagerView, CurrentUserView,
    CreateSuperuserView
)

app_name = "users"

urlpatterns = [
    # Registration & verification
    path("register/", RegisterView.as_view(), name="register"),
    path("create-superuser/", CreateSuperuserView.as_view(), name="create-superuser"),
    path("verify-email/<str:token>/", VerifyEmailView.as_view(), name="verify-email"),
    path("resend-verification/", ResendVerificationView.as_view(), name="resend-verification"),
    
    # User profile management
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("change-password/<int:pk>/", ChangePasswordView.as_view(), name="change-password"),
    
    # User listing (Search for chat / Admin lists)
    path("", UserListView.as_view(), name="user-list"),
    
    # Role management (admin only)
    path("promote-to-manager/", PromoteToManagerView.as_view(), name="promote-to-manager"),
    path("demote-from-manager/", DemoteFromManagerView.as_view(), name="demote-from-manager"),
]