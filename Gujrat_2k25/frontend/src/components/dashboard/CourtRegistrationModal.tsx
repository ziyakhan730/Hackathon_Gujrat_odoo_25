import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Clock, DollarSign, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { courtsAPI, sportsAPI, facilitiesAPI } from "@/services/api";

interface CourtRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Sport {
  id: number;
  name: string;
  icon: string;
  description: string;
}

interface Facility {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
}

interface CourtFormData {
  name: string;
  facility: number | null;
  sport: number | null;
  description: string;
  price_per_hour: string;
  currency: string;
  court_number: string;
  surface_type: string;
  court_size: string;
  opening_time: string;
  closing_time: string;
}

export function CourtRegistrationModal({ isOpen, onClose, onSuccess }: CourtRegistrationModalProps) {
  // Add error boundary state
  const [hasError, setHasError] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [sportsLoading, setSportsLoading] = useState(false);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [formData, setFormData] = useState<CourtFormData>({
    name: "",
    facility: null,
    sport: null,
    description: "",
    price_per_hour: "",
    currency: "INR",
    court_number: "",
    surface_type: "",
    court_size: "",
    opening_time: "",
    closing_time: "",
  });

  useEffect(() => {
    const loadData = async () => {
      console.log('Loading data for court modal...');
      setSportsLoading(true);
      setFacilitiesLoading(true);
      
      try {
        // Load sports and facilities in parallel
        const [sportsData, facilitiesData] = await Promise.all([
          sportsAPI.getAll(),
          facilitiesAPI.getAll()
        ]);
        
        console.log('Sports data received:', sportsData);
        console.log('Facilities data received:', facilitiesData);
        
        // Handle paginated response for sports
        let sportsArray = [];
        if (sportsData && typeof sportsData === 'object') {
          if (Array.isArray(sportsData)) {
            sportsArray = sportsData;
          } else if (sportsData.results && Array.isArray(sportsData.results)) {
            sportsArray = sportsData.results;
          }
        }
        
        // Handle paginated response for facilities
        let facilitiesArray = [];
        if (facilitiesData && typeof facilitiesData === 'object') {
          if (Array.isArray(facilitiesData)) {
            facilitiesArray = facilitiesData;
          } else if (facilitiesData.results && Array.isArray(facilitiesData.results)) {
            facilitiesArray = facilitiesData.results;
          }
        }
        
        console.log('Processed sports array:', sportsArray);
        console.log('Processed facilities array:', facilitiesArray);
        setSports(sportsArray);
        setFacilities(facilitiesArray);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
        setSports([]); // Set empty array on error
        setFacilities([]); // Set empty array on error
      } finally {
        setSportsLoading(false);
        setFacilitiesLoading(false);
      }
    };

    if (isOpen) {
      console.log('Modal is open, loading data...');
      loadData();
    } else {
      console.log('Modal is closed');
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof CourtFormData, value: string | number) => {
    console.log('Form field changed:', field, 'value:', value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('Updated form data:', newData);
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.facility || !formData.sport || !formData.price_per_hour) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const courtData = {
        ...formData,
        price_per_hour: parseFloat(formData.price_per_hour),
        sport: formData.sport,
        opening_time: formData.opening_time || null,
        closing_time: formData.closing_time || null,
      };

      await courtsAPI.create(courtData);
      toast.success('Court registered successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating court:', error);
      
      // Handle specific error messages
      if (error.message && error.message.includes('facility first')) {
        toast.error('You need to create a facility first before adding courts. Please contact support to set up your facility.');
      } else {
        toast.error('Failed to register court. Please try again.');
      }
      
    } finally {
      setLoading(false);
    }
  };

  console.log('Rendering modal, isOpen:', isOpen, 'sports count:', sports.length, 'facilities count:', facilities.length, 'sportsLoading:', sportsLoading, 'facilitiesLoading:', facilitiesLoading);
  
  // Don't render if not open
  if (!isOpen) {
    return null;
  }
  
  // Error boundary
  if (hasError) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="glass-card border-0">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                  <p className="text-muted-foreground mb-4">There was an error loading the court registration form.</p>
                  <Button onClick={() => setHasError(false)}>Try Again</Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
  
    return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="glass-card border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Plus className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Register New Court</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Add a new court to your facility
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-muted/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Court Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Court A - Basketball"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facility">Facility *</Label>
                      <select
                        value={formData.facility?.toString() || ""}
                        onChange={(e) => {
                          console.log('Facility selected (HTML):', e.target.value);
                          handleInputChange('facility', parseInt(e.target.value));
                        }}
                        disabled={facilitiesLoading}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="">{facilitiesLoading ? "Loading facilities..." : "Select facility"}</option>
                        {Array.isArray(facilities) && facilities.length > 0 && facilities.map((facility) => (
                          <option key={facility.id} value={facility.id.toString()}>
                            {facility.name} - {facility.city}, {facility.state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sport">Sport *</Label>
                      <select
                        value={formData.sport?.toString() || ""}
                        onChange={(e) => {
                          console.log('Sport selected (HTML):', e.target.value);
                          handleInputChange('sport', parseInt(e.target.value));
                        }}
                        disabled={sportsLoading}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="">{sportsLoading ? "Loading sports..." : "Select sport"}</option>
                        {Array.isArray(sports) && sports.length > 0 && sports.map((sport) => (
                          <option key={sport.id} value={sport.id.toString()}>
                            {sport.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        value={formData.currency}
                        onChange={(e) => {
                          console.log('Currency selected (HTML):', e.target.value);
                          handleInputChange('currency', e.target.value);
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the court, its features, and any special characteristics..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_per_hour">Price per Hour (₹) *</Label>
                    <Input
                      id="price_per_hour"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="800"
                      value={formData.price_per_hour}
                      onChange={(e) => handleInputChange('price_per_hour', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="court_number">Court Number</Label>
                      <Input
                        id="court_number"
                        placeholder="A1, B2, etc."
                        value={formData.court_number}
                        onChange={(e) => handleInputChange('court_number', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="surface_type">Surface Type</Label>
                      <Input
                        id="surface_type"
                        placeholder="e.g., Wooden, Concrete, Grass"
                        value={formData.surface_type}
                        onChange={(e) => handleInputChange('surface_type', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="court_size">Court Size</Label>
                      <Input
                        id="court_size"
                        placeholder="e.g., 20m x 10m"
                        value={formData.court_size}
                        onChange={(e) => handleInputChange('court_size', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="opening_time">Opening Time (Optional)</Label>
                      <Input
                        id="opening_time"
                        type="time"
                        value={formData.opening_time}
                        onChange={(e) => handleInputChange('opening_time', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="closing_time">Closing Time (Optional)</Label>
                      <Input
                        id="closing_time"
                        type="time"
                        value={formData.closing_time}
                        onChange={(e) => handleInputChange('closing_time', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="hero"
                      disabled={loading}
                      className="min-w-[120px]"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          <span>Creating...</span>
                        </div>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Court
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 