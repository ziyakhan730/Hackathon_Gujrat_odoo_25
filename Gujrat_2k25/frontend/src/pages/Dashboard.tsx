import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Building, 
  TrendingUp, 
  Clock, 
  Plus,
  Edit,
  Eye,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { BookingTrendsChart } from "@/components/dashboard/BookingTrendsChart";
import { PeakHoursChart } from "@/components/dashboard/PeakHoursChart";
import { CourtCard } from "@/components/dashboard/CourtCard";
import { BookingTable } from "@/components/dashboard/BookingTable";

// Mock data for demonstration
const mockBookingTrends = [
  { date: '2024-01-01', bookings: 15, earnings: 2500 },
  { date: '2024-01-02', bookings: 18, earnings: 3000 },
  { date: '2024-01-03', bookings: 22, earnings: 3700 },
  { date: '2024-01-04', bookings: 19, earnings: 3200 },
  { date: '2024-01-05', bookings: 25, earnings: 4200 },
  { date: '2024-01-06', bookings: 28, earnings: 4700 },
  { date: '2024-01-07', bookings: 31, earnings: 5200 },
];

const mockPeakHours = [
  { hour: '6-8', bookings: 5, percentage: 8 },
  { hour: '8-10', bookings: 12, percentage: 19 },
  { hour: '10-12', bookings: 18, percentage: 29 },
  { hour: '12-14', bookings: 15, percentage: 24 },
  { hour: '14-16', bookings: 8, percentage: 13 },
  { hour: '16-18', bookings: 22, percentage: 35 },
  { hour: '18-20', bookings: 28, percentage: 45 },
  { hour: '20-22', bookings: 20, percentage: 32 },
];

const mockCourts = [
  {
    id: 1,
    name: "Court A - Basketball",
    sport: "Basketball",
    status: "active" as const,
    price: 800,
    bookings: 45,
    rating: 4.5,
    operatingHours: "6:00 AM - 10:00 PM",
    amenities: ["Parking", "Changing Rooms", "Equipment Rental"]
  },
  {
    id: 2,
    name: "Court B - Tennis",
    sport: "Tennis",
    status: "active" as const,
    price: 1200,
    bookings: 38,
    rating: 4.8,
    operatingHours: "6:00 AM - 10:00 PM",
    amenities: ["Parking", "Changing Rooms", "Cafeteria"]
  },
  {
    id: 3,
    name: "Court C - Badminton",
    sport: "Badminton",
    status: "maintenance" as const,
    price: 600,
    bookings: 52,
    rating: 4.3,
    operatingHours: "6:00 AM - 10:00 PM",
    amenities: ["Parking", "WiFi"]
  }
];

const mockBookings = [
  {
    id: 1,
    userName: "Rahul Sharma",
    userEmail: "rahul@example.com",
    courtName: "Court A - Basketball",
    date: "2024-01-15",
    time: "18:00-20:00",
    status: "confirmed" as const,
    amount: 1600,
    paymentStatus: "paid" as const,
    createdAt: "2024-01-10T10:00:00Z"
  },
  {
    id: 2,
    userName: "Priya Patel",
    userEmail: "priya@example.com",
    courtName: "Court B - Tennis",
    date: "2024-01-15",
    time: "16:00-18:00",
    status: "pending" as const,
    amount: 2400,
    paymentStatus: "pending" as const,
    createdAt: "2024-01-11T14:30:00Z"
  },
  {
    id: 3,
    userName: "Amit Kumar",
    userEmail: "amit@example.com",
    courtName: "Court A - Basketball",
    date: "2024-01-14",
    time: "20:00-22:00",
    status: "completed" as const,
    amount: 1600,
    paymentStatus: "paid" as const,
    createdAt: "2024-01-09T16:45:00Z"
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  // Dashboard is now protected by ProtectedRoute component
  // No need for manual user type checking here

  // Handler functions
  const handleCourtEdit = (court: any) => {
    toast.info(`Editing court: ${court.name}`);
  };

  const handleCourtView = (court: any) => {
    toast.info(`Viewing court: ${court.name}`);
  };

  const handleCourtDelete = (courtId: number) => {
    toast.info(`Deleting court ID: ${courtId}`);
  };

  const handleBookingView = (booking: any) => {
    toast.info(`Viewing booking: ${booking.id}`);
  };

  const handleBookingEdit = (booking: any) => {
    toast.info(`Editing booking: ${booking.id}`);
  };

  const handleBookingStatusChange = (bookingId: number, status: string) => {
    toast.success(`Booking ${bookingId} status changed to ${status}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Court Owner Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.first_name} {user?.last_name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="hero">
                <Plus className="h-4 w-4 mr-2" />
                Add Court
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="courts">Courts</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Courts</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">1 in maintenance</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹45,250</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BookingTrendsChart data={mockBookingTrends} period={selectedPeriod} />
              <PeakHoursChart data={mockPeakHours} />
            </div>
          </TabsContent>

          <TabsContent value="facilities" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Facility Management</h2>
              <Button variant="hero">
                <Plus className="h-4 w-4 mr-2" />
                Add Facility
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Facility Details</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Facility Name</Label>
                        <Input placeholder="Enter facility name" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <Input placeholder="Enter address" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Description</Label>
                        <textarea 
                          className="w-full p-3 border rounded-md resize-none"
                          rows={3}
                          placeholder="Describe your facility..."
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sports & Amenities</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Sports Supported</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sports" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basketball">Basketball</SelectItem>
                            <SelectItem value="tennis">Tennis</SelectItem>
                            <SelectItem value="badminton">Badminton</SelectItem>
                            <SelectItem value="football">Football</SelectItem>
                            <SelectItem value="cricket">Cricket</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Amenities</Label>
                        <div className="space-y-2">
                          {['Parking', 'Changing Rooms', 'Equipment Rental', 'Cafeteria', 'WiFi'].map((amenity) => (
                            <label key={amenity} className="flex items-center space-x-2">
                              <input type="checkbox" className="rounded" />
                              <span className="text-sm">{amenity}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Facility Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                      <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Upload Photo</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Court Management</h2>
              <Button variant="hero">
                <Plus className="h-4 w-4 mr-2" />
                Add Court
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCourts.map((court) => (
                <CourtCard
                  key={court.id}
                  court={court}
                  onEdit={handleCourtEdit}
                  onView={handleCourtView}
                  onDelete={handleCourtDelete}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <BookingTable
              bookings={mockBookings}
              onView={handleBookingView}
              onEdit={handleBookingEdit}
              onStatusChange={handleBookingStatusChange}
            />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Profile Settings</h2>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">First Name</Label>
                      <Input value={user?.first_name || ''} readOnly />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Name</Label>
                      <Input value={user?.last_name || ''} readOnly />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <Input value={user?.email || ''} readOnly />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <Input value={user?.phone_number || ''} readOnly />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">User Type</Label>
                    <Input value={user?.user_type || ''} readOnly />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Verified</span>
                    <Badge variant={user?.is_email_verified ? "default" : "secondary"}>
                      {user?.is_email_verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Phone Verified</span>
                    <Badge variant={user?.is_phone_verified ? "default" : "secondary"}>
                      {user?.is_phone_verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Member Since</span>
                    <span className="text-sm text-muted-foreground">
                      N/A
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 