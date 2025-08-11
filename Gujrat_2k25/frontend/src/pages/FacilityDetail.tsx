import { useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Star, MapPin, Clock, Wifi, Car, Coffee, Shield, Users, Zap, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function FacilityDetail() {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState<string>("today");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // Mock facility data
  const facility = {
    id: 1,
    name: "SportZone Premium",
    sport: "Badminton",
    images: [
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
      "https://images.unsplash.com/photo-1594736797933-d0401ba821fe?w=800"
    ],
    rating: 4.8,
    reviews: 124,
    location: "Bandra West, Mumbai",
    address: "123 Linking Road, Bandra West, Mumbai 400050",
    price: 800,
    description: "Premium badminton facility with 8 courts, professional lighting, and air conditioning. Perfect for both casual and competitive play.",
    amenities: [
      { icon: Wifi, name: "Free WiFi" },
      { icon: Car, name: "Parking" },
      { icon: Coffee, name: "Cafeteria" },
      { icon: Shield, name: "Security" },
      { icon: Users, name: "Coaching" },
    ],
    hours: "6:00 AM - 11:00 PM",
    courts: [
      { id: 1, name: "Court 1", type: "Premium" },
      { id: 2, name: "Court 2", type: "Standard" },
      { id: 3, name: "Court 3", type: "Premium" },
    ]
  };

  const timeSlots = [
    { time: "6:00 AM", price: 600, available: true },
    { time: "7:00 AM", price: 600, available: true },
    { time: "8:00 AM", price: 800, available: false },
    { time: "9:00 AM", price: 800, available: true },
    { time: "10:00 AM", price: 800, available: true },
    { time: "6:00 PM", price: 1000, available: true },
    { time: "7:00 PM", price: 1000, available: true },
    { time: "8:00 PM", price: 1000, available: false },
    { time: "9:00 PM", price: 800, available: true },
  ];

  const reviews = [
    {
      id: 1,
      user: "Arjun Patel",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      rating: 5,
      date: "2 days ago",
      comment: "Excellent facility with great courts and staff. The booking process was smooth and the courts were well-maintained."
    },
    {
      id: 2,
      user: "Priya Sharma",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b67c?w=100",
      rating: 4,
      date: "1 week ago",
      comment: "Good courts and amenities. Parking was convenient and the staff was helpful."
    }
  ];

  const toggleSlot = (time: string) => {
    setSelectedSlots(prev => 
      prev.includes(time) 
        ? prev.filter(slot => slot !== time)
        : [...prev, time]
    );
  };

  const totalAmount = selectedSlots.reduce((total, time) => {
    const slot = timeSlots.find(s => s.time === time);
    return total + (slot?.price || 0);
  }, 0);

  return (
    <div className="min-h-screen pt-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" className="hover:bg-secondary/50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explore
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:row-span-2">
                  <img 
                    src={facility.images[0]} 
                    alt={facility.name}
                    className="w-full h-64 md:h-full object-cover rounded-xl"
                  />
                </div>
                {facility.images.slice(1).map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`${facility.name} ${index + 2}`}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                ))}
              </div>
            </motion.div>

            {/* Facility Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                      {facility.name}
                    </h1>
                    <Badge variant="secondary" className="bg-gradient-primary text-primary-foreground">
                      {facility.sport}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-warning mr-1" fill="currentColor" />
                      <span className="font-medium text-lg">{facility.rating}</span>
                      <span className="text-muted-foreground ml-1">({facility.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {facility.location}
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {facility.description}
                  </p>
                </div>
                <div className="text-right mt-4 md:mt-0">
                  <div className="text-3xl font-bold text-foreground">
                    ₹{facility.price}
                  </div>
                  <div className="text-muted-foreground">per hour</div>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="font-display font-semibold text-lg mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {facility.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/20">
                      <amenity.icon className="h-5 w-5 text-primary" />
                      <span className="text-sm text-foreground">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-5 w-5 mr-2" />
                <span>Open {facility.hours}</span>
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8"
            >
              <h3 className="font-display font-semibold text-xl mb-6">Reviews</h3>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="flex gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={review.avatar} />
                      <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{review.user}</span>
                        <div className="flex">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-warning" fill="currentColor" />
                          ))}
                        </div>
                        <span className="text-muted-foreground text-sm">{review.date}</span>
                      </div>
                      <p className="text-muted-foreground text-sm">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24"
            >
              <Card className="glass-card border-0">
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold text-xl mb-6 text-center">
                    Book Your Slot
                  </h3>

                  {/* Date Selection */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Select Date</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {['Today', 'Tomorrow', 'Dec 17'].map((date) => (
                        <Button
                          key={date}
                          variant={selectedDate === date.toLowerCase() ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs"
                          onClick={() => setSelectedDate(date.toLowerCase())}
                        >
                          {date}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Available Slots</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto scrollbar-hide">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedSlots.includes(slot.time) ? 'default' : 'outline'}
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => toggleSlot(slot.time)}
                          className="p-3 h-auto flex flex-col items-center text-xs"
                        >
                          <span className="font-medium">{slot.time}</span>
                          <span className="text-xs opacity-75">₹{slot.price}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  {selectedSlots.length > 0 && (
                    <div className="mb-6 p-4 rounded-xl bg-secondary/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Selected Slots:</span>
                        <span className="font-bold text-lg">₹{totalAmount}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedSlots.join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button 
                      variant="hero" 
                      size="lg" 
                      className="w-full"
                      disabled={selectedSlots.length === 0}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                    <Button variant="outline" size="lg" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Create Match
                    </Button>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-6 pt-6 border-t border-glass-border text-center">
                    <p className="text-xs text-muted-foreground mb-2">Need help?</p>
                    <Button variant="ghost" size="sm" className="text-primary">
                      Contact Facility
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}