import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Edit, Eye, MoreVertical, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface Court {
  id: number;
  name: string;
  facility: string;
  sport: {
    id: number;
    name: string;
    icon: string;
    description: string;
  };
  description: string;
  price_per_hour: number;
  currency: string;
  court_number: string;
  surface_type: string;
  court_size: string;
  status: string;
  is_available: boolean;
  opening_time: string;
  closing_time: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  photos: Array<{
    id: number;
    image: string;
    caption: string;
    is_primary: boolean;
  }>;
  time_slots: Array<{
    id: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
    duration_hours: number;
  }>;
  created_at: string;
  updated_at: string;
  total_bookings: number;
  average_rating: number;
  total_earnings: number;
}

interface CourtCardProps {
  court: Court;
  onEdit: (court: Court) => void;
  onView: (court: Court) => void;
  onDelete: (courtId: number) => void;
}

export function CourtCard({ court, onEdit, onView, onDelete }: CourtCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'maintenance':
        return <AlertCircle className="h-4 w-4" />;
      case 'inactive':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{court.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{court.sport.name}</p>
            <p className="text-xs text-muted-foreground">{court.facility}</p>
          </div>
          <Badge className={getStatusColor(court.status)}>
            {getStatusIcon(court.status)}
            <span className="ml-1 capitalize">{court.status}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Price per hour:</span>
            <span className="font-medium">{court.currency} {court.price_per_hour}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total bookings:</span>
            <span className="font-medium">{court.total_bookings}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Rating:</span>
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 font-medium">{court.average_rating}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total earnings:</span>
            <span className="text-sm font-medium">{court.currency} {court.total_earnings}</span>
          </div>
          {court.opening_time && court.closing_time && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Operating hours:</span>
              <span className="text-sm font-medium">{court.opening_time} - {court.closing_time}</span>
            </div>
          )}
          {court.surface_type && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Surface:</span>
              <span className="text-sm font-medium">{court.surface_type}</span>
            </div>
          )}
          
          {/* Address Information */}
          {court.address && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground mb-1">Address:</p>
              <p className="text-xs">{court.address}</p>
              <p className="text-xs">{court.city}, {court.state} {court.pincode}</p>
            </div>
          )}
          
          {/* Time Slots */}
          {court.time_slots && court.time_slots.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground mb-1">Available Time Slots:</p>
              <div className="flex flex-wrap gap-1">
                {court.time_slots.slice(0, 3).map((slot, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {slot.start_time} - {slot.end_time}
                  </Badge>
                ))}
                {court.time_slots.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{court.time_slots.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(court)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView(court)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(court.id)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 