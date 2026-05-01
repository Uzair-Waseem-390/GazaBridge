from django.urls import path
from admin_app.views import (
    UserStatsView,
    VolunteerListView, SeekerListView, BothListView,
    ManagerListView, AdminListView, InactiveUserListView
)

app_name = "admin_app"

urlpatterns = [
    path("users/stats/", UserStatsView.as_view(), name="user-stats"),
    path("users/volunteers/", VolunteerListView.as_view(), name="volunteer-list"),
    path("users/seekers/", SeekerListView.as_view(), name="seeker-list"),
    path("users/both/", BothListView.as_view(), name="both-list"),
    path("users/managers/", ManagerListView.as_view(), name="manager-list"),
    path("users/admins/", AdminListView.as_view(), name="admin-list"),
    path("users/inactive/", InactiveUserListView.as_view(), name="inactive-list"),
]