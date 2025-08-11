import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FullUserAvatar } from '@/components/ui/user-avatar';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, MapPin, Clock, DollarSign, Edit, User, Mail, Phone, Calendar, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { bookingsAPI, authAPI } from '@/services/api';
import { format } from 'date-fns';

interface Booking {
  id: number;
  booking_id: string;
  court: {
    id: number;
    name: string;
    sport: string;
  };
  facility: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
  };
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_amount: number;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  payment_status: 'paid' | 'pending' | 'failed' | 'refunded';
  created_at: string;
}

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  country_code: string;
  user_type: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
}

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    country_code: user?.country_code || '+91'
  });

  useEffect(() => {
    loadUserBookings();
  }, []);

  const loadUserBookings = async () => {
    try {
      setBookingsLoading(true);
      const res = await bookingsAPI.getUserBookings();
      if (res && res.success) {
        setBookings(res.data.bookings || []);
      } else {
        // Fallback if API returns plain list
        setBookings(res.results || res || []);
      }
    } catch (error) {
      console.error('Error loading user bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setBookingsLoading(false);
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const updatedUser = await authAPI.updateProfile(editForm);
      updateUser(updatedUser);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await bookingsAPI.cancel(bookingId);
      toast.success('Booking cancelled successfully');
      loadUserBookings(); // Reload bookings
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const canCancelBooking = (booking: Booking) => {
    const bookingDate = new Date(booking.booking_date);
    const now = new Date();
    const hoursDiff = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return booking.status === 'confirmed' && hoursDiff > 24; // Can cancel if more than 24 hours before
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account and view your bookings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {editMode ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="text-center">
                  <AvatarUpload 
                    user={user} 
                    size="xl" 
                    className="mx-auto mb-4"
                    onAvatarUpdate={(imageUrl) => {
                      if (user) {
                        updateUser({ ...user, profile_picture: imageUrl });
                      }
                    }}
                  />
                  <h2 className="text-xl font-semibold">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <p className="text-gray-600">{user?.user_type}</p>
                </div>

                {/* Profile Details */}
                {editMode ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          value={editForm.first_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={editForm.last_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="country_code">Code</Label>
                        <Input
                          id="country_code"
                          value={editForm.country_code}
                          onChange={(e) => setEditForm(prev => ({ ...prev, country_code: e.target.value }))}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input
                          id="phone_number"
                          value={editForm.phone_number}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleEditSubmit} className="flex-1">
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditMode(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{user?.email}</p>
                        <div className="flex items-center space-x-1">
                          {user?.is_email_verified ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className="text-xs text-gray-500">
                            {user?.is_email_verified ? 'Verified' : 'Not verified'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">
                          {user?.country_code} {user?.phone_number}
                        </p>
                        <div className="flex items-center space-x-1">
                          {user?.is_phone_verified ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className="text-xs text-gray-500">
                            {user?.is_phone_verified ? 'Verified' : 'Not verified'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Member Since</p>
                        <p className="text-xs text-gray-500">
                          {user?.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading bookings...</p>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{booking.facility.name}</h3>
                            <p className="text-gray-600 text-sm">
                              {booking.court.name} • {booking.court.sport}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-1">
                              {getStatusBadge(booking.status)}
                              {getPaymentStatusBadge(booking.payment_status)}
                            </div>
                            <p className="text-sm text-gray-500">
                              #{booking.booking_id}
                            </p>
                          </div>
                        </div>

                        {/* Image */}
                        { (booking as any).court_image && (
                          <div className="mb-3 h-40 w-full overflow-hidden rounded-md">
                            <img
                              src={(booking as any).court_image}
                              alt={booking.court.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">Date</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">Time</p>
                              <p className="text-xs text-gray-500">
                                {booking.start_time} - {booking.end_time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">Total</p>
                              <p className="text-xs text-gray-500">
                                ₹{booking.total_amount}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{booking.facility.address}, {booking.facility.city}, {booking.facility.state}</span>
                          </div>
                          {canCancelBooking(booking) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <Calendar className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start exploring venues and make your first booking!
                    </p>
                    <Button onClick={() => window.location.href = '/player/venues'}>
                      Browse Venues
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 