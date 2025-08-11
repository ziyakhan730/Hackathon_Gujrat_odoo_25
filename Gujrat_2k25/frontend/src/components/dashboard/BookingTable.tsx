import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

interface Booking {
  id: number;
  userName: string;
  userEmail: string;
  courtName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  createdAt: string;
}

interface BookingTableProps {
  bookings: Booking[];
  onView: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
  onStatusChange: (bookingId: number, status: string) => void;
}

export function BookingTable({ bookings, onView, onEdit, onStatusChange }: BookingTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
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
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{booking.userName}</p>
                      <p className="text-sm text-muted-foreground">{booking.userEmail}</p>
                      <p className="text-xs text-muted-foreground">ID: {booking.id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium">{booking.courtName}</p>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{new Date(booking.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">{booking.time}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium">₹{booking.amount}</p>
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
                    <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                      <span className="capitalize">{booking.paymentStatus}</span>
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
        
        {bookings.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <p>No bookings found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 