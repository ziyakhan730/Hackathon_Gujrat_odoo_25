import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { playerAPI } from '@/services/api';
import { Search, MapPin, Star, Clock, DollarSign, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Map, MapMarker } from '@/components/ui/map/Map';
import { useLocation } from '@/contexts/LocationContext';

interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  rating: number;
  review_count: number;
  starting_price: number;
  sports: string[];
  amenities: string[];
  images: string[];
  total_courts: number;
  total_bookings: number;
  total_earnings: number;
}

interface FilterState {
  search: string;
  sport: string;
  priceMin: string;
  priceMax: string;
  location: string;
}

export default function Venues() {
  const { toast } = useToast();
  const { location } = useLocation();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sport: '',
    priceMin: '',
    priceMax: '',
    location: '',
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    pages: 1,
    count: 0,
    has_next: false,
    has_previous: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Load venues
  useEffect(() => {
    loadVenues();
  }, [pagination.current_page]);

  const loadVenues = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.sport) params.append('sport', filters.sport);
      if (filters.priceMin) params.append('price_min', filters.priceMin);
      if (filters.priceMax) params.append('price_max', filters.priceMax);
      if (filters.location) params.append('location', filters.location);
      params.append('page', pagination.current_page.toString());
      // Ensure test facilities are included for development/demo
      params.append('include_test', '1');

      const response = await playerAPI.getVenues(params.toString());
      
      if (response.success) {
        setVenues(response.data.venues);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error loading venues:', error);
      toast({
        title: "Error",
        description: "Failed to load venues",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, current_page: 1 }));
    loadVenues();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      sport: '',
      priceMin: '',
      priceMax: '',
      location: '',
    });
    setPagination(prev => ({ ...prev, current_page: 1 }));
    loadVenues();
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const formatPrice = (price: number) => {
    return `₹${price}/hour`;
  };

  // Build markers when venues update and they have coordinates available in future
  const markers: MapMarker[] = venues
    // @ts-ignore expect backend to add latitude/longitude later; skip missing for now
    .filter((v: any) => typeof v.latitude === 'number' && typeof v.longitude === 'number')
    .map((v: any) => ({
      id: v.id,
      position: { lat: v.latitude, lng: v.longitude },
      title: v.name,
      description: `${v.city}, ${v.state} • ${formatPrice(v.starting_price)}`,
    }));

  const center = location
    ? { lat: location.latitude, lng: location.longitude }
    : (markers[0]?.position ?? { lat: 20.5937, lng: 78.9629 }); // India fallback

  const getSportIcon = (sport: string) => {
    const icons: { [key: string]: string } = {
      'Tennis': '🎾',
      'Badminton': '🏸',
      'Basketball': '🏀',
      'Cricket': '🏏',
      'Football': '⚽',
      'Gym': '💪',
      'Squash': '🥎',
      'Swimming': '🏊',
      'Table Tennis': '📓',
      'Volleyball': '🏐',
    };
    return icons[sport] || '🏟️';
  };

  if (loading && venues.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Find Venues</h1>
          <p className="text-gray-400">
            Discover and book sports venues near you
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-gray-600 text-gray-400 hover:bg-gray-800"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          {markers.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className="border-gray-600 text-gray-400 hover:bg-gray-800"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search venues by name, location, or sport..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sport</label>
                <Select value={filters.sport} onValueChange={(value) => handleFilterChange('sport', value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="">All Sports</SelectItem>
                    <SelectItem value="Tennis">Tennis</SelectItem>
                    <SelectItem value="Badminton">Badminton</SelectItem>
                    <SelectItem value="Basketball">Basketball</SelectItem>
                    <SelectItem value="Cricket">Cricket</SelectItem>
                    <SelectItem value="Football">Football</SelectItem>
                    <SelectItem value="Gym">Gym</SelectItem>
                    <SelectItem value="Squash">Squash</SelectItem>
                    <SelectItem value="Swimming">Swimming</SelectItem>
                    <SelectItem value="Table Tennis">Table Tennis</SelectItem>
                    <SelectItem value="Volleyball">Volleyball</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Min Price</label>
                <Input
                  type="number"
                  placeholder="₹0"
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Max Price</label>
                <Input
                  type="number"
                  placeholder="₹1000"
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <Input
                  placeholder="City or area"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters} className="border-gray-600 text-gray-400">
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between"
      >
        <p className="text-gray-400">
          {pagination.count} venues found
        </p>
      </motion.div>

      {/* Optional Map */}
      {showMap && markers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
        >
          <Map center={center} zoom={12} height={380} useClusters markers={markers} />
        </motion.div>
      )}

      {/* Venues Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {venues.map((venue, index) => (
          <motion.div
            key={venue.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer">
              <CardContent className="p-0">
                {/* Venue Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-t-lg overflow-hidden">
                  {venue.images && venue.images.length > 0 ? (
                    <img
                      src={venue.images[0]}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="h-16 w-16 text-gray-500" />
                    </div>
                  )}
                  
                  {/* Rating Badge */}
                  {venue.rating > 0 && (
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-white text-sm font-medium">{venue.rating}</span>
                    </div>
                  )}
                </div>

                {/* Venue Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white text-lg line-clamp-1">{venue.name}</h3>
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{venue.description}</p>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
                    <MapPin className="h-3 w-3" />
                    <span>{venue.city}, {venue.state}</span>
                  </div>

                  {/* Sports */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {venue.sports?.slice(0, 3).map((sport) => (
                      <Badge key={sport} variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                        {getSportIcon(sport)} {sport}
                      </Badge>
                    ))}
                    {venue.sports && venue.sports.length > 3 && (
                      <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                        +{venue.sports.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-green-400">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">From {formatPrice(venue.starting_price)}</span>
                    </div>
                    
                    <Link to={`/player/venues/${venue.id}`}>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {!loading && venues.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <MapPin className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No venues found</h3>
          <p className="text-gray-400 mb-4">
            Try adjusting your filters or search terms
          </p>
          <Button onClick={clearFilters} variant="outline" className="border-gray-600 text-gray-400">
            Clear Filters
          </Button>
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2"
        >
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={!pagination.has_previous}
            className="border-gray-600 text-gray-400"
          >
            Previous
          </Button>
          
          <span className="text-gray-400">
            Page {pagination.current_page} of {pagination.pages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={!pagination.has_next}
            className="border-gray-600 text-gray-400"
          >
            Next
          </Button>
        </motion.div>
      )}
    </div>
  );
} 