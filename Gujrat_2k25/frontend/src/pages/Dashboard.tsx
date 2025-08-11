import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, Building, DollarSign, Clock, Edit } from "lucide-react";
import { toast } from "sonner";
import { dashboardAPI, courtsAPI, bookingsAPI, sportsAPI, amenitiesAPI, facilitiesAPI } from "@/services/api";
import { CourtCard } from "@/components/dashboard/CourtCard";
import { BookingTable } from "@/components/dashboard/BookingTable";
import { BookingTrendsChart } from "@/components/dashboard/BookingTrendsChart";
import { PeakHoursChart } from "@/components/dashboard/PeakHoursChart";
import { CourtRegistrationModal } from "@/components/dashboard/CourtRegistrationModal";
import { CourtDetailModal } from "@/components/dashboard/CourtDetailModal";
import { CourtEditModal } from "@/components/dashboard/CourtEditModal";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [isCourtDetailModalOpen, setIsCourtDetailModalOpen] = useState(false);
  const [isCourtEditModalOpen, setIsCourtEditModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  
  // State for real data
  const [kpis, setKpis] = useState({
    total_bookings: 0,
    active_courts: 0,
    total_earnings: 0,
    pending_bookings: 0
  });
  const [bookingTrends, setBookingTrends] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [courts, setCourts] = useState([]);
  const [courtsLoading, setCourtsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFacilities, setHasFacilities] = useState(false);
  
  // Facility form state
  const [facilityForm, setFacilityForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    capacity: '',
    parking_spaces: '',
    year_established: '',
    opening_time: '',
    closing_time: '',
    selectedSports: [] as number[],
    selectedAmenities: [] as number[],
    photos: [] as File[]
  });
  const [sports, setSports] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [facilityLoading, setFacilityLoading] = useState(false);
  const [sportsAmenitiesLoading, setSportsAmenitiesLoading] = useState(false);
  const [sportsAmenitiesError, setSportsAmenitiesError] = useState<string | null>(null);

  // Load dashboard data function
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading dashboard data...');
      console.log('Auth token:', localStorage.getItem('access_token'));
      console.log('User:', user);
      
      // Load KPIs
      console.log('Loading KPIs...');
      try {
        const kpisData = await dashboardAPI.getKPIs();
        console.log('KPIs data:', kpisData);
        setKpis(kpisData);
      } catch (kpiError) {
        console.error('Error loading KPIs:', kpiError);
        setKpis({
          total_bookings: 0,
          active_courts: 0,
          total_earnings: 0,
          pending_bookings: 0
        });
      }
      
      // Load booking trends
      console.log('Loading booking trends...');
      try {
        const trendsData = await dashboardAPI.getBookingTrends(selectedPeriod);
        console.log('Trends data:', trendsData);
        setBookingTrends(trendsData || []);
      } catch (trendsError) {
        console.error('Error loading booking trends:', trendsError);
        setBookingTrends([]);
      }
      
      // Load peak hours
      console.log('Loading peak hours...');
      try {
        const peakHoursData = await dashboardAPI.getPeakHours();
        console.log('Peak hours data:', peakHoursData);
        setPeakHours(peakHoursData || []);
      } catch (peakHoursError) {
        console.error('Error loading peak hours:', peakHoursError);
        setPeakHours([]);
      }
      
      // Load courts
      console.log('Loading courts...');
      setCourtsLoading(true);
      try {
        const courtsData = await courtsAPI.getAll();
        console.log('Courts data:', courtsData);
        
        // Handle paginated response
        let courtsArray = [];
        if (courtsData && typeof courtsData === 'object') {
          if (Array.isArray(courtsData)) {
            courtsArray = courtsData;
          } else if (courtsData.results && Array.isArray(courtsData.results)) {
            courtsArray = courtsData.results;
          }
        }
        
        setCourts(courtsArray);
        setHasFacilities(courtsArray.length > 0);
      } catch (courtsError) {
        console.error('Error loading courts:', courtsError);
        setCourts([]);
        setHasFacilities(false);
      } finally {
        setCourtsLoading(false);
      }
      
      // Load bookings
      console.log('Loading bookings...');
      try {
        const bookingsData = await bookingsAPI.getAll();
        console.log('Bookings data:', bookingsData);
        if (Array.isArray(bookingsData)) {
          setBookings(bookingsData);
        } else if (bookingsData && Array.isArray(bookingsData.results)) {
          setBookings(bookingsData.results);
        } else {
          setBookings([]);
        }
      } catch (bookingsError) {
        console.error('Error loading bookings:', bookingsError);
        setBookings([]);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Failed to load dashboard data. Please try again.');
      
      setKpis({
        total_bookings: 0,
        active_courts: 0,
        total_earnings: 0,
        pending_bookings: 0
      });
      setBookingTrends([]);
      setPeakHours([]);
      setCourts([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data on component mount and when selectedPeriod changes
  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  // Handler functions
  const handleCourtEdit = async (court: any) => {
    console.log('Edit court:', court);
    setSelectedCourt(court);
    setIsCourtEditModalOpen(true);
    
    // Ensure sports are loaded for the edit modal
    if (sports.length === 0) {
      try {
        console.log('Loading sports for court edit modal...');
        const sportsData = await sportsAPI.getAll();
        console.log('Sports data for edit modal:', sportsData);
        // Handle paginated response from sports API
        const sportsArray = sportsData.results || sportsData;
        setSports(Array.isArray(sportsArray) ? sportsArray : []);
      } catch (error) {
        console.error('Error loading sports for edit modal:', error);
        toast.error('Failed to load sports data. Please try again.');
      }
    }
  };

  const handleCourtView = (court: any) => {
    console.log('View court:', court);
    setSelectedCourt(court);
    setIsCourtDetailModalOpen(true);
  };

  const handleCourtDelete = (courtId: number) => {
    toast.info(`Deleting court ID: ${courtId}`);
  };

  const handleAddCourt = () => {
    console.log('Add Court button clicked, opening modal...');
    setIsCourtModalOpen(true);
  };

  const handleCourtModalClose = () => {
    setIsCourtModalOpen(false);
  };

  const handleBookingView = (booking: any) => {
    toast.info(`Viewing booking: ${booking.id}`);
  };

  const handleBookingEdit = (booking: any) => {
    toast.info(`Editing booking: ${booking.id}`);
  };

  const handleBookingStatusChange = async (bookingId: number, status: string) => {
    try {
      await bookingsAPI.updateStatus(bookingId, status);
      toast.success(`Booking ${bookingId} status updated to ${status}`);
      await loadDashboardData();
    } catch (e: any) {
      console.error('Failed to update booking status', e);
      toast.error(e.message || 'Failed to update booking status');
    }
  };

  const handleCourtCreated = () => {
    loadDashboardData();
  };

  // Load sports and amenities data
  useEffect(() => {
    const loadSportsAndAmenities = async () => {
      setSportsAmenitiesLoading(true);
      setSportsAmenitiesError(null);
      try {
        console.log('Loading sports and amenities...');
        const [sportsData, amenitiesData] = await Promise.all([
          sportsAPI.getAll(),
          amenitiesAPI.getAll()
        ]);
        console.log('Sports data:', sportsData);
        console.log('Amenities data:', amenitiesData);
        
        // Handle paginated response from sports API
        const sportsArray = sportsData.results || sportsData;
        const amenitiesArray = amenitiesData.results || amenitiesData;
        
        setSports(Array.isArray(sportsArray) ? sportsArray : []);
        setAmenities(Array.isArray(amenitiesArray) ? amenitiesArray : []);
      } catch (error) {
        console.error('Error loading sports and amenities:', error);
        setSports([]);
        setAmenities([]);
        setSportsAmenitiesError('Failed to load sports and amenities. Please try again.');
      } finally {
        setSportsAmenitiesLoading(false);
      }
    };

    // Load sports and amenities on component mount and when facilities tab is active
    loadSportsAndAmenities();
  }, []); // Remove activeTab dependency to load on mount

  // Facility form handlers
  const handleFacilityInputChange = (field: string, value: string | number[] | File[]) => {
    setFacilityForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFacilityForm(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };

  const removePhoto = (index: number) => {
    setFacilityForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleFacilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!facilityForm.name || !facilityForm.address || !facilityForm.phone || !facilityForm.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setFacilityLoading(true);
    try {
      const formData = new FormData();
      
      // Add basic facility data
      formData.append('name', facilityForm.name);
      formData.append('description', facilityForm.description);
      formData.append('address', facilityForm.address);
      formData.append('city', facilityForm.city);
      formData.append('state', facilityForm.state);
      formData.append('pincode', facilityForm.pincode);
      formData.append('phone', facilityForm.phone);
      formData.append('email', facilityForm.email);
      formData.append('website', facilityForm.website);
      formData.append('capacity', facilityForm.capacity);
      formData.append('parking_spaces', facilityForm.parking_spaces);
      formData.append('year_established', facilityForm.year_established);
      formData.append('opening_time', facilityForm.opening_time);
      formData.append('closing_time', facilityForm.closing_time);
      
      // Add sports
      facilityForm.selectedSports.forEach(sportId => {
        formData.append('sports', sportId.toString());
      });
      
      // Add amenities
      facilityForm.selectedAmenities.forEach(amenityId => {
        formData.append('amenities', amenityId.toString());
      });
      
      // Add photos
      facilityForm.photos.forEach(photo => {
        formData.append('photos', photo);
      });

      await facilitiesAPI.create(formData);
      toast.success('Facility created successfully!');
      
      // Reset form
      setFacilityForm({
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        website: '',
        capacity: '',
        parking_spaces: '',
        year_established: '',
        opening_time: '',
        closing_time: '',
        selectedSports: [],
        selectedAmenities: [],
        photos: []
      });
      
      // Reload dashboard data
      loadDashboardData();
      
    } catch (error) {
      console.error('Error creating facility:', error);
      toast.error('Failed to create facility. Please try again.');
    } finally {
      setFacilityLoading(false);
    }
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
              <Button variant="hero" onClick={handleAddCourt}>
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
                  <div className="text-2xl font-bold">{kpis.total_bookings}</div>
                  <p className="text-xs text-muted-foreground">Total bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Courts</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis.active_courts}</div>
                  <p className="text-xs text-muted-foreground">Active courts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{kpis.total_earnings.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total earnings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis.pending_bookings}</div>
                  <p className="text-xs text-muted-foreground">Pending bookings</p>
                </CardContent>
              </Card>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BookingTrendsChart data={bookingTrends} period={selectedPeriod} />
                <PeakHoursChart data={peakHours} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="facilities" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Facility Management</h2>
            </div>
            
            <form onSubmit={handleFacilitySubmit}>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Facility Name *</Label>
                        <Input
                          id="name"
                          value={facilityForm.name}
                          onChange={(e) => handleFacilityInputChange('name', e.target.value)}
                          placeholder="Enter facility name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={facilityForm.description}
                          onChange={(e) => handleFacilityInputChange('description', e.target.value)}
                          placeholder="Describe your facility"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Address *</Label>
                        <Input
                          id="address"
                          value={facilityForm.address}
                          onChange={(e) => handleFacilityInputChange('address', e.target.value)}
                          placeholder="Enter full address"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={facilityForm.city}
                            onChange={(e) => handleFacilityInputChange('city', e.target.value)}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={facilityForm.state}
                            onChange={(e) => handleFacilityInputChange('state', e.target.value)}
                            placeholder="State"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          value={facilityForm.pincode}
                          onChange={(e) => handleFacilityInputChange('pincode', e.target.value)}
                          placeholder="Pincode"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={facilityForm.phone}
                          onChange={(e) => handleFacilityInputChange('phone', e.target.value)}
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={facilityForm.email}
                          onChange={(e) => handleFacilityInputChange('email', e.target.value)}
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={facilityForm.website}
                          onChange={(e) => handleFacilityInputChange('website', e.target.value)}
                          placeholder="Website URL"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="capacity">Capacity</Label>
                          <Input
                            id="capacity"
                            type="number"
                            value={facilityForm.capacity}
                            onChange={(e) => handleFacilityInputChange('capacity', e.target.value)}
                            placeholder="Max capacity"
                          />
                        </div>
                        <div>
                          <Label htmlFor="parking_spaces">Parking Spaces</Label>
                          <Input
                            id="parking_spaces"
                            type="number"
                            value={facilityForm.parking_spaces}
                            onChange={(e) => handleFacilityInputChange('parking_spaces', e.target.value)}
                            placeholder="Number of spaces"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="year_established">Year Established</Label>
                        <Input
                          id="year_established"
                          type="number"
                          value={facilityForm.year_established}
                          onChange={(e) => handleFacilityInputChange('year_established', e.target.value)}
                          placeholder="Year"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="opening_time">Opening Time</Label>
                          <Input
                            id="opening_time"
                            type="time"
                            value={facilityForm.opening_time}
                            onChange={(e) => handleFacilityInputChange('opening_time', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="closing_time">Closing Time</Label>
                          <Input
                            id="closing_time"
                            type="time"
                            value={facilityForm.closing_time}
                            onChange={(e) => handleFacilityInputChange('closing_time', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <Label>Sports Available</Label>
                      {sportsAmenitiesLoading ? (
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-sm text-muted-foreground">Loading sports...</span>
                        </div>
                      ) : sportsAmenitiesError ? (
                        <p className="text-sm text-red-600 mt-2">{sportsAmenitiesError}</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                          {sports.map((sport) => (
                            <label key={sport.id} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={facilityForm.selectedSports.includes(sport.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleFacilityInputChange('selectedSports', [...facilityForm.selectedSports, sport.id]);
                                  } else {
                                    handleFacilityInputChange('selectedSports', facilityForm.selectedSports.filter(id => id !== sport.id));
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{sport.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Amenities Available</Label>
                      {sportsAmenitiesLoading ? (
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-sm text-muted-foreground">Loading amenities...</span>
                        </div>
                      ) : sportsAmenitiesError ? (
                        <p className="text-sm text-red-600 mt-2">{sportsAmenitiesError}</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                          {amenities.map((amenity) => (
                            <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={facilityForm.selectedAmenities.includes(amenity.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleFacilityInputChange('selectedAmenities', [...facilityForm.selectedAmenities, amenity.id]);
                                  } else {
                                    handleFacilityInputChange('selectedAmenities', facilityForm.selectedAmenities.filter(id => id !== amenity.id));
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{amenity.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Facility Photos</Label>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="mt-2"
                      />
                      {facilityForm.photos.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {facilityForm.photos.map((photo, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(photo)}
                                alt={`Photo ${index + 1}`}
                                className="w-20 h-20 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button type="submit" disabled={facilityLoading}>
                      {facilityLoading ? 'Creating...' : 'Create Facility'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="courts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Court Management</h2>
              <Button variant="hero" onClick={handleAddCourt}>
                <Plus className="h-4 w-4 mr-2" />
                Add Court
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courtsLoading ? (
                <div className="col-span-full flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : courts.length > 0 ? (
                courts.map((court) => (
                  <CourtCard
                    key={court.id}
                    court={court}
                    onEdit={handleCourtEdit}
                    onView={handleCourtView}
                    onDelete={handleCourtDelete}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Building className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Courts Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {hasFacilities 
                        ? "You haven't added any courts yet. Create your first court to start accepting bookings."
                        : "You need to create a facility first before adding courts. Please contact support to set up your facility."
                      }
                    </p>
                    {hasFacilities && (
                      <Button variant="hero" onClick={handleAddCourt}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Court
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <BookingTable
                bookings={bookings}
                onView={handleBookingView}
                onEdit={handleBookingEdit}
                onStatusChange={handleBookingStatusChange}
              />
            )}
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
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Court Registration Modal */}
      <CourtRegistrationModal
        isOpen={isCourtModalOpen}
        onClose={handleCourtModalClose}
        onSuccess={handleCourtCreated}
      />

      {/* Court Detail Modal */}
      <CourtDetailModal
        court={selectedCourt}
        isOpen={isCourtDetailModalOpen}
        onClose={() => setIsCourtDetailModalOpen(false)}
        onEdit={handleCourtEdit}
      />

      {/* Court Edit Modal */}
      <CourtEditModal
        court={selectedCourt}
        isOpen={isCourtEditModalOpen}
        onClose={() => setIsCourtEditModalOpen(false)}
        onSave={async (courtData) => {
          try {
            console.log('Saving court data:', courtData);
            
            // Prepare the data for API
            const updateData = {
              ...courtData,
              price_per_hour: parseFloat(courtData.price_per_hour),
              latitude: courtData.latitude ? parseFloat(courtData.latitude) : null,
              longitude: courtData.longitude ? parseFloat(courtData.longitude) : null,
              time_slots: courtData.time_slots.filter((slot: any) => slot.start_time && slot.end_time)
            };
            
            // Call the API to update the court
            await courtsAPI.update(selectedCourt.id, updateData);
            
            toast.success('Court updated successfully!');
            
            // Reload the courts data to reflect changes
            await loadDashboardData();
            
            // Close the modal
            setIsCourtEditModalOpen(false);
            setSelectedCourt(null);
          } catch (error: any) {
            console.error('Error updating court:', error);
            toast.error(error.message || 'Failed to update court. Please try again.');
          }
        }}
        sports={sports}
      />
    </div>
  );
} 