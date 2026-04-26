from django.urls import path

from .views import LoginView, LogoutView, MyActivityView, RefreshView

app_name = "auth_app"

urlpatterns = [
    path("login/",    LoginView.as_view(),      name="login"),
    path("refresh/",  RefreshView.as_view(),    name="refresh"),
    path("logout/",   LogoutView.as_view(),     name="logout"),
    path("activity/", MyActivityView.as_view(), name="activity"),
]