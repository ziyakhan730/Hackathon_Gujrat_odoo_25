import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star, MapPin, Clock, DollarSign, Phone, Mail, Globe, Users, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { playerAPI } from '@/services/api';
import { Map } from '@/components/ui/map/Map';

interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  total_reviews: number;
  starting_price: number;
  venue_type: string;
  opening_time: string;
  closing_time: string;
  sports: string[]; // player API returns strings
  amenities: string[]; // player API returns strings
  photos: Array<{
    id: number;
    image: string;
    caption: string;
    is_primary: boolean;
  }>;
  courts: Array<{
    id: number;
    name: string;
    sport: string; // player API returns sport name
    price_per_hour: number;
    description: string;
    images: string[];
    available_slots: Array<{
      id: number;
      start_time: string;
      end_time: string;
      is_available: boolean;
    }>;
  }>;
  reviews: Array<{
    id: number;
    user_name: string;
    rating: number;
    review: string;
    created_at: string;
  }>;
  latitude?: number;
  longitude?: number;
}

export default function VenueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

  const handleBookNow = () => {
    if (venue) {
      navigate(`/player/venues/${venue.id}/book`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading venue details...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
              <div className="flex items-center text-gray-600 mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{venue.address}, {venue.city}, {venue.state} {venue.pincode}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-semibold">{venue.rating?.toFixed?.(1) || '0.0'}</span>
                  <span className="text-gray-500 ml-1">({venue.total_reviews || 0} reviews)</span>
                </div>
                <div className="text-green-600 font-semibold">
                  Starting from ₹{venue.starting_price}/hr
                </div>
              </div>
              <Button onClick={handleBookNow}>Book Now</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Photo Gallery */}
            <Card className="mb-8">
              <CardContent className="p-0">
                <Carousel className="w-full">
                  <CarouselContent>
                    {(venue.photos || []).map((photo, index) => (
                      <CarouselItem key={photo.id || index}>
                        <div className="relative h-96">
                          <img
                            src={photo.image}
                            alt={photo.caption || `${venue.name} - Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {photo.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                              <p className="text-sm">{photo.caption}</p>
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="courts">Courts</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {venue.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {venue.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Available Sports</h3>
                        <div className="flex flex-wrap gap-2">
                          {(venue.sports || []).map((sport, idx) => (
                            <Badge key={`${sport}-${idx}`} variant="outline" className="text-sm">
                              {sport}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Opening Hours</h3>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{venue.opening_time} - {venue.closing_time}</span>
                        </div>
                      </div>
                    </div>

                    {typeof venue.latitude === 'number' && typeof venue.longitude === 'number' && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-lg mb-3">Location</h3>
                        <Map
                          center={{ lat: Number(venue.latitude), lng: Number(venue.longitude) }}
                          zoom={15}
                          height={300}
                          markers={[{
                            id: venue.id,
                            position: { lat: Number(venue.latitude), lng: Number(venue.longitude) },
                            title: venue.name,
                            description: `${venue.address}, ${venue.city}, ${venue.state} ${venue.pincode}`,
                          }]}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courts" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Courts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(venue.courts || []).map((court) => (
                        <div key={court.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          {/* Court Image */}
                          {court.images && court.images.length > 0 ? (
                            <div className="h-40 w-full overflow-hidden bg-gray-100">
                              <img
                                src={court.images[0]}
                                alt={`${court.name} photo`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-40 w-full flex items-center justify-center bg-gray-100 text-gray-400">
                              <span>No image</span>
                            </div>
                          )}
                          
                          {/* Court Info */}
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{court.name}</h4>
                              <Badge>
                                {court.sport}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>{court.description}</p>
                              <p className="text-green-600 font-semibold">₹{court.price_per_hour}/hour</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Facilities & Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {(venue.amenities || []).map((amenity, idx) => (
                        <div key={`${amenity}-${idx}`} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <span className="text-sm font-medium">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(venue.reviews || []).length > 0 ? (
                      <div className="space-y-4">
                        {venue.reviews.map((review) => (
                          <div key={review.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <span className="font-semibold">{review.user_name}</span>
                                <div className="flex items-center ml-2">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.review}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No reviews yet. Be the first to review this venue!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Booking Card */}
            <Card className="sticky top-8 mb-6">
              <CardHeader>
                <CardTitle>Book This Venue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ₹{venue.starting_price}
                  </div>
                  <div className="text-gray-600">per hour</div>
                </div>
                
                <Button 
                  onClick={handleBookNow}
                  className="w-full"
                  size="lg"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
                
                <div className="text-center text-sm text-gray-500">
                  Instant booking • No hidden fees
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {venue.phone && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open(`tel:${venue.phone}`)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {venue.phone}
                  </Button>
                )}
                
                {venue.email && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open(`mailto:${venue.email}`)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {venue.email}
                  </Button>
                )}
                
                {venue.website && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open(venue.website, '_blank')}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Venue Type</span>
                  <span className="font-medium">{venue.venue_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sports Available</span>
                  <span className="font-medium">{venue.sports?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Courts Available</span>
                  <span className="font-medium">{venue.courts?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Amenities</span>
                  <span className="font-medium">{venue.amenities?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 