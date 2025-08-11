from rest_framework import serializers
from django.db.models import Avg, Count, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    Facility, FacilityPhoto, Sport, FacilitySport, Amenity, FacilityAmenity,
    Court, TimeSlot, Booking, CourtRating, Notification
)

class SportSerializer(serializers.ModelSerializer):
    """Serializer for sports"""
    class Meta:
        model = Sport
        fields = ['id', 'name', 'icon', 'description', 'is_active']

class AmenitySerializer(serializers.ModelSerializer):
    """Serializer for amenities"""
    class Meta:
        model = Amenity
        fields = ['id', 'name', 'icon', 'description']

class FacilityPhotoSerializer(serializers.ModelSerializer):
    """Serializer for facility photos"""
    class Meta:
        model = FacilityPhoto
        fields = ['id', 'image', 'caption', 'is_primary', 'created_at']

class FacilitySportSerializer(serializers.ModelSerializer):
    """Serializer for facility sports"""
    sport = SportSerializer(read_only=True)
    sport_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = FacilitySport
        fields = ['id', 'sport', 'sport_id', 'is_available']

class FacilityAmenitySerializer(serializers.ModelSerializer):
    """Serializer for facility amenities"""
    amenity = AmenitySerializer(read_only=True)
    amenity_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = FacilityAmenity
        fields = ['id', 'amenity', 'amenity_id']

class FacilitySerializer(serializers.ModelSerializer):
    """Serializer for facilities"""
    owner = serializers.ReadOnlyField(source='owner.get_full_name')
    photos = FacilityPhotoSerializer(many=True, read_only=True)
    sports = FacilitySportSerializer(source='facility_sports', many=True, read_only=True)
    amenities = FacilityAmenitySerializer(source='facility_amenities', many=True, read_only=True)
    total_courts = serializers.SerializerMethodField()
    total_bookings = serializers.SerializerMethodField()
    total_earnings = serializers.SerializerMethodField()
    
    class Meta:
        model = Facility
        fields = [
            'id', 'owner', 'name', 'description', 'address', 'city', 'state', 'pincode',
            'latitude', 'longitude', 'phone', 'email', 'opening_time', 'closing_time',
            'is_active', 'is_verified', 'created_at', 'updated_at',
            'photos', 'sports', 'amenities', 'total_courts', 'total_bookings', 'total_earnings'
        ]
        read_only_fields = ['owner', 'is_verified', 'created_at', 'updated_at']
    
    def get_total_courts(self, obj):
        return obj.courts.count()
    
    def get_total_bookings(self, obj):
        return obj.bookings.count()
    
    def get_total_earnings(self, obj):
        return obj.bookings.filter(payment_status='paid').aggregate(
            total=Sum('total_amount')
        )['total'] or 0

class FacilityCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating facilities"""
    sports = serializers.ListField(child=serializers.IntegerField(), required=False)
    amenities = serializers.ListField(child=serializers.IntegerField(), required=False)
    photos = serializers.ListField(child=serializers.ImageField(), required=False, write_only=True)
    
    class Meta:
        model = Facility
        fields = [
            'name', 'description', 'address', 'city', 'state', 'pincode',
            'latitude', 'longitude', 'phone', 'email', 'website', 'capacity',
            'parking_spaces', 'year_established', 'opening_time', 'closing_time',
            'sports', 'amenities', 'photos'
        ]
    
    def create(self, validated_data):
        try:
            sports = validated_data.pop('sports', [])
            amenities = validated_data.pop('amenities', [])
            photos = validated_data.pop('photos', [])
            
            # Handle optional fields that might be empty strings
            for field in ['website', 'capacity', 'parking_spaces', 'year_established']:
                if field in validated_data and validated_data[field] == '':
                    validated_data[field] = None
            
            # Handle time fields - convert string to time object if needed
            for time_field in ['opening_time', 'closing_time']:
                if time_field in validated_data and isinstance(validated_data[time_field], str):
                    if validated_data[time_field]:  # Only convert if not empty
                        from datetime import datetime
                        try:
                            time_obj = datetime.strptime(validated_data[time_field], '%H:%M').time()
                            validated_data[time_field] = time_obj
                        except ValueError:
                            # If time format is invalid, set to None
                            validated_data[time_field] = None
            
            # Set the owner
            validated_data['owner'] = self.context['request'].user
            
            facility = Facility.objects.create(**validated_data)
            
            # Add sports
            for sport_id in sports:
                try:
                    sport = Sport.objects.get(id=sport_id)
                    FacilitySport.objects.create(facility=facility, sport=sport)
                except Sport.DoesNotExist:
                    pass
            
            # Add amenities
            for amenity_id in amenities:
                try:
                    amenity = Amenity.objects.get(id=amenity_id)
                    FacilityAmenity.objects.create(facility=facility, amenity=amenity)
                except Amenity.DoesNotExist:
                    pass
            
            # Add photos
            for i, photo in enumerate(photos):
                FacilityPhoto.objects.create(
                    facility=facility,
                    image=photo,
                    is_primary=(i == 0)  # First photo is primary
                )
            
            return facility
        except Exception as e:
            print(f"Error creating facility: {e}")
            raise

class CourtSerializer(serializers.ModelSerializer):
    """Serializer for courts"""
    facility = serializers.ReadOnlyField(source='facility.name')
    sport = SportSerializer(read_only=True)
    total_bookings = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_earnings = serializers.SerializerMethodField()
    
    class Meta:
        model = Court
        fields = [
            'id', 'facility', 'name', 'sport', 'description', 'price_per_hour',
            'currency', 'court_number', 'surface_type', 'court_size', 'status',
            'is_available', 'opening_time', 'closing_time', 'created_at', 'updated_at',
            'total_bookings', 'average_rating', 'total_earnings'
        ]
        read_only_fields = ['facility', 'created_at', 'updated_at']
    
    def get_total_bookings(self, obj):
        return obj.bookings.count()
    
    def get_average_rating(self, obj):
        avg = obj.ratings.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0
    
    def get_total_earnings(self, obj):
        return obj.bookings.filter(payment_status='paid').aggregate(
            total=Sum('total_amount')
        )['total'] or 0

class CourtCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating courts"""
    class Meta:
        model = Court
        fields = [
            'facility', 'name', 'sport', 'description', 'price_per_hour',
            'currency', 'court_number', 'surface_type', 'court_size',
            'opening_time', 'closing_time'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        facility = user.facilities.first()
        
        if not facility:
            raise serializers.ValidationError("You need to create a facility first before adding courts. Please contact support to set up your facility.")
        
        validated_data['facility'] = facility
        return super().create(validated_data)

class TimeSlotSerializer(serializers.ModelSerializer):
    """Serializer for time slots"""
    class Meta:
        model = TimeSlot
        fields = ['id', 'court', 'start_time', 'end_time', 'is_available', 'is_blocked', 'block_reason']

class BookingSerializer(serializers.ModelSerializer):
    """Serializer for bookings"""
    user = serializers.ReadOnlyField(source='user.get_full_name')
    user_email = serializers.ReadOnlyField(source='user.email')
    court = serializers.ReadOnlyField(source='court.name')
    facility = serializers.ReadOnlyField(source='facility.name')
    
    class Meta:
        model = Booking
        fields = [
            'id', 'booking_id', 'user', 'user_email', 'court', 'facility',
            'booking_date', 'start_time', 'end_time', 'duration_hours',
            'price_per_hour', 'total_amount', 'status', 'payment_status',
            'special_requests', 'cancellation_reason', 'created_at', 'updated_at'
        ]
        read_only_fields = ['booking_id', 'user', 'user_email', 'court', 'facility', 'created_at', 'updated_at']

class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings"""
    class Meta:
        model = Booking
        fields = [
            'court', 'booking_date', 'start_time', 'end_time',
            'special_requests'
        ]
    
    def validate(self, data):
        # Check if court is available
        court = data['court']
        if not court.is_available or court.status != 'active':
            raise serializers.ValidationError("Court is not available for booking")
        
        # Check if time slot is available
        start_time = data['start_time']
        end_time = data['end_time']
        booking_date = data['booking_date']
        
        # Check for overlapping bookings
        overlapping_bookings = Booking.objects.filter(
            court=court,
            booking_date=booking_date,
            status__in=['pending', 'confirmed'],
            start_time__lt=end_time,
            end_time__gt=start_time
        )
        
        if overlapping_bookings.exists():
            raise serializers.ValidationError("Time slot is already booked")
        
        # Calculate duration
        start_dt = datetime.combine(booking_date, start_time)
        end_dt = datetime.combine(booking_date, end_time)
        duration = end_dt - start_dt
        data['duration_hours'] = duration.total_seconds() / 3600
        
        # Set price per hour
        data['price_per_hour'] = court.price_per_hour
        
        return data
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['facility'] = validated_data['court'].facility
        return super().create(validated_data)

class CourtRatingSerializer(serializers.ModelSerializer):
    """Serializer for court ratings"""
    user = serializers.ReadOnlyField(source='user.get_full_name')
    court = serializers.ReadOnlyField(source='court.name')
    
    class Meta:
        model = CourtRating
        fields = ['id', 'booking', 'court', 'user', 'rating', 'review', 'created_at']
        read_only_fields = ['user', 'court', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'title', 'message', 'data', 'is_read', 'created_at']
        read_only_fields = ['created_at']

# Dashboard-specific serializers
class DashboardKPISerializer(serializers.Serializer):
    """Serializer for dashboard KPIs"""
    total_bookings = serializers.IntegerField()
    active_courts = serializers.IntegerField()
    total_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_bookings = serializers.IntegerField()

class BookingTrendSerializer(serializers.Serializer):
    """Serializer for booking trends"""
    date = serializers.DateField()
    bookings = serializers.IntegerField()
    earnings = serializers.DecimalField(max_digits=10, decimal_places=2)

class PeakHourSerializer(serializers.Serializer):
    """Serializer for peak hours"""
    hour = serializers.CharField()
    bookings = serializers.IntegerField()
    percentage = serializers.FloatField()

class RecentBookingSerializer(serializers.ModelSerializer):
    """Serializer for recent bookings"""
    user_name = serializers.ReadOnlyField(source='user.get_full_name')
    court_name = serializers.ReadOnlyField(source='court.name')
    
    class Meta:
        model = Booking
        fields = ['id', 'user_name', 'court_name', 'booking_date', 'start_time', 'end_time', 'status', 'total_amount'] 