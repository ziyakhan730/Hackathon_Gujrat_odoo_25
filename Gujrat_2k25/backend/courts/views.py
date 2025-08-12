from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q, Case, When, F, DecimalField
from django.utils import timezone
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from .models import (
    Facility, FacilityPhoto, Sport, FacilitySport, Amenity, FacilityAmenity,
    Court, CourtPhoto, TimeSlot, Booking, CourtRating, Notification
)
from .serializers import (
    SportSerializer, AmenitySerializer, FacilitySerializer, FacilityCreateSerializer,
    CourtSerializer, CourtCreateSerializer, CourtUpdateSerializer, TimeSlotSerializer, BookingSerializer,
    BookingCreateSerializer, CourtRatingSerializer, NotificationSerializer,
    DashboardKPISerializer, BookingTrendSerializer, PeakHourSerializer, RecentBookingSerializer
)
from rest_framework.views import APIView
from django.core.paginator import Paginator
from django.db.models import Count, Q
from django.utils import timezone
from .serializers import BookingUpdateSerializer, BookingCreateSerializer
from django.conf import settings
import razorpay
import hmac
import hashlib
import os
from authentication.email_service import EmailService

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow owners to edit their facilities and courts"""
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for the owner
        # Handle different model types
        if hasattr(obj, 'owner'):
            # For Facility objects
            return obj.owner == request.user
        elif hasattr(obj, 'facility'):
            # For Court objects
            return obj.facility.owner == request.user
        elif hasattr(obj, 'court'):
            # For TimeSlot objects
            return obj.court.facility.owner == request.user
        else:
            # Default fallback
            return False

class SportViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for sports"""
    queryset = Sport.objects.filter(is_active=True)
    serializer_class = SportSerializer
    permission_classes = [permissions.AllowAny]

class AmenityViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for amenities"""
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    permission_classes = [permissions.AllowAny]

class FacilityViewSet(viewsets.ModelViewSet):
    """ViewSet for facilities"""
    serializer_class = FacilitySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'owner':
            return Facility.objects.filter(owner=user)
        return Facility.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return FacilityCreateSerializer
        return FacilitySerializer
    
    def create(self, request, *args, **kwargs):
        """Override create method to add debugging"""
        try:
            print("Facility creation request received")
            print("User:", request.user)
            print("Data keys:", request.data.keys())
            print("Files:", request.FILES.keys() if request.FILES else "No files")
            
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"Error in facility creation: {e}")
            import traceback
            traceback.print_exc()
            raise
    
    @action(detail=True, methods=['post'])
    def upload_photos(self, request, pk=None):
        """Upload photos for a facility"""
        facility = self.get_object()
        photos = request.FILES.getlist('photos')
        
        for photo in photos:
            FacilityPhoto.objects.create(facility=facility, image=photo)
        
        return Response({'message': f'{len(photos)} photos uploaded successfully'})

class CourtViewSet(viewsets.ModelViewSet):
    """ViewSet for courts"""
    serializer_class = CourtSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'owner':
            return Court.objects.filter(facility__owner=user)
        return Court.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CourtCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CourtUpdateSerializer
        return CourtSerializer
    
    @action(detail=True, methods=['post'])
    def upload_photos(self, request, pk=None):
        """Upload photos for a court"""
        court = self.get_object()
        photos = request.FILES.getlist('photos')
        
        for photo in photos:
            CourtPhoto.objects.create(court=court, image=photo)
        
        return Response({'message': f'{len(photos)} photos uploaded successfully'})
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update court status"""
        court = self.get_object()
        status = request.data.get('status')
        
        if status in dict(Court.COURT_STATUS_CHOICES):
            court.status = status
            court.save()
            return Response({'message': f'Court status updated to {status}'})
        
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """Override update method to handle court updates with photos and time slots"""
        try:
            print(f"Court update request received for court {kwargs.get('pk')}")
            print(f"Request data: {request.data}")
            print(f"Request files: {request.FILES}")
            
            return super().update(request, *args, **kwargs)
        except Exception as e:
            print(f"Error in court update: {e}")
            import traceback
            traceback.print_exc()
            raise

class TimeSlotViewSet(viewsets.ModelViewSet):
    """ViewSet for time slots"""
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'owner':
            return TimeSlot.objects.filter(court__facility__owner=user)
        return TimeSlot.objects.none()

class BookingViewSet(viewsets.ModelViewSet):
    """ViewSet for bookings"""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'owner':
            return Booking.objects.filter(facility__owner=user)
        return Booking.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update booking status"""
        booking = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(Booking.BOOKING_STATUS_CHOICES):
            booking.status = new_status
            booking.save()
            # Notify player on confirmation
            if new_status == 'confirmed':
                try:
                    EmailService.send_booking_confirmation(booking.user, booking)
                except Exception as e:
                    print(f"Error sending confirmation email: {e}")
            return Response({'message': f'Booking status updated to {new_status}'})
        
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def update_payment_status(self, request, pk=None):
        """Update payment status"""
        booking = self.get_object()
        payment_status = request.data.get('payment_status')
        
        if payment_status in dict(Booking.PAYMENT_STATUS_CHOICES):
            booking.payment_status = payment_status
            booking.save()
            return Response({'message': f'Payment status updated to {payment_status}'})
        
        return Response({'error': 'Invalid payment status'}, status=status.HTTP_400_BAD_REQUEST)

class CourtRatingViewSet(viewsets.ModelViewSet):
    """ViewSet for court ratings"""
    serializer_class = CourtRatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'owner':
            return CourtRating.objects.filter(court__facility__owner=user)
        return CourtRating.objects.filter(user=user)

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read'})

class DashboardViewSet(viewsets.ViewSet):
    """ViewSet for dashboard data"""
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        """Get dashboard overview data"""
        user = request.user
        
        if user.user_type != 'owner':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get user's facilities
        facilities = Facility.objects.filter(owner=user)
        
        # If user has no facilities, return zeros (this is expected for new users)
        if not facilities.exists():
            kpi_data = {
                'total_bookings': 0,
                'active_courts': 0,
                'total_earnings': 0,
                'pending_bookings': 0
            }
            serializer = DashboardKPISerializer(kpi_data)
            return Response(serializer.data)
        
        # Calculate KPIs
        total_bookings = Booking.objects.filter(facility__in=facilities).count()
        active_courts = Court.objects.filter(facility__in=facilities, status='active').count()
        # Earnings: include ONLY owner-approved bookings (confirmed or completed)
        total_earnings = (
            Booking.objects
            .filter(facility__in=facilities, status__in=['confirmed', 'completed'])
            .aggregate(total=Sum('total_amount'))['total']
            or 0
        )
        pending_bookings = Booking.objects.filter(
            facility__in=facilities, 
            status='pending'
        ).count()
        
        kpi_data = {
            'total_bookings': total_bookings,
            'active_courts': active_courts,
            'total_earnings': total_earnings,
            'pending_bookings': pending_bookings
        }
        
        serializer = DashboardKPISerializer(kpi_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def booking_trends(self, request):
        """Get booking trends data"""
        user = request.user
        
        if user.user_type != 'owner':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get user's facilities
        facilities = Facility.objects.filter(owner=user)
        
        # If user has no facilities, return empty trends
        if not facilities.exists():
            serializer = BookingTrendSerializer([], many=True)
            return Response(serializer.data)
        
        # Get date range from query params
        period = request.query_params.get('period', 'week')
        
        if period == 'week':
            start_date = timezone.now().date() - timedelta(days=7)
        elif period == 'month':
            start_date = timezone.now().date() - timedelta(days=30)
        else:
            start_date = timezone.now().date() - timedelta(days=7)
        
        # Get booking trends
        bookings = (
            Booking.objects
            .filter(
                facility__in=facilities,
                booking_date__gte=start_date,
            )
            .values('booking_date')
            .annotate(
                bookings=Count('id'),
                earnings=Sum(
                    Case(
                        When(status__in=['confirmed', 'completed'], then=F('total_amount')),
                        default=0,
                        output_field=DecimalField(max_digits=10, decimal_places=2)
                    )
                )
            )
            .order_by('booking_date')
        )
        
        trends_data = []
        for booking in bookings:
            trends_data.append({
                'date': booking['booking_date'],
                'bookings': booking['bookings'],
                'earnings': booking['earnings'] or 0
            })
        
        serializer = BookingTrendSerializer(trends_data, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def peak_hours(self, request):
        """Get peak booking hours data"""
        user = request.user
        
        if user.user_type != 'owner':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get user's facilities
        facilities = Facility.objects.filter(owner=user)
        
        # If user has no facilities, return empty peak hours
        if not facilities.exists():
            serializer = PeakHourSerializer([], many=True)
            return Response(serializer.data)
        
        # Get bookings for the last 30 days
        start_date = timezone.now().date() - timedelta(days=30)
        
        bookings = Booking.objects.filter(
            facility__in=facilities,
            booking_date__gte=start_date
        ).values('start_time').annotate(
            bookings=Count('id')
        ).order_by('start_time')
        
        total_bookings = sum(booking['bookings'] for booking in bookings)
        
        peak_hours_data = []
        for booking in bookings:
            hour = booking['start_time'].strftime('%H-%H')
            percentage = (booking['bookings'] / total_bookings * 100) if total_bookings > 0 else 0
            
            peak_hours_data.append({
                'hour': hour,
                'bookings': booking['bookings'],
                'percentage': round(percentage, 1)
            })
        
        serializer = PeakHourSerializer(peak_hours_data, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent_bookings(self, request):
        """Get recent bookings"""
        user = request.user
        
        if user.user_type != 'owner':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        facilities = Facility.objects.filter(owner=user)
        recent_bookings = Booking.objects.filter(
            facility__in=facilities
        ).order_by('-created_at')[:10]
        
        serializer = RecentBookingSerializer(recent_bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def court_stats(self, request):
        """Get court statistics"""
        user = request.user
        
        if user.user_type != 'owner':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        facilities = Facility.objects.filter(owner=user)
        courts = Court.objects.filter(facility__in=facilities)
        
        court_stats = []
        for court in courts:
            total_bookings = court.bookings.count()
            avg_rating = court.ratings.aggregate(Avg('rating'))['rating__avg'] or 0
            total_earnings = court.bookings.filter(payment_status='paid').aggregate(
                Sum('total_amount')
            )['total_amount__sum'] or 0
            
            court_stats.append({
                'id': court.id,
                'name': court.name,
                'sport': court.sport.name,
                'status': court.status,
                'price_per_hour': court.price_per_hour,
                'total_bookings': total_bookings,
                'average_rating': round(avg_rating, 1),
                'total_earnings': total_earnings
            })
        
        return Response(court_stats) 

class PlayerDashboardView(APIView):
    """API view for player dashboard data"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get player dashboard statistics and data"""
        user = request.user
        
        # Get user's bookings
        user_bookings = Booking.objects.filter(user=user)
        active_bookings = user_bookings.filter(status='confirmed', booking_date__gte=timezone.now().date()).count()
        total_bookings = user_bookings.count()
        
        # Get venues visited (unique venues from bookings)
        venues_visited = user_bookings.values('court__facility').distinct().count()
        
        # Calculate hours played (sum of booking durations)
        hours_played = sum(booking.duration_hours for booking in user_bookings if booking.duration_hours)
        
        # Get recent bookings
        recent_bookings = user_bookings.order_by('-created_at')[:3]
        
        # Get popular venues (venues with most bookings)
        popular_venues = Facility.objects.filter(
            courts__bookings__isnull=False
        ).annotate(
            booking_count=Count('courts__bookings')
        ).order_by('-booking_count')[:3]
        
        return Response({
            'success': True,
            'data': {
                'stats': {
                    'active_bookings': active_bookings,
                    'total_bookings': total_bookings,
                    'venues_visited': venues_visited,
                    'hours_played': hours_played
                },
                'recent_bookings': BookingSerializer(recent_bookings, many=True).data,
                'popular_venues': FacilitySerializer(popular_venues, many=True).data
            }
        }, status=status.HTTP_200_OK)

class PlayerBookingsView(APIView):
    """API view for player's bookings"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get all bookings for the current player"""
        user = request.user
        bookings = Booking.objects.filter(user=user).order_by('-created_at')
        
        # Apply filters if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            bookings = bookings.filter(status=status_filter)
        
        # Apply date filter if provided
        date_filter = request.query_params.get('date')
        if date_filter:
            bookings = bookings.filter(booking_date=date_filter)
        
        # Pagination
        paginator = Paginator(bookings, 10)
        page_number = request.query_params.get('page', 1)
        page_obj = paginator.get_page(page_number)
        
        return Response({
            'success': True,
            'data': {
                'bookings': BookingSerializer(page_obj, many=True, context={'request': request}).data,
                'pagination': {
                    'count': paginator.count,
                    'pages': paginator.num_pages,
                    'current_page': page_obj.number,
                    'has_next': page_obj.has_next(),
                    'has_previous': page_obj.has_previous()
                }
            }
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Create a new booking"""
        user = request.user
        serializer = BookingCreateSerializer(data=request.data, context={'user': user})
        
        if serializer.is_valid():
            booking = serializer.save(user=user)
            return Response({
                'success': True,
                'message': 'Booking created successfully',
                'data': BookingSerializer(booking).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Booking creation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class PlayerBookingDetailView(APIView):
    """API view for individual booking details"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, booking_id):
        """Get booking details"""
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
            return Response({
                'success': True,
                'data': BookingSerializer(booking, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        except Booking.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Booking not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, booking_id):
        """Update booking"""
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
            serializer = BookingUpdateSerializer(booking, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Booking updated successfully',
                    'data': BookingSerializer(booking).data
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'message': 'Booking update failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Booking.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Booking not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, booking_id):
        """Cancel booking"""
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
            
            # Check if booking can be cancelled
            if booking.status == 'cancelled':
                return Response({
                    'success': False,
                    'message': 'Booking is already cancelled'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if booking.booking_date < timezone.now().date():
                return Response({
                    'success': False,
                    'message': 'Cannot cancel past bookings'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            booking.status = 'cancelled'
            booking.save()
            
            return Response({
                'success': True,
                'message': 'Booking cancelled successfully'
            }, status=status.HTTP_200_OK)
        except Booking.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Booking not found'
            }, status=status.HTTP_404_NOT_FOUND)

class PlayerVenuesView(APIView):
    """API view for venues available to players"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get all available venues with filters"""
        venues = Facility.objects.filter(is_active=True, courts__isnull=False).order_by('-created_at').distinct()
        # Only show venues that have at least one active court
        venues = venues.filter(courts__status='active').distinct()
        
        # Exclude obvious test data by default; can be overridden with ?include_test=1
        include_test = request.query_params.get('include_test') in ['1', 'true', 'True']
        if not include_test:
            venues = venues.exclude(
                Q(name__icontains='test') | Q(description__icontains='test') |
                Q(name__icontains='dummy') | Q(description__icontains='dummy')
            )
        
        # Apply search filter
        search_query = request.query_params.get('search')
        if search_query:
            venues = venues.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(city__icontains=search_query) |
                Q(address__icontains=search_query) |
                Q(courts__sport__name__icontains=search_query)
            ).distinct()
        
        # Apply sport filter
        sport_filter = request.query_params.get('sport')
        if sport_filter:
            venues = venues.filter(courts__sport__name__icontains=sport_filter)
        
        # Apply price filters
        price_min = request.query_params.get('price_min')
        if price_min:
            venues = venues.filter(courts__price_per_hour__gte=price_min)
        
        price_max = request.query_params.get('price_max')
        if price_max:
            venues = venues.filter(courts__price_per_hour__lte=price_max)
        
        # Apply location filter
        location_filter = request.query_params.get('location')
        if location_filter:
            venues = venues.filter(
                Q(city__icontains=location_filter) | 
                Q(address__icontains=location_filter)
            )
        
        # Pagination
        paginator = Paginator(venues, 12)
        page_number = request.query_params.get('page', 1)
        page_obj = paginator.get_page(page_number)
        
        return Response({
            'success': True,
            'data': {
                'venues': FacilitySerializer(page_obj, many=True, context={'request': request}).data,
                'pagination': {
                    'count': paginator.count,
                    'pages': paginator.num_pages,
                    'current_page': page_obj.number,
                    'has_next': page_obj.has_next(),
                    'has_previous': page_obj.has_previous()
                }
            }
        }, status=status.HTTP_200_OK)

class PlayerVenueDetailView(APIView):
    """API view for individual venue details"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, venue_id):
        """Get venue details with courts and availability"""
        try:
            venue = Facility.objects.get(id=venue_id, is_active=True)
            
            # Get courts with availability
            courts = venue.courts.all()
            courts_data = []
            
            for court in courts:
                # Get requested date or today
                date_param = request.query_params.get('date')
                if date_param:
                    try:
                        ref_date = datetime.strptime(date_param, '%Y-%m-%d').date()
                    except Exception:
                        ref_date = timezone.now().date()
                else:
                    ref_date = timezone.now().date()
                # Get all time slots for this court
                all_slots = TimeSlot.objects.filter(court=court, is_available=True).order_by('start_time')
                
                # Filter out slots that are already booked
                available_slots = []
                for slot in all_slots:
                    # Check if this time slot is booked for today
                    is_booked = Booking.objects.filter(
                        court=court,
                        booking_date=ref_date,
                        start_time__lt=slot.end_time,
                        end_time__gt=slot.start_time,
                        status__in=['confirmed', 'pending']
                    ).exists()
                    
                    if not is_booked:
                        available_slots.append(slot)
                
                courts_data.append({
                    'id': court.id,
                    'name': court.name,
                    'sport': court.sport.name if court.sport else None,
                    'price_per_hour': court.price_per_hour,
                    'description': court.description,
                    'images': [request.build_absolute_uri(photo.image.url) for photo in court.photos.all()],
                    'latitude': court.latitude,
                    'longitude': court.longitude,
                    'available_slots': TimeSlotSerializer(available_slots, many=True).data
                })
            
            venue_data = FacilitySerializer(venue, context={'request': request}).data
            venue_data['courts'] = courts_data
            # Fallback: if facility doesn't have coords, use first court with coords
            if not venue_data.get('latitude') or not venue_data.get('longitude'):
                for c in courts_data:
                    if c.get('latitude') and c.get('longitude'):
                        venue_data['latitude'] = c['latitude']
                        venue_data['longitude'] = c['longitude']
                        break
            
            return Response({
                'success': True,
                'data': venue_data
            }, status=status.HTTP_200_OK)
        except Facility.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Venue not found'
            }, status=status.HTTP_404_NOT_FOUND) 

class PlayerVenueReviewsView(APIView):
    """List reviews for a venue (all courts under the facility)"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, venue_id):
        try:
            venue = Facility.objects.get(id=venue_id, is_active=True)
            ratings = CourtRating.objects.filter(court__facility=venue).order_by('-created_at')
            data = CourtRatingSerializer(ratings, many=True).data
            return Response({'success': True, 'data': data}, status=status.HTTP_200_OK)
        except Facility.DoesNotExist:
            return Response({'success': False, 'message': 'Venue not found'}, status=status.HTTP_404_NOT_FOUND)

class PlayerCreateReviewView(APIView):
    """Create a review for a court using a past booking"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
            # Optional: ensure booking is completed
            # if booking.status != 'completed':
            #     return Response({'success': False, 'message': 'You can only review completed bookings'}, status=400)
            # Prevent duplicate review for the same booking
            if hasattr(booking, 'rating'):
                return Response({'success': False, 'message': 'You have already reviewed this booking'}, status=400)

            rating_value = int(request.data.get('rating', 0))
            review_text = request.data.get('review', '')
            if rating_value < 1 or rating_value > 5:
                return Response({'success': False, 'message': 'Rating must be between 1 and 5'}, status=400)

            rating = CourtRating.objects.create(
                booking=booking,
                court=booking.court,
                user=request.user,
                rating=rating_value,
                review=review_text
            )
            return Response({'success': True, 'data': CourtRatingSerializer(rating).data}, status=status.HTTP_201_CREATED)
        except Booking.DoesNotExist:
            return Response({'success': False, 'message': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

class PaymentViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def _get_client(self):
        key_id = os.environ.get('RAZORPAY_KEY_ID', getattr(settings, 'RAZORPAY_KEY_ID', ''))
        key_secret = os.environ.get('RAZORPAY_KEY_SECRET', getattr(settings, 'RAZORPAY_KEY_SECRET', ''))
        return razorpay.Client(auth=(key_id, key_secret))

    @action(detail=False, methods=['post'])
    def create_order(self, request):
        """Create a Razorpay order based on booking intent (amount in INR paise)."""
        try:
            amount = int(request.data.get('amount'))  # amount in paise
            currency = request.data.get('currency', 'INR')
            receipt = request.data.get('receipt', f'receipt_{request.user.id}_{timezone.now().timestamp()}')
            notes = request.data.get('notes', {})

            client = self._get_client()
            order = client.order.create({
                'amount': amount,
                'currency': currency,
                'receipt': receipt,
                'payment_capture': 1,
                'notes': notes,
            })
            return Response({'success': True, 'order': order})
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def verify_and_book(self, request):
        """Verify Razorpay payment signature, then create a booking."""
        try:
            # Verify signature
            order_id = request.data.get('razorpay_order_id')
            payment_id = request.data.get('razorpay_payment_id')
            signature = request.data.get('razorpay_signature')

            if not (order_id and payment_id and signature):
                return Response({'success': False, 'message': 'Missing payment verification fields'}, status=status.HTTP_400_BAD_REQUEST)

            client = self._get_client()
            params_dict = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature,
            }
            client.utility.verify_payment_signature(params_dict)

            # Create booking
            booking_payload = {
                'court': request.data.get('court'),
                'booking_date': request.data.get('booking_date'),
                'start_time': request.data.get('start_time'),
                'end_time': request.data.get('end_time'),
                'special_requests': request.data.get('special_requests', ''),
            }
            # Quick overlap guard before serializer (not a substitute for serializer's atomic check)
            try:
                court_id = int(booking_payload['court'])
                booking_date = booking_payload['booking_date']
                start_time = booking_payload['start_time']
                end_time = booking_payload['end_time']
                if court_id and booking_date and start_time and end_time:
                    overlap = Booking.objects.filter(
                        court_id=court_id,
                        booking_date=booking_date,
                        status__in=['pending', 'confirmed'],
                        start_time__lt=end_time,
                        end_time__gt=start_time
                    ).exists()
                    if overlap:
                        return Response({'success': False, 'message': 'Time slot is already booked'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception:
                pass
            serializer = BookingCreateSerializer(data=booking_payload, context={'request': request})
            if serializer.is_valid():
                booking = serializer.save()
                # Notify owner about new booking
                try:
                    owner_user = booking.facility.owner
                    EmailService.send_booking_created_owner(owner_user, booking)
                except Exception as e:
                    print(f"Error sending owner booking email: {e}")
                return Response({'success': True, 'message': 'Booking confirmed', 'data': BookingSerializer(booking).data})
            else:
                return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except razorpay.errors.SignatureVerificationError:
            return Response({'success': False, 'message': 'Payment signature verification failed'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST) 