import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Star, 
  Clock, 
  TrendingUp, 
  Users, 
  Trophy,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { playerAPI } from '@/services/api';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  rating: number;
  review_count: number;
  starting_price: number;
  sports: string[];
  amenities: string[];
  images: string[];
}

interface Booking {
  id: number;
  venue_name: string;
  court_name: string;
  sport_type: string;
  date: string;
  time_slot: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  total_amount: number;
}

export default function PlayerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [popularVenues, setPopularVenues] = useState<Venue[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    active_bookings: 0,
    venues_visited: 0,
    total_bookings: 0,
    hours_played: 0,
  });

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const dashboardData = await playerAPI.getDashboard();
        
        if (dashboardData.success) {
          const { stats, recent_bookings, popular_venues } = dashboardData.data;
          setStats(stats);
          setRecentBookings(recent_bookings);
          setPopularVenues(popular_venues);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-6 bg-gray-900 min-h-screen">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg px-5 py-4 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="text-blue-100">
          Ready for your next game? Explore venues and book your favorite courts.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Bookings</p>
                <p className="text-2xl font-bold text-white">{stats.active_bookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <MapPin className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Venues Visited</p>
                <p className="text-2xl font-bold text-white">{stats.venues_visited}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Star className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Bookings</p>
                <p className="text-2xl font-bold text-white">{stats.total_bookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Trophy className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Hours Played</p>
                <p className="text-2xl font-bold text-white">{stats.hours_played}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Recent Bookings</CardTitle>
              <Link to="/player/bookings">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-white">{booking.venue_name}</p>
                      <p className="text-sm text-gray-400">
                        {booking.court_name} • {booking.sport_type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(booking.date)} at {booking.time_slot}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <p className="text-sm font-medium text-white mt-1">
                        ₹{booking.total_amount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No bookings yet</p>
                <p className="text-gray-500 text-sm mb-4">Start your sports journey by booking your first court</p>
                <Link to="/player/venues">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    Book Your First Court
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Venues */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Popular Venues</CardTitle>
              <Link to="/player/venues">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  Explore All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {popularVenues.length > 0 ? (
              <div className="space-y-4">
                {popularVenues.slice(0, 3).map((venue) => (
                  <Link key={venue.id} to={`/player/venues/${venue.id}`}>
                    <div className="flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {venue.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{venue.name}</p>
                        <p className="text-sm text-gray-400">{venue.city}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-400 ml-1">
                              {venue.rating} ({venue.review_count})
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">
                            From ₹{venue.starting_price}/hr
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No venues available</p>
                <p className="text-gray-500 text-sm mb-4">We're working on adding venues in your area</p>
                <Button variant="outline" className="border-gray-600 text-gray-400">
                  Check Back Later
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Link to="/player/venues">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gray-800 border-gray-700 hover:bg-gray-750">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Find Venues</h3>
              <p className="text-sm text-gray-400">Discover sports venues near you</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/player/bookings">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gray-800 border-gray-700 hover:bg-gray-750">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">My Bookings</h3>
              <p className="text-sm text-gray-400">View and manage your bookings</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/player/profile">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gray-800 border-gray-700 hover:bg-gray-750">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Profile</h3>
              <p className="text-sm text-gray-400">Update your profile and preferences</p>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>
  );
} 