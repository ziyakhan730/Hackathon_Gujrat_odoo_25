from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SportViewSet, AmenityViewSet, FacilityViewSet, CourtViewSet,
    TimeSlotViewSet, BookingViewSet, CourtRatingViewSet, NotificationViewSet,
    DashboardViewSet, PlayerDashboardView, PlayerBookingsView, 
    PlayerBookingDetailView, PlayerVenuesView, PlayerVenueDetailView,
    PaymentViewSet, PlayerVenueReviewsView, PlayerCreateReviewView
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
router.register(r'payments', PaymentViewSet, basename='payments')

urlpatterns = [
    path('', include(router.urls)),
    
    # Player Dashboard URLs
    path('player/dashboard/', PlayerDashboardView.as_view(), name='player-dashboard'),
    path('player/bookings/', PlayerBookingsView.as_view(), name='player-bookings'),
    path('player/bookings/<int:booking_id>/', PlayerBookingDetailView.as_view(), name='player-booking-detail'),
    path('player/venues/', PlayerVenuesView.as_view(), name='player-venues'),
    path('player/venues/<int:venue_id>/', PlayerVenueDetailView.as_view(), name='player-venue-detail'),
    path('player/venues/<int:venue_id>/reviews/', PlayerVenueReviewsView.as_view(), name='player-venue-reviews'),
    path('player/bookings/<int:booking_id>/review/', PlayerCreateReviewView.as_view(), name='player-create-review'),
] 