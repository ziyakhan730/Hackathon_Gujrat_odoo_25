import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

interface Booking {
  id: number;
  booking_id: string;
  user: string; // Full name from backend
  user_email: string;
  court: string; // Court name from backend
  facility: string; // Facility name from backend
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  price_per_hour: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  special_requests?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

interface BookingTableProps {
  bookings: Booking[];
  onView: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
  onStatusChange: (bookingId: number, status: string) => void;
}

export function BookingTable({ bookings, onView, onEdit, onStatusChange }: BookingTableProps) {
  // Ensure bookings is always an array
  const safeBookings = Array.isArray(bookings) ? bookings : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'no_show':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
      case 'no_show':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (startTime: string, endTime: string) => {
    try {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      return `${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}-${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    } catch (error) {
      return `${startTime}-${endTime}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Booking Overview</CardTitle>
          <div className="flex space-x-2">
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Search bookings..." className="w-64" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Court</th>
                <th className="text-left p-4 font-medium">Date & Time</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Payment</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeBookings.map((booking) => (
                <tr key={booking.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{booking.user}</p>
                      <p className="text-sm text-muted-foreground">{booking.user_email}</p>
                      <p className="text-xs text-muted-foreground">ID: {booking.booking_id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium">{booking.court}</p>
                    <p className="text-sm text-muted-foreground">{booking.facility}</p>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(booking.start_time, booking.end_time)}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium">₹{booking.total_amount}</p>
                    <p className="text-sm text-muted-foreground">₹{booking.price_per_hour}/hr</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1 capitalize">{booking.status}</span>
                      </Badge>
                      <Select 
                        value={booking.status} 
                        onValueChange={(value) => onStatusChange(booking.id, value)}
                      >
                        <SelectTrigger className="w-24 h-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmed">Confirm</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="cancelled">Cancel</SelectItem>
                          <SelectItem value="completed">Complete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={getPaymentStatusColor(booking.payment_status)}>
                      <span className="capitalize">{booking.payment_status}</span>
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onView(booking)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onEdit(booking)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {safeBookings.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <p>No bookings found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 