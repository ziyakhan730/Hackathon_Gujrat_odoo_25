from rest_framework import serializers
from django.db.models import Avg, Count, Sum, Min
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from .models import (
    Facility, FacilityPhoto, Sport, FacilitySport, Amenity, FacilityAmenity,
    Court, CourtPhoto, TimeSlot, Booking, CourtRating, Notification
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
    image = serializers.SerializerMethodField()
    
    def get_image(self, obj):
        try:
            request = self.context.get('request') if hasattr(self, 'context') else None
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        except Exception:
            return None
    
    class Meta:
        model = FacilityPhoto
        fields = ['id', 'image', 'caption', 'is_primary', 'created_at']

class CourtPhotoSerializer(serializers.ModelSerializer):
    """Serializer for court photos"""
    image = serializers.SerializerMethodField()
    
    def get_image(self, obj):
        try:
            request = self.context.get('request') if hasattr(self, 'context') else None
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        except Exception:
            return None
    
    class Meta:
        model = CourtPhoto
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
    sports = serializers.SerializerMethodField()
    amenities = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    total_courts = serializers.SerializerMethodField()
    total_bookings = serializers.SerializerMethodField()
    total_earnings = serializers.SerializerMethodField()
    starting_price = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Facility
        fields = [
            'id', 'owner', 'name', 'description', 'address', 'city', 'state', 'pincode',
            'latitude', 'longitude', 'phone', 'email', 'opening_time', 'closing_time',
            'is_active', 'is_verified', 'created_at', 'updated_at',
            'photos', 'sports', 'amenities', 'images', 'total_courts', 'total_bookings', 
            'total_earnings', 'starting_price', 'rating', 'review_count'
        ]
        read_only_fields = ['owner', 'is_verified', 'created_at', 'updated_at']
    
    def get_sports(self, obj):
        """Get list of sports as strings"""
        return [sport.sport.name for sport in obj.facility_sports.all()]
    
    def get_amenities(self, obj):
        """Get list of amenities as strings"""
        return [amenity.amenity.name for amenity in obj.facility_amenities.all()]
    
    def get_images(self, obj):
        """Get list of photo URLs (absolute)"""
        request = self.context.get('request') if hasattr(self, 'context') else None
        urls = []
        for photo in obj.photos.all():
            try:
                url = photo.image.url
                urls.append(request.build_absolute_uri(url) if request else url)
            except Exception:
                continue
        return urls
    
    def get_total_courts(self, obj):
        return obj.courts.count()
    
    def get_total_bookings(self, obj):
        return obj.bookings.count()
    
    def get_total_earnings(self, obj):
        return obj.bookings.filter(payment_status='paid').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
    
    def get_starting_price(self, obj):
        """Get the minimum price per hour from all courts"""
        min_price = obj.courts.aggregate(
            min_price=Min('price_per_hour')
        )['min_price']
        return min_price or 0
    
    def get_rating(self, obj):
        """Get average rating from court ratings"""
        avg_rating = obj.courts.aggregate(
            avg_rating=Avg('ratings__rating')
        )['avg_rating']
        return round(avg_rating, 1) if avg_rating else 0
    
    def get_review_count(self, obj):
        """Get total number of reviews"""
        return obj.courts.aggregate(
            review_count=Count('ratings')
        )['review_count'] or 0

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
    photos = CourtPhotoSerializer(many=True, read_only=True)
    time_slots = serializers.SerializerMethodField()
    total_bookings = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_earnings = serializers.SerializerMethodField()
    
    class Meta:
        model = Court
        fields = [
            'id', 'facility', 'name', 'sport', 'description', 'price_per_hour',
            'currency', 'court_number', 'surface_type', 'court_size', 'status',
            'is_available', 'opening_time', 'closing_time', 'address', 'city', 
            'state', 'pincode', 'latitude', 'longitude', 'created_at', 'updated_at',
            'photos', 'time_slots', 'total_bookings', 'average_rating', 'total_earnings'
        ]
        read_only_fields = ['facility', 'created_at', 'updated_at']
    
    def get_time_slots(self, obj):
        """Get available time slots for the court"""
        slots = obj.time_slots.filter(is_available=True, is_blocked=False)
        return TimeSlotSerializer(slots, many=True).data
    
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
    photos = serializers.ListField(child=serializers.ImageField(), required=False, write_only=True)
    time_slots = serializers.CharField(required=False, write_only=True)  # Changed to CharField to handle JSON string
    
    class Meta:
        model = Court
        fields = [
            'facility', 'name', 'sport', 'description', 'price_per_hour',
            'currency', 'court_number', 'surface_type', 'court_size',
            'opening_time', 'closing_time', 'address', 'city', 'state', 
            'pincode', 'latitude', 'longitude', 'photos', 'time_slots'
        ]
    
    def validate_time_slots(self, value):
        """Validate and parse time_slots JSON string"""
        if not value:
            return []
        
        if isinstance(value, str):
            import json
            try:
                parsed_value = json.loads(value)
                if isinstance(parsed_value, list):
                    return parsed_value
                else:
                    raise serializers.ValidationError("time_slots must be a list")
            except json.JSONDecodeError:
                raise serializers.ValidationError("Invalid JSON format for time_slots")
        
        return value
    
    def create(self, validated_data):
        user = self.context['request'].user
        facility = user.facilities.first()
        
        if not facility:
            raise serializers.ValidationError("You need to create a facility first before adding courts. Please contact support to set up your facility.")
        
        # Extract photos and time slots
        photos = validated_data.pop('photos', [])
        time_slots_data = validated_data.pop('time_slots', [])
        
        validated_data['facility'] = facility
        court = super().create(validated_data)
        
        # Create court photos
        for i, photo in enumerate(photos):
            CourtPhoto.objects.create(
                court=court,
                image=photo,
                is_primary=(i == 0)  # First photo is primary
            )
        
        # Create time slots
        for slot_data in time_slots_data:
            TimeSlot.objects.create(
                court=court,
                start_time=slot_data['start_time'],
                end_time=slot_data['end_time'],
                is_available=slot_data.get('is_available', True)
            )
        
        return court

class CourtUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating courts"""
    photos = serializers.ListField(child=serializers.ImageField(), required=False, write_only=True)
    time_slots = serializers.CharField(required=False, write_only=True)  # Changed to CharField to handle JSON string
    
    class Meta:
        model = Court
        fields = [
            'name', 'sport', 'description', 'price_per_hour', 'currency',
            'court_number', 'surface_type', 'court_size', 'opening_time', 
            'closing_time', 'address', 'city', 'state', 'pincode', 
            'latitude', 'longitude', 'status', 'photos', 'time_slots'
        ]
    
    def validate_time_slots(self, value):
        """Validate and parse time_slots JSON string"""
        if not value:
            return []
        
        if isinstance(value, str):
            import json
            try:
                parsed_value = json.loads(value)
                if isinstance(parsed_value, list):
                    return parsed_value
                else:
                    raise serializers.ValidationError("time_slots must be a list")
            except json.JSONDecodeError:
                raise serializers.ValidationError("Invalid JSON format for time_slots")
        
        return value
    
    def update(self, instance, validated_data):
        # Extract photos and time slots
        photos = validated_data.pop('photos', [])
        time_slots_data = validated_data.pop('time_slots', [])
        
        # Update court instance
        court = super().update(instance, validated_data)
        
        # Handle photos if provided
        if photos:
            # Clear existing photos and add new ones
            court.photos.all().delete()
            for i, photo in enumerate(photos):
                CourtPhoto.objects.create(
                    court=court,
                    image=photo,
                    is_primary=(i == 0)  # First photo is primary
                )
        
        # Handle time slots if provided
        if time_slots_data:
            # Clear existing time slots and add new ones
            court.time_slots.all().delete()
            for slot_data in time_slots_data:
                TimeSlot.objects.create(
                    court=court,
                    start_time=slot_data['start_time'],
                    end_time=slot_data['end_time'],
                    is_available=slot_data.get('is_available', True)
                )
        
        return court

class TimeSlotSerializer(serializers.ModelSerializer):
    """Serializer for time slots"""
    class Meta:
        model = TimeSlot
        fields = ['id', 'court', 'start_time', 'end_time', 'is_available', 'is_blocked', 'block_reason', 'is_recurring', 'duration_hours']

class BookingSerializer(serializers.ModelSerializer):
    """Serializer for bookings"""
    user = serializers.ReadOnlyField(source='user.get_full_name')
    user_email = serializers.ReadOnlyField(source='user.email')
    court = serializers.ReadOnlyField(source='court.name')
    facility = serializers.ReadOnlyField(source='facility.name')
    court_image = serializers.SerializerMethodField()
    facility_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'booking_id', 'user', 'user_email', 'court', 'facility',
            'booking_date', 'start_time', 'end_time', 'duration_hours',
            'price_per_hour', 'total_amount', 'status', 'payment_status',
            'special_requests', 'cancellation_reason', 'created_at', 'updated_at',
            'court_image', 'facility_image'
        ]
        read_only_fields = ['booking_id', 'user', 'user_email', 'court', 'facility', 'created_at', 'updated_at']

    def get_court_image(self, obj):
        try:
            photo = obj.court.photos.order_by('-is_primary', '-created_at').first()
            if not photo:
                return None
            url = photo.image.url
            request = self.context.get('request') if hasattr(self, 'context') else None
            return request.build_absolute_uri(url) if request else url
        except Exception:
            return None

    def get_facility_image(self, obj):
        try:
            photo = obj.facility.photos.order_by('-is_primary', '-created_at').first()
            if not photo:
                return None
            url = photo.image.url
            request = self.context.get('request') if hasattr(self, 'context') else None
            return request.build_absolute_uri(url) if request else url
        except Exception:
            return None

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
        # Store as Decimal to match model field and avoid Decimal*float errors
        data['duration_hours'] = Decimal(str(duration.total_seconds() / 3600)).quantize(Decimal('0.1'))
        
        # Set price per hour
        data['price_per_hour'] = court.price_per_hour
        
        return data
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['facility'] = validated_data['court'].facility
        return super().create(validated_data)

class BookingUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating bookings"""
    class Meta:
        model = Booking
        fields = [
            'booking_date', 'start_time', 'end_time', 'duration_hours',
            'price_per_hour', 'total_amount', 'status', 'payment_status',
            'special_requests', 'cancellation_reason'
        ]
        read_only_fields = ['total_amount']  # Auto-calculated
    
    def validate(self, data):
        # Check if court is available for the new time slot
        instance = self.instance
        booking_date = data.get('booking_date', instance.booking_date)
        start_time = data.get('start_time', instance.start_time)
        end_time = data.get('end_time', instance.end_time)
        
        if booking_date and start_time and end_time:
            # Check if there are any conflicting bookings (excluding current booking)
            conflicting_bookings = Booking.objects.filter(
                court=instance.court,
                booking_date=booking_date,
                status__in=['confirmed', 'pending'],
                start_time__lt=end_time,
                end_time__gt=start_time
            ).exclude(id=instance.id)
            
            if conflicting_bookings.exists():
                raise serializers.ValidationError(
                    "This time slot is already booked. Please choose a different time."
                )
            
            # Check if booking is in the past
            if booking_date < timezone.now().date():
                raise serializers.ValidationError(
                    "Cannot book for past dates."
                )
            
            # Check if start time is before end time
            if start_time >= end_time:
                raise serializers.ValidationError(
                    "Start time must be before end time."
                )
        
        return data
    
    def update(self, instance, validated_data):
        # Auto-calculate total amount if duration or price changes
        if 'duration_hours' in validated_data or 'price_per_hour' in validated_data:
            duration = validated_data.get('duration_hours', instance.duration_hours)
            price = validated_data.get('price_per_hour', instance.price_per_hour)
            validated_data['total_amount'] = duration * price
        
        return super().update(instance, validated_data)

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