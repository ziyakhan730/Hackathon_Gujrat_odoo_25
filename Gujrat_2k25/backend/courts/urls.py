from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SportViewSet, AmenityViewSet, FacilityViewSet, CourtViewSet,
    TimeSlotViewSet, BookingViewSet, CourtRatingViewSet, NotificationViewSet,
    DashboardViewSet
)

router = DefaultRouter()
router.register(r'sports', SportViewSet)
router.register(r'amenities', AmenityViewSet)
router.register(r'facilities', FacilityViewSet, basename='facility')
router.register(r'courts', CourtViewSet, basename='court')
router.register(r'timeslots', TimeSlotViewSet, basename='timeslot')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'ratings', CourtRatingViewSet, basename='rating')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
] 