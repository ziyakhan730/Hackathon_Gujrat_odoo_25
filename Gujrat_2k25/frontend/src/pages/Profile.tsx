import { motion } from "framer-motion";
import { User, Calendar, Trophy, Star, Settings, Edit, MapPin, Phone, Mail, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { EmailVerificationModal } from "@/components/auth/EmailVerificationModal";
import { useState } from "react";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Mock data for demonstration
  const mockUser = {
    name: user ? `${user.first_name} ${user.last_name}` : "User",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    email: user?.email || "user@email.com",
    phone: user?.phone_number || "+91 98765 43210",
    location: "Mumbai, India",
    memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    }) : "Jan 2024",
    rating: 4.8,
    totalBookings: 45,
    totalMatches: 23,
    favoritesSports: ["Badminton", "Tennis", "Football"]
  };

  const bookings = [
    {
      id: 1,
      booking_id: "BK001",
      user: "Alex Johnson",
      user_email: "alex.johnson@email.com",
      court: "Court A - Badminton",
      facility: "SportZone Premium",
      booking_date: "2024-12-15",
      start_time: "19:00:00",
      end_time: "20:00:00",
      duration_hours: 1,
      price_per_hour: 800,
      total_amount: 800,
      status: "confirmed",
      payment_status: "paid",
      created_at: "2024-12-10T10:00:00Z"
    },
    {
      id: 2,
      booking_id: "BK002",
      user: "Alex Johnson",
      user_email: "alex.johnson@email.com",
      court: "Court B - Football",
      facility: "Elite Football Arena",
      booking_date: "2024-12-12",
      start_time: "06:00:00",
      end_time: "07:00:00",
      duration_hours: 1,
      price_per_hour: 1200,
      total_amount: 1200,
      status: "completed",
      payment_status: "paid",
      created_at: "2024-12-08T14:30:00Z"
    }
  ];

  const matches = [
    {
      id: 1,
      title: "Evening Badminton Singles",
      date: "Dec 10, 2024",
      result: "Won",
      opponent: "Rahul Sharma",
      rating: 4.9
    },
    {
      id: 2,
      title: "Weekend Football Match",
      date: "Dec 8, 2024",
      result: "Lost",
      opponent: "Team Eagles",
      rating: 4.7
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-accent/20 text-accent border-accent/20';
      case 'completed': return 'bg-success/20 text-success border-success/20';
      case 'cancelled': return 'bg-error/20 text-error border-error/20';
      case 'pending': return 'bg-warning/20 text-warning border-warning/20';
      case 'no_show': return 'bg-error/20 text-error border-error/20';
      default: return 'bg-muted/20 text-muted-foreground border-muted/20';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Won': return 'bg-success/20 text-success border-success/20';
      case 'Lost': return 'bg-error/20 text-error border-error/20';
      case 'Draw': return 'bg-warning/20 text-warning border-warning/20';
      default: return 'bg-muted/20 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="min-h-screen pt-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-4 ring-primary/20">
                <AvatarImage src={mockUser.avatar} />
                <AvatarFallback className="text-2xl">{mockUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button 
                variant="hero" 
                size="icon" 
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                    {mockUser.name}
                  </h1>
                  <div className="flex items-center text-muted-foreground text-sm mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    Member since {mockUser.memberSince}
                  </div>
                </div>
                <Button variant="outline" className="glass-surface mt-4 md:mt-0">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-muted-foreground text-sm">
                  <Mail className="h-4 w-4 mr-2" />
                  {mockUser.email}
                </div>
                <div className="flex items-center text-muted-foreground text-sm">
                  <Phone className="h-4 w-4 mr-2" />
                  {mockUser.phone}
                </div>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  {mockUser.location}
                </div>
              </div>

              {/* Email Verification Status */}
              <div className="mb-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center">
                    {user?.is_email_verified ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        Email Verification
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.is_email_verified 
                          ? "Your email is verified" 
                          : "Please verify your email address"
                        }
                      </p>
                    </div>
                  </div>
                  {!user?.is_email_verified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEmailModalOpen(true)}
                      className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Email
                    </Button>
                  )}
                </div>
              </div>

              {/* Sports */}
              <div className="flex flex-wrap gap-2 mb-4">
                {mockUser.favoritesSports.map((sport) => (
                  <Badge key={sport} variant="secondary" className="bg-gradient-primary text-primary-foreground">
                    {sport}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-xl bg-secondary/20">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="h-4 w-4 text-warning mr-1" fill="currentColor" />
                    <span className="font-bold text-lg text-foreground">{mockUser.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-secondary/20">
                  <div className="font-bold text-lg text-foreground mb-1">{mockUser.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">Bookings</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-secondary/20">
                  <div className="font-bold text-lg text-foreground mb-1">{mockUser.totalMatches}</div>
                  <p className="text-xs text-muted-foreground">Matches</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList className="glass-surface w-full md:w-auto">
              <TabsTrigger value="bookings" className="flex-1 md:flex-none">
                <Calendar className="h-4 w-4 mr-2" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="matches" className="flex-1 md:flex-none">
                <Trophy className="h-4 w-4 mr-2" />
                Matches
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1 md:flex-none">
                <Star className="h-4 w-4 mr-2" />
                Favorites
              </TabsTrigger>
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-4">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card border-0 hover-lift">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-display font-semibold text-lg text-foreground">
                              {booking.court}
                            </h3>
                            <Badge variant="secondary" className="bg-gradient-primary text-primary-foreground">
                              {booking.court.includes(' - ') ? booking.court.split(' - ')[1] : 'Sport'}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(booking.status)}
                            >
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {new Date(booking.booking_date).toLocaleDateString()} • {booking.start_time.substring(0, 5)}-{booking.end_time.substring(0, 5)}
                          </div>
                        </div>
                        <div className="text-right mt-4 md:mt-0">
                          <div className="text-2xl font-bold text-foreground">
                            ₹{booking.total_amount}
                          </div>
                          <Button variant="outline" size="sm" className="mt-2">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            {/* Matches Tab */}
            <TabsContent value="matches" className="space-y-4">
              {matches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card border-0 hover-lift">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-display font-semibold text-lg text-foreground">
                              {match.title}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={getResultColor(match.result)}
                            >
                              {match.result}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground text-sm mb-2">
                            {match.date} • vs {match.opponent}
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-warning mr-1" fill="currentColor" />
                            <span className="text-sm font-medium">{match.rating}</span>
                            <span className="text-muted-foreground text-sm ml-1">match rating</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-4 md:mt-0">
                          View Match
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-center text-foreground">
                    Favorite Facilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    Your favorite facilities will appear here
                  </p>
                  <Button variant="outline" className="mt-4">
                    Explore Facilities
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSuccess={() => {
          toast.success('Email verified successfully!');
          setIsEmailModalOpen(false);
        }}
        email={user?.email || ''}
      />
    </div>
  );
}