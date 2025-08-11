from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from .models import (
    Facility, FacilityPhoto, Sport, FacilitySport, Amenity, FacilityAmenity,
    Court, TimeSlot, Booking, CourtRating, Notification
)
from .serializers import (
    SportSerializer, AmenitySerializer, FacilitySerializer, FacilityCreateSerializer,
    CourtSerializer, CourtCreateSerializer, TimeSlotSerializer, BookingSerializer,
    BookingCreateSerializer, CourtRatingSerializer, NotificationSerializer,
    DashboardKPISerializer, BookingTrendSerializer, PeakHourSerializer, RecentBookingSerializer
)

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow owners to edit their facilities"""
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for the owner
        return obj.owner == request.user

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
        return CourtSerializer
    
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
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update booking status"""
        booking = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(Booking.BOOKING_STATUS_CHOICES):
            booking.status = new_status
            booking.save()
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
        total_earnings = Booking.objects.filter(
            facility__in=facilities, 
            payment_status='paid'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
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
        bookings = Booking.objects.filter(
            facility__in=facilities,
            booking_date__gte=start_date
        ).values('booking_date').annotate(
            bookings=Count('id'),
            earnings=Sum('total_amount')
        ).order_by('booking_date')
        
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