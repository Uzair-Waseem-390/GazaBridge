"""
Posts URLs
==========
Separate URL patterns for offers and requests.
"""

from django.urls import path

from posts.views import (
    OfferCreateView, OfferDetailView, OfferListView,
    RequestCreateView, RequestDetailView, RequestListView,
    OfferLinkedCoursesView, OfferLinkedLiveSectionsView
)

app_name = "posts"

urlpatterns = [
    # Offer endpoints
    path("offers/create/", OfferCreateView.as_view(), name="offer-create"),
    path("offers/<int:pk>/", OfferDetailView.as_view(), name="offer-detail"),
    path("offers/", OfferListView.as_view(), name="offer-list"),
    
    # Request endpoints
    path("requests/create/", RequestCreateView.as_view(), name="request-create"),
    path("requests/<int:pk>/", RequestDetailView.as_view(), name="request-detail"),
    path("requests/", RequestListView.as_view(), name="request-list"),


    # Linked courses & live sections for an offer
    path("offers/<int:pk>/linked-courses/", OfferLinkedCoursesView.as_view(), name="offer-linked-courses"),
    path("offers/<int:pk>/linked-live-sections/", OfferLinkedLiveSectionsView.as_view(), name="offer-linked-live-sections"),
]