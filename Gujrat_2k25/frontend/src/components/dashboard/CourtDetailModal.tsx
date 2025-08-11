import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Star, Phone, Mail, Globe, Calendar, Users, DollarSign } from 'lucide-react';
import { formatINR } from '../../lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Map } from '@/components/ui/map/Map';

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

interface CourtDetailModalProps {
  court: Court | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (court: Court) => void;
}

export function CourtDetailModal({ court, isOpen, onClose, onEdit }: CourtDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!court) return null;

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

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMapUrl = () => {
    if (court.latitude && court.longitude) {
      return `https://www.openstreetmap.org/?mlat=${court.latitude}&mlon=${court.longitude}&zoom=15`;
    }
    const address = `${court.address}, ${court.city}, ${court.state} ${court.pincode}`;
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">{court.name}</h2>
                <p className="text-muted-foreground">{court.sport.name} • {court.facility}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(court.status)}>
                  {court.status}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => onEdit(court)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex h-[calc(90vh-120px)]">
              {/* Left Panel - Photos */}
              <div className="w-1/2 p-6 border-r">
                {court.photos && court.photos.length > 0 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {court.photos.map((photo, index) => (
                        <CarouselItem key={photo.id}>
                          <div className="aspect-video rounded-lg overflow-hidden">
                            <img
                              src={photo.image}
                              alt={photo.caption || `Court photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {photo.caption && (
                            <p className="text-sm text-muted-foreground mt-2 text-center">
                              {photo.caption}
                            </p>
                          )}
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                ) : (
                  <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">No photos available</p>
                  </div>
                )}
              </div>

              {/* Right Panel - Details */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Court Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Price per hour:</span>
                          <span className="font-medium">{court.currency} {court.price_per_hour}</span>
                        </div>
                        {court.surface_type && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Surface type:</span>
                            <span className="font-medium">{court.surface_type}</span>
                          </div>
                        )}
                        {court.court_size && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Court size:</span>
                            <span className="font-medium">{court.court_size}</span>
                          </div>
                        )}
                        {court.opening_time && court.closing_time && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Operating hours:</span>
                            <span className="font-medium">
                              {formatTime(court.opening_time)} - {formatTime(court.closing_time)}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total bookings:</span>
                          <span className="font-medium">{court.total_bookings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Average rating:</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 font-medium">{court.average_rating}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total earnings:</span>
                          <span className="font-medium">{formatINR(court.total_earnings)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {court.description && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{court.description}</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Available Time Slots</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {court.time_slots && court.time_slots.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {court.time_slots.map((slot) => (
                              <Badge
                                key={slot.id}
                                variant={slot.is_available ? "default" : "secondary"}
                                className="justify-center"
                              >
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No time slots configured</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="location" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Address</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{court.address}</p>
                            <p className="text-sm text-muted-foreground">
                              {court.city}, {court.state} {court.pincode}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Map</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {court.latitude && court.longitude ? (
                          <div className="rounded-lg overflow-hidden border">
                            <Map
                              center={{ lat: Number(court.latitude), lng: Number(court.longitude) }}
                              zoom={15}
                              height={260}
                              markers={[{
                                id: court.id,
                                position: { lat: Number(court.latitude), lng: Number(court.longitude) },
                                title: court.name,
                                description: `${court.address}, ${court.city}, ${court.state} ${court.pincode}`,
                              }]}
                            />
                          </div>
                        ) : (
                          <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                            <p className="text-muted-foreground text-sm">Set coordinates to view the map</p>
                          </div>
                        )}

                        {/* Directions */}
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const hasCoords = !!(court.latitude && court.longitude);
                              const url = hasCoords
                                ? `https://www.google.com/maps/dir/?api=1&destination=${court.latitude},${court.longitude}`
                                : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${court.address}, ${court.city}, ${court.state} ${court.pincode}`)}`;
                              window.open(url, '_blank');
                            }}
                          >
                            Open in Google Maps
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const hasCoords = !!(court.latitude && court.longitude);
                              const url = hasCoords
                                ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${court.latitude}%2C${court.longitude}`
                                : `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${court.address}, ${court.city}, ${court.state} ${court.pincode}`)}`;
                              window.open(url, '_blank');
                            }}
                          >
                            Open in OpenStreetMap
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 