"""
Courses URLs
============
URL patterns for courses, contents, and course-offer linking.
"""

from django.urls import path

from courses.views import (
    CourseCreateView, CourseDetailView, CourseListView,
    ContentCreateView, ContentDetailView,
    LinkCourseToOfferView, UnlinkCourseFromOfferView
)

app_name = "courses"

urlpatterns = [
    # Course endpoints
    path("create/", CourseCreateView.as_view(), name="course-create"),
    path("<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("", CourseListView.as_view(), name="course-list"),
    
    # Content endpoints (nested under course)
    path("<int:course_id>/contents/create/", ContentCreateView.as_view(), name="content-create"),
    path("contents/<int:pk>/", ContentDetailView.as_view(), name="content-detail"),
    
    # Link/Unlink endpoints
    path("<int:course_id>/link/<int:offer_id>/", LinkCourseToOfferView.as_view(), name="link-course-offer"),
    path("<int:course_id>/unlink/<int:offer_id>/", UnlinkCourseFromOfferView.as_view(), name="unlink-course-offer"),
]