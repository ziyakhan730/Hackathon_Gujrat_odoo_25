import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star, MapPin, Clock, DollarSign, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { venuesAPI, sportsAPI } from '@/services/api';

interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  rating: number;
  total_reviews: number;
  starting_price: number;
  sports: Array<{
    id: number;
    name: string;
    icon: string;
  }>;
  photos: Array<{
    id: number;
    image: string;
    is_primary: boolean;
  }>;
}

interface Sport {
  id: number;
  name: string;
  icon: string;
  description: string;
  total_venues: number;
}

export default function UserHome() {
  const navigate = useNavigate();
  const [popularVenues, setPopularVenues] = useState<Venue[]>([]);
  const [popularSports, setPopularSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load popular venues and sports
      const [venuesData, sportsData] = await Promise.all([
        venuesAPI.getPopular(),
        sportsAPI.getPopular()
      ]);

      setPopularVenues(venuesData.results || venuesData || []);
      setPopularSports(sportsData.results || sportsData || []);
    } catch (error) {
      console.error('Error loading home data:', error);
      toast.error('Failed to load home data');
    } finally {
      setLoading(false);
    }
  };

  const handleVenueClick = (venueId: number) => {
    navigate(`/venues/${venueId}`);
  };

  const handleSportClick = (sportId: number) => {
    navigate(`/venues?sport=${sportId}`);
  };

  const handleViewAllVenues = () => {
    navigate('/venues');
  };

  const handleViewAllSports = () => {
    navigate('/venues');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading amazing venues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Welcome Banner/Carousel */}
      <section className="relative overflow-hidden">
        <Carousel className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="relative h-[400px] bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-center text-white px-4">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-bold mb-4"
                  >
                    Find Your Perfect Court
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl md:text-2xl mb-8"
                  >
                    Book sports venues instantly and play your favorite games
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button 
                      size="lg" 
                      className="bg-white text-blue-600 hover:bg-gray-100"
                      onClick={handleViewAllVenues}
                    >
                      Explore Venues
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="relative h-[400px] bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-center text-white px-4">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-bold mb-4"
                  >
                    Multiple Sports Available
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl md:text-2xl mb-8"
                  >
                    From tennis to basketball, find courts for every sport
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button 
                      size="lg" 
                      className="bg-white text-green-600 hover:bg-gray-100"
                      onClick={handleViewAllSports}
                    >
                      Browse Sports
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="relative h-[400px] bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-center text-white px-4">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-bold mb-4"
                  >
                    Instant Booking
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl md:text-2xl mb-8"
                  >
                    Book your preferred time slot with just a few clicks
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button 
                      size="lg" 
                      className="bg-white text-orange-600 hover:bg-gray-100"
                      onClick={handleViewAllVenues}
                    >
                      Start Booking
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </section>

      {/* Quick Stats */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-gray-900">50+</h3>
                  <p className="text-gray-600">Active Venues</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-gray-900">1000+</h3>
                  <p className="text-gray-600">Bookings Made</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-gray-900">4.8</h3>
                  <p className="text-gray-600">Average Rating</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-gray-900">24/7</h3>
                  <p className="text-gray-600">Support Available</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Venues */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-gray-900"
            >
              Popular Venues
            </motion.h2>
            <Button 
              variant="outline" 
              onClick={handleViewAllVenues}
              className="hover:bg-blue-50"
            >
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularVenues.slice(0, 6).map((venue, index) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleVenueClick(venue.id)}
                >
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={venue.photos?.[0]?.image || '/placeholder-venue.jpg'}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/90 text-gray-800">
                        <Star className="h-3 w-3 mr-1" />
                        {venue.rating.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {venue.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{venue.city}, {venue.state}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-wrap gap-1">
                        {venue.sports.slice(0, 2).map((sport) => (
                          <Badge key={sport.id} variant="outline" className="text-xs">
                            {sport.name}
                          </Badge>
                        ))}
                        {venue.sports.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{venue.sports.length - 2} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-green-600 font-semibold">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {venue.starting_price}/hr
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Sports */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-gray-900"
            >
              Popular Sports
            </motion.h2>
            <Button 
              variant="outline" 
              onClick={handleViewAllSports}
              className="hover:bg-blue-50"
            >
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularSports.slice(0, 6).map((sport, index) => (
              <motion.div
                key={sport.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="text-center hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleSportClick(sport.id)}
                >
                  <CardContent className="p-4">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {sport.icon}
                    </div>
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-blue-600 transition-colors">
                      {sport.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {sport.total_venues} venues
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 