import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, MapPin, Star, Clock, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, MapMarker } from "@/components/ui/map/Map";
import { useLocation } from "@/contexts/LocationContext";

export default function Explore() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const { location } = useLocation();

  const facilities = [
    {
      id: 1,
      name: "SportZone Premium",
      sport: "Badminton",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400",
      rating: 4.8,
      reviews: 124,
      distance: "1.2 km",
      priceFrom: 800,
      location: "Bandra West, Mumbai",
      amenities: ["Parking", "AC", "Locker", "Shower"],
      availability: "8 slots available today",
      latitude: 19.060, // demo coords
      longitude: 72.836,
    },
    {
      id: 2,
      name: "Elite Football Arena",
      sport: "Football",
      image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400",
      rating: 4.9,
      reviews: 89,
      distance: "0.8 km",
      priceFrom: 1200,
      location: "Andheri East, Mumbai",
      amenities: ["Floodlights", "Parking", "Canteen", "First Aid"],
      availability: "12 slots available today",
      latitude: 19.119,
      longitude: 72.846,
    },
    {
      id: 3,
      name: "Urban Tennis Club",
      sport: "Tennis",
      image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400",
      rating: 4.7,
      reviews: 156,
      distance: "2.1 km",
      priceFrom: 1000,
      location: "Powai, Mumbai",
      amenities: ["Pro Shop", "Coaching", "AC", "Lounge"],
      availability: "6 slots available today",
      latitude: 19.117,
      longitude: 72.904,
    }
  ];

  const center = location
    ? { lat: location.latitude, lng: location.longitude }
    : { lat: 19.076, lng: 72.8777 }; // Mumbai fallback

  const markers: MapMarker[] = facilities
    .filter(f => typeof f.latitude === 'number' && typeof f.longitude === 'number')
    .map(f => ({
      id: f.id,
      position: { lat: f.latitude!, lng: f.longitude! },
      title: f.name,
      description: `${f.location} • ₹${f.priceFrom}/hr • ⭐ ${f.rating}`,
    }));

  return (
    <div className="min-h-screen pt-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Explore <span className="bg-gradient-hero bg-clip-text text-transparent">Courts</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Find the perfect venue for your next game
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Search facilities..." 
                className="pl-10 glass-surface border-glass-border"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Location" 
                className="pl-10 glass-surface border-glass-border"
              />
            </div>
            <Button variant="outline" className="glass-surface">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="flex-1"
              >
                List
              </Button>
              <Button 
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                onClick={() => setViewMode('map')}
                className="flex-1"
              >
                Map
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="glass-surface">Badminton</Badge>
            <Badge variant="secondary" className="glass-surface">Football</Badge>
            <Badge variant="secondary" className="glass-surface">Tennis</Badge>
            <Badge variant="secondary" className="glass-surface">Available Now</Badge>
            <Badge variant="secondary" className="glass-surface">Under ₹1000</Badge>
          </div>
        </motion.div>

        {/* Results */}
        <div className={`grid ${viewMode === 'list' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'} gap-6`}>
          {viewMode === 'map' && (
            <div className="lg:col-span-2">
              <div className="glass-card overflow-hidden">
                <Map
                  center={center}
                  zoom={12}
                  height={400}
                  useClusters
                  markers={markers}
                />
              </div>
            </div>
          )}
          
          <div className={`space-y-6 ${viewMode === 'map' ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
            {facilities.map((facility, index) => (
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="glass-card hover-lift border-0 overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img 
                        src={facility.image} 
                        alt={facility.name}
                        className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6 md:w-2/3">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-display font-semibold text-foreground mb-1">
                            {facility.name}
                          </h3>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <MapPin className="h-4 w-4 mr-1" />
                            {facility.location} • {facility.distance}
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-gradient-primary text-primary-foreground">
                          {facility.sport}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-warning mr-1" fill="currentColor" />
                          <span className="font-medium">{facility.rating}</span>
                          <span className="text-muted-foreground text-sm ml-1">
                            ({facility.reviews} reviews)
                          </span>
                        </div>
                        <div className="flex items-center text-success text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          {facility.availability}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {facility.amenities.map((amenity) => (
                          <Badge key={amenity} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-2xl font-bold text-foreground">
                            ₹{facility.priceFrom}
                          </span>
                          <span className="text-muted-foreground text-sm">/hour</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="hero" size="sm">
                            <Zap className="h-4 w-4 mr-1" />
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg" className="glass-surface">
            Load More Results
          </Button>
        </motion.div>
      </div>
    </div>
  );
}