from django.urls import path
from resources.views import ResourceCreateView, ResourceDetailView, ResourceListView

app_name = "resources"

urlpatterns = [
    path("create/", ResourceCreateView.as_view(), name="resource-create"),
    path("<int:pk>/", ResourceDetailView.as_view(), name="resource-detail"),
    path("", ResourceListView.as_view(), name="resource-list"),
]