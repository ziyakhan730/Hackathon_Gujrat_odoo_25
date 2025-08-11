from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

User = get_user_model()

class Facility(models.Model):
    """Model for sports facilities"""
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='facilities')
    name = models.CharField(max_length=200)
    description = models.TextField()
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Contact Information
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    website = models.URLField(blank=True, null=True)
    
    # Operating Hours
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    
    # Facility Details
    capacity = models.IntegerField(blank=True, null=True, help_text="Maximum number of people the facility can accommodate")
    parking_spaces = models.IntegerField(blank=True, null=True, help_text="Number of parking spaces available")
    year_established = models.IntegerField(blank=True, null=True, help_text="Year the facility was established")
    
    # Pricing Information
    membership_required = models.BooleanField(default=False, help_text="Whether membership is required to use the facility")
    membership_fee = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Annual membership fee")
    
    # Status
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False, help_text="Whether this facility is featured on the platform")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Facilities"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.owner.get_full_name()}"

class FacilityPhoto(models.Model):
    """Model for facility photos"""
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='facility_photos/')
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_primary', '-created_at']
    
    def __str__(self):
        return f"Photo for {self.facility.name}"

class Sport(models.Model):
    """Model for sports types"""
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, blank=True)  # For emoji or icon class
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name

class FacilitySport(models.Model):
    """Many-to-many relationship between facilities and sports"""
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='facility_sports')
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE, related_name='facility_sports')
    is_available = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['facility', 'sport']
    
    def __str__(self):
        return f"{self.facility.name} - {self.sport.name}"

class Amenity(models.Model):
    """Model for facility amenities"""
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Amenities"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class FacilityAmenity(models.Model):
    """Many-to-many relationship between facilities and amenities"""
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='facility_amenities')
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE, related_name='facility_amenities')
    
    class Meta:
        unique_together = ['facility', 'amenity']
        verbose_name_plural = "Facility Amenities"
    
    def __str__(self):
        return f"{self.facility.name} - {self.amenity.name}"

class Court(models.Model):
    """Model for individual courts"""
    COURT_STATUS_CHOICES = [
        ('active', 'Active'),
        ('maintenance', 'Under Maintenance'),
        ('inactive', 'Inactive'),
    ]
    
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='courts')
    name = models.CharField(max_length=200)
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE, related_name='courts')
    description = models.TextField(blank=True)
    
    # Pricing
    price_per_hour = models.DecimalField(max_digits=8, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    
    # Court Details
    court_number = models.CharField(max_length=10, blank=True)
    surface_type = models.CharField(max_length=100, blank=True)
    court_size = models.CharField(max_length=100, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=COURT_STATUS_CHOICES, default='active')
    is_available = models.BooleanField(default=True)
    
    # Operating Hours (can override facility hours)
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['facility', 'name']
    
    def __str__(self):
        return f"{self.facility.name} - {self.name}"
    
    @property
    def get_opening_time(self):
        return self.opening_time or self.facility.opening_time
    
    @property
    def get_closing_time(self):
        return self.closing_time or self.facility.closing_time

class TimeSlot(models.Model):
    """Model for court time slots"""
    court = models.ForeignKey(Court, on_delete=models.CASCADE, related_name='time_slots')
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    is_blocked = models.BooleanField(default=False)
    block_reason = models.CharField(max_length=200, blank=True)
    
    class Meta:
        unique_together = ['court', 'start_time', 'end_time']
        ordering = ['start_time']
    
    def __str__(self):
        return f"{self.court.name} - {self.start_time} to {self.end_time}"

class Booking(models.Model):
    """Model for court bookings"""
    BOOKING_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('no_show', 'No Show'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    booking_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    court = models.ForeignKey(Court, on_delete=models.CASCADE, related_name='bookings')
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='bookings')
    
    # Booking Details
    booking_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_hours = models.DecimalField(max_digits=3, decimal_places=1)
    
    # Pricing
    price_per_hour = models.DecimalField(max_digits=8, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Status
    status = models.CharField(max_length=20, choices=BOOKING_STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Additional Information
    special_requests = models.TextField(blank=True)
    cancellation_reason = models.CharField(max_length=200, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Booking {self.booking_id} - {self.user.get_full_name()} at {self.court.name}"
    
    def save(self, *args, **kwargs):
        # Auto-calculate total amount
        if not self.total_amount:
            self.total_amount = self.price_per_hour * self.duration_hours
        super().save(*args, **kwargs)

class CourtRating(models.Model):
    """Model for court ratings and reviews"""
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='rating')
    court = models.ForeignKey(Court, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings_given')
    
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['booking', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.court.name} - {self.rating} stars"

class Notification(models.Model):
    """Model for notifications"""
    NOTIFICATION_TYPES = [
        ('booking_confirmed', 'Booking Confirmed'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('booking_reminder', 'Booking Reminder'),
        ('payment_received', 'Payment Received'),
        ('court_maintenance', 'Court Maintenance'),
        ('new_review', 'New Review'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    data = models.JSONField(default=dict, blank=True)  # Additional data
    is_read = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title}" 