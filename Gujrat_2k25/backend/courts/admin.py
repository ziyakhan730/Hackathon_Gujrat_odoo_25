from django.contrib import admin
from .models import (
    Facility, FacilityPhoto, Sport, FacilitySport, Amenity, FacilityAmenity,
    Court, TimeSlot, Booking, CourtRating, Notification
)

@admin.register(Sport)
class SportAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']

@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon']
    search_fields = ['name']

@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'city', 'state', 'is_active', 'is_verified', 'created_at']
    list_filter = ['is_active', 'is_verified', 'city', 'state']
    search_fields = ['name', 'owner__first_name', 'owner__last_name', 'city']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(FacilityPhoto)
class FacilityPhotoAdmin(admin.ModelAdmin):
    list_display = ['facility', 'caption', 'is_primary', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['facility__name', 'caption']

@admin.register(FacilitySport)
class FacilitySportAdmin(admin.ModelAdmin):
    list_display = ['facility', 'sport', 'is_available']
    list_filter = ['is_available', 'sport']
    search_fields = ['facility__name', 'sport__name']

@admin.register(FacilityAmenity)
class FacilityAmenityAdmin(admin.ModelAdmin):
    list_display = ['facility', 'amenity']
    list_filter = ['amenity']
    search_fields = ['facility__name', 'amenity__name']

@admin.register(Court)
class CourtAdmin(admin.ModelAdmin):
    list_display = ['name', 'facility', 'sport', 'price_per_hour', 'status', 'is_available']
    list_filter = ['status', 'is_available', 'sport', 'facility']
    search_fields = ['name', 'facility__name', 'sport__name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['court', 'start_time', 'end_time', 'is_available', 'is_blocked']
    list_filter = ['is_available', 'is_blocked', 'court__facility']
    search_fields = ['court__name', 'block_reason']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['booking_id', 'user', 'court', 'facility', 'booking_date', 'status', 'payment_status', 'total_amount']
    list_filter = ['status', 'payment_status', 'booking_date', 'facility']
    search_fields = ['booking_id', 'user__first_name', 'user__last_name', 'court__name']
    readonly_fields = ['booking_id', 'created_at', 'updated_at']

@admin.register(CourtRating)
class CourtRatingAdmin(admin.ModelAdmin):
    list_display = ['user', 'court', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'court__name', 'review']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'title', 'message']
    readonly_fields = ['created_at'] 