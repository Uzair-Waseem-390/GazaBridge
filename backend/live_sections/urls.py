from django.urls import path
from live_sections.views import (
    LiveSectionCreateView, LiveSectionDetailView, LiveSectionListView,
    ContentCreateView, ContentDetailView,
    LinkLiveSectionToOfferView, UnlinkLiveSectionFromOfferView
)

app_name = "live_sections"

urlpatterns = [
    path("create/", LiveSectionCreateView.as_view(), name="ls-create"),
    path("<int:pk>/", LiveSectionDetailView.as_view(), name="ls-detail"),
    path("", LiveSectionListView.as_view(), name="ls-list"),
    path("<int:ls_id>/contents/create/", ContentCreateView.as_view(), name="content-create"),
    path("contents/<int:pk>/", ContentDetailView.as_view(), name="content-detail"),
    path("<int:ls_id>/link/<int:offer_id>/", LinkLiveSectionToOfferView.as_view(), name="link-offer"),
    path("<int:ls_id>/unlink/<int:offer_id>/", UnlinkLiveSectionFromOfferView.as_view(), name="unlink-offer"),
]