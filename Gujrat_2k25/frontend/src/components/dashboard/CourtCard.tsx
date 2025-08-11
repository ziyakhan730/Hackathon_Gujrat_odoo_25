import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Edit, Eye, MoreVertical, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface Court {
  id: number;
  name: string;
  sport: string;
  status: 'active' | 'maintenance' | 'inactive';
  price: number;
  bookings: number;
  rating: number;
  operatingHours: string;
  amenities: string[];
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
            <p className="text-sm text-muted-foreground">{court.sport}</p>
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
            <span className="font-medium">₹{court.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total bookings:</span>
            <span className="font-medium">{court.bookings}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Rating:</span>
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 font-medium">{court.rating}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Operating hours:</span>
            <span className="text-sm font-medium">{court.operatingHours}</span>
          </div>
          
          {court.amenities.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">Amenities:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {court.amenities.slice(0, 3).map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                {court.amenities.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{court.amenities.length - 3} more
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