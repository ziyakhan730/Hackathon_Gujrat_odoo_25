import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, MapPin, Clock, DollarSign, Calendar as CalendarIcon, CreditCard, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { playerAPI, bookingsAPI, paymentsAPI } from '@/services/api';
import { format } from 'date-fns';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  rating: number;
  total_reviews: number;
  courts: Array<{
    id: number;
    name: string;
    sport: string; // player API returns sport name
    price_per_hour: number;
    description?: string;
    images?: string[];
    available_slots?: Array<{
      id: number;
      start_time: string;
      end_time: string;
      is_available: boolean;
    }>;
    time_slots?: Array<{
      id: number;
      start_time: string;
      end_time: string;
      is_available: boolean;
      price?: number;
    }>;
  }>;
}

interface BookingForm {
  court_id: number;
  date: Date | undefined;
  time_slot_id: number;
  duration_hours: number;
  special_requests: string;
  agree_to_terms: boolean;
}

export default function CourtBooking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    court_id: 0,
    date: undefined,
    time_slot_id: 0,
    duration_hours: 1,
    special_requests: '',
    agree_to_terms: false
  });
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);

  const displayCourtName = (name: string) =>
    name.replace(/\bno\s*slots\b/i, '').replace(/\s{2,}/g, ' ').trim();

  useEffect(() => {
    if (id) {
      loadVenueDetails();
    }
  }, [id]);

  const loadVenueDetails = async () => {
    try {
      setLoading(true);
      const res = await playerAPI.getVenue(parseInt(id!));
      if (res && res.success) {
        setVenue(res.data);
      } else {
        throw new Error('Failed to load venue');
      }
    } catch (error) {
      console.error('Error loading venue details:', error);
      toast.error('Failed to load venue details');
    } finally {
      setLoading(false);
    }
  };

  const handleCourtChange = (courtId: string) => {
    const court = venue?.courts.find(c => c.id === parseInt(courtId));
    setSelectedCourt(court);
    setBookingForm(prev => ({ ...prev, court_id: parseInt(courtId), time_slot_id: 0, duration_hours: 0 }));
    setSelectedSlotIds([]);
  };

  const handleDateChange = (date: Date | undefined) => {
    setBookingForm(prev => ({ ...prev, date, time_slot_id: 0, duration_hours: 0 }));
    setSelectedSlotIds([]);
    // Refetch availability for the selected date
    if (date && id) {
      const dateStr = format(date, 'yyyy-MM-dd');
      playerAPI.getVenueForDate(parseInt(id), dateStr).then((res) => {
        if (res && res.success) {
          setVenue(res.data);
          if (bookingForm.court_id) {
            const updatedCourt = res.data.courts.find((c: any) => c.id === bookingForm.court_id);
            setSelectedCourt(updatedCourt || null);
          }
        }
      }).catch(() => {});
    }
  };

  const getSlots = () => (selectedCourt?.available_slots || selectedCourt?.time_slots || []) as any[];

  const toggleSlot = (slotId: number) => {
    if (!selectedCourt) return;
    const slots = getSlots().filter((s: any) => s.is_available);
    let next = selectedSlotIds.includes(slotId)
      ? selectedSlotIds.filter(idv => idv !== slotId)
      : [...selectedSlotIds, slotId];
    // Compute contiguity
    const selected = slots.filter((s: any) => next.includes(s.id))
      .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
    if (selected.length > 1) {
      let contiguous = true;
      for (let i = 1; i < selected.length; i++) {
        if (selected[i - 1].end_time !== selected[i].start_time) {
          contiguous = false;
          break;
        }
      }
      if (!contiguous) {
        // Keep only the clicked slot as a reset for clarity
        next = [slotId];
        toast.error('Please select contiguous slots');
      }
    }
    setSelectedSlotIds(next);
    setBookingForm(prev => ({ ...prev, duration_hours: next.length }));
  };

  const handleDurationChange = (duration: string) => {
    setBookingForm(prev => ({ ...prev, duration_hours: parseInt(duration) }));
  };

  const calculateTotalPrice = () => {
    if (!selectedCourt || !bookingForm.duration_hours) return 0;
    const hourly = selectedCourt?.price_per_hour || 0;
    return hourly * bookingForm.duration_hours;
  };

  const isFormValid = () => {
    return (
      bookingForm.court_id > 0 &&
      bookingForm.date &&
      selectedSlotIds.length > 0 &&
      bookingForm.agree_to_terms
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) {
      toast.error('Please log in to make a booking');
      navigate('/login');
      return;
    }

    setProcessing(true);
    try {
      // 1) Create Razorpay order via backend
      const totalAmount = calculateTotalPrice();
      const amountPaise = Math.round(totalAmount * 100);
      const orderRes = await paymentsAPI.createOrder(amountPaise, `receipt_${Date.now()}`, {
        court_id: bookingForm.court_id,
      });
      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to create payment order');
      }

      const order = orderRes.order;

      // 2) Open Razorpay Checkout
      const options = {
        key: 'rzp_test_v5n8Topc32jGgR',
        amount: order.amount,
        currency: order.currency,
        name: 'QuickCourt',
        description: 'Court Booking Payment',
        order_id: order.id,
        prefill: {
          name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
          email: user?.email || '',
        },
        notes: {
          court_id: bookingForm.court_id,
        },
        theme: { color: '#4f46e5' },
        handler: async (response: any) => {
          try {
            // 3) Verify and create booking
            const payload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              court: bookingForm.court_id,
              booking_date: format(bookingForm.date!, 'yyyy-MM-dd'),
              start_time: (() => {
                const slots = getSlots().filter((s: any) => selectedSlotIds.includes(s.id))
                  .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
                return slots[0].start_time;
              })(),
              end_time: (() => {
                const slots = getSlots().filter((s: any) => selectedSlotIds.includes(s.id))
                  .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
                return slots[slots.length - 1].end_time;
              })(),
              special_requests: bookingForm.special_requests,
            };
            const verifyRes = await paymentsAPI.verifyAndBook(payload);
            if (verifyRes.success) {
              toast.success('Payment successful and booking confirmed!');
              navigate('/player/bookings');
            } else {
              throw new Error(verifyRes.message || 'Verification failed');
            }
          } catch (err: any) {
            console.error('Verification error:', err);
            toast.error(err.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          }
        }
      };

      if (!window.Razorpay) {
        // Dynamically load Razorpay script
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Venue Not Found</h2>
          <p className="text-gray-600 mb-4">The venue you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/player/venues')}>
            Back to Venues
          </Button>
        </div>
      </div>
    );
  }

  // Build slots array safely (moved earlier)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/player/venues/${id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Venue
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Book Court</h1>
              <p className="text-gray-600">{venue.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Court Selection */}
                <div>
                  <Label htmlFor="court">Select Court *</Label>
                  <Select 
                    value={bookingForm.court_id.toString()} 
                    onValueChange={handleCourtChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a court" />
                    </SelectTrigger>
                    <SelectContent>
                      {venue.courts.map((court) => {
                        const available = (court.available_slots?.length || 0) > 0;
                        return (
                          <SelectItem key={court.id} value={court.id.toString()}>
                            <div className="flex items-center justify-between w-full">
                              <span>{displayCourtName(court.name)}</span>
                              <Badge variant={available ? 'default' : 'secondary'}>
                                {available ? 'Available' : 'Unavailable'}
                              </Badge>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedCourt && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{selectedCourt.sport}</p>
                        </div>
                        <div className="text-green-600 font-semibold">
                          ₹{selectedCourt.price_per_hour}/hour
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date Selection */}
                <div>
                  <Label>Select Date *</Label>
                  <Calendar
                    mode="single"
                    selected={bookingForm.date}
                    onSelect={handleDateChange}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border mt-2"
                  />
                </div>

                {/* Time Slot Selection (multiple with checkboxes) */}
                {selectedCourt && bookingForm.date && (
                  <div>
                    <Label htmlFor="time-slot">Select Time Slot(s) *</Label>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getSlots()
                        .filter((slot: any) => slot.is_available)
                        .map((slot: any) => {
                          const checked = selectedSlotIds.includes(slot.id);
                          return (
                            <label key={slot.id} className={`flex items-center justify-between px-3 py-2 border rounded-md cursor-pointer ${checked ? 'bg-purple-50 border-purple-300' : ''}`}>
                              <div className="flex items-center gap-2">
                                <Checkbox checked={checked} onCheckedChange={() => toggleSlot(slot.id)} />
                                <span>{slot.start_time} - {slot.end_time}</span>
                              </div>
                              <span className="text-green-600">₹{selectedCourt.price_per_hour}</span>
                            </label>
                          );
                        })}
                    </div>
                    {selectedSlotIds.length > 0 && (
                      <p className="text-xs text-gray-600 mt-2">Selected duration: {selectedSlotIds.length} hour(s)</p>
                    )}
                  </div>
                )}

                {/* Duration Selection removed; computed from selected slots */}

                {/* Special Requests */}
                <div>
                  <Label htmlFor="special-requests">Special Requests</Label>
                  <Textarea
                    id="special-requests"
                    placeholder="Any special requests or requirements..."
                    value={bookingForm.special_requests}
                    onChange={(e) => setBookingForm(prev => ({ 
                      ...prev, 
                      special_requests: e.target.value 
                    }))}
                    rows={3}
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={bookingForm.agree_to_terms}
                    onCheckedChange={(checked) => setBookingForm(prev => ({ 
                      ...prev, 
                      agree_to_terms: checked as boolean 
                    }))}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the terms and conditions and cancellation policy *
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Venue Info */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">{venue.name}</h3>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{venue.city}, {venue.state}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                    <span>{venue.rating.toFixed(1)} ({venue.total_reviews} reviews)</span>
                  </div>
                </div>

                {/* Booking Details */}
                {selectedCourt && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Court:</span>
                      <span className="font-medium">{displayCourtName(selectedCourt.name)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sport:</span>
                      <span className="font-medium">{selectedCourt.sport}</span>
                    </div>
                    {bookingForm.date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {format(bookingForm.date, 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                    {selectedSlotIds.length > 0 && (() => {
                      const slots = getSlots().filter((s: any) => selectedSlotIds.includes(s.id))
                        .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
                      return (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">{slots[0].start_time} - {slots[slots.length - 1].end_time}</span>
                        </div>
                      );
                    })()}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{Math.max(bookingForm.duration_hours, selectedSlotIds.length)} hour(s)</span>
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                {selectedCourt && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per hour:</span>
                      <span>₹{selectedCourt.price_per_hour}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span>{Math.max(bookingForm.duration_hours, selectedSlotIds.length)} hour(s)</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">₹{calculateTotalPrice()}</span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <Button 
                  onClick={handleSubmit}
                  disabled={!isFormValid() || processing}
                  className="w-full"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-gray-500">
                  Secure payment • Instant confirmation
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 