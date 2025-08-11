import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, MapPin, Clock, Plus, Trash2, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Court {
  id: number;
  name: string;
  facility: string;
  sport: {
    id: number;
    name: string;
    icon: string;
    description: string;
  };
  description: string;
  price_per_hour: number;
  currency: string;
  court_number: string;
  surface_type: string;
  court_size: string;
  status: string;
  is_available: boolean;
  opening_time: string;
  closing_time: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  photos: Array<{
    id: number;
    image: string;
    caption: string;
    is_primary: boolean;
  }>;
  time_slots: Array<{
    id: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
    duration_hours: number;
  }>;
  created_at: string;
  updated_at: string;
  total_bookings: number;
  average_rating: number;
  total_earnings: number;
}

interface Sport {
  id: number;
  name: string;
  icon: string;
  description: string;
}

interface CourtEditModalProps {
  court: Court | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (courtData: any) => Promise<void>;
  sports: Sport[];
}

export function CourtEditModal({ court, isOpen, onClose, onSave, sports }: CourtEditModalProps) {
  console.log('CourtEditModal rendered with sports:', sports);
  console.log('Sports array length:', sports?.length);
  console.log('Sports data:', sports);
  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    description: '',
    price_per_hour: '',
    currency: 'INR',
    court_number: '',
    surface_type: '',
    court_size: '',
    status: 'active',
    opening_time: '',
    closing_time: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [timeSlots, setTimeSlots] = useState<Array<{ start_time: string; end_time: string; is_available: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (court) {
      console.log('Setting court data:', court);
      console.log('Available sports:', sports);
      console.log('Court sport:', court.sport);
      console.log('Sport ID to set:', court.sport?.id?.toString());
      
      setFormData({
        name: court.name,
        sport: court.sport?.id?.toString() || '',
        description: court.description || '',
        price_per_hour: court.price_per_hour.toString(),
        currency: court.currency,
        court_number: court.court_number || '',
        surface_type: court.surface_type || '',
        court_size: court.court_size || '',
        status: court.status,
        opening_time: court.opening_time || '',
        closing_time: court.closing_time || '',
        address: court.address || '',
        city: court.city || '',
        state: court.state || '',
        pincode: court.pincode || '',
        latitude: court.latitude?.toString() || '',
        longitude: court.longitude?.toString() || '',
      });

      setTimeSlots(
        court.time_slots.map(slot => ({
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_available: slot.is_available
        }))
      );
    }
  }, [court, sports]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Select change - ${name}:`, value);
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      console.log('Updated form data:', newData);
      return newData;
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addTimeSlot = () => {
    setTimeSlots(prev => [...prev, { start_time: '', end_time: '', is_available: true }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(prev => prev.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: string, value: string | boolean) => {
    setTimeSlots(prev => prev.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    ));
  };

  // Geocoding function to convert address to coordinates
  const geocodeAddress = async () => {
    const { address, city, state, pincode } = formData;
    if (!address || !city || !state) {
      toast.error('Please fill in address, city, and state before geocoding');
      return;
    }

    setIsGeocoding(true);
    try {
      const fullAddress = `${address}, ${city}, ${state} ${pincode}`.trim();
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const location = data[0];
        setFormData(prev => ({
          ...prev,
          latitude: Number(location.lat).toFixed(6),
          longitude: Number(location.lon).toFixed(6)
        }));
        toast.success('Coordinates updated from address!');
      } else {
        toast.error('Could not find coordinates for this address');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to geocode address. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Get current location using GPS
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6)
        }));
        toast.success('Current location coordinates set!');
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Failed to get current location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        toast.error(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Auto-geocode when address fields change
  useEffect(() => {
    const { address, city, state } = formData;
    if (address && city && state && !formData.latitude && !formData.longitude) {
      // Debounce geocoding to avoid too many requests
      const timeoutId = setTimeout(() => {
        geocodeAddress();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [formData.address, formData.city, formData.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.sport || formData.sport === 'NaN' || formData.sport === '') {
        toast.error('Please select a sport');
        setIsLoading(false);
        return;
      }

      console.log('Submitting court data:', formData);
      
      const courtData = {
        ...formData,
        sport: parseInt(formData.sport),
        price_per_hour: parseFloat(formData.price_per_hour),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        photos,
        time_slots: timeSlots.filter(slot => slot.start_time && slot.end_time)
      };

      console.log('Processed court data:', courtData);

      await onSave(courtData);
      toast.success('Court updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating court:', error);
      toast.error('Failed to update court. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!court) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Edit Court</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Court Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                                          <div>
                        <Label htmlFor="sport">Sport</Label>
                        <select
                          id="sport"
                          name="sport"
                          value={formData.sport}
                          onChange={(e) => handleSelectChange('sport', e.target.value)}
                          className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          required
                        >
                          <option value="">Select sport</option>
                          {Array.isArray(sports) ? (
                            sports.map((sport) => (
                              <option key={sport.id} value={sport.id.toString()}>
                                {sport.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>Loading sports...</option>
                          )}
                        </select>
                        {!Array.isArray(sports) && (
                          <p className="text-sm text-red-500 mt-1">Sports data not available</p>
                        )}
                        {Array.isArray(sports) && sports.length === 0 && (
                          <p className="text-sm text-yellow-500 mt-1">No sports available</p>
                        )}
                        {Array.isArray(sports) && sports.length > 0 && (
                          <p className="text-sm text-green-500 mt-1">{sports.length} sports loaded</p>
                        )}
                      </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price_per_hour">Price per Hour</Label>
                        <Input
                          id="price_per_hour"
                          name="price_per_hour"
                          type="number"
                          value={formData.price_per_hour}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <select
                          id="currency"
                          name="currency"
                          value={formData.currency}
                          onChange={(e) => handleSelectChange('currency', e.target.value)}
                          className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="INR">INR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="surface_type">Surface Type</Label>
                        <Input
                          id="surface_type"
                          name="surface_type"
                          value={formData.surface_type}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <Label htmlFor="court_size">Court Size</Label>
                        <Input
                          id="court_size"
                          name="court_size"
                          value={formData.court_size}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Address Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <Label htmlFor="status">Status</Label>
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={(e) => handleSelectChange('status', e.target.value)}
                          className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="active">Active</option>
                          <option value="maintenance">Under Maintenance</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    {/* Location Buttons */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={geocodeAddress}
                        disabled={isGeocoding}
                        className="flex-1"
                      >
                        {isGeocoding ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Geocoding...
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 mr-2" />
                            Get Coordinates from Address
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="flex-1"
                      >
                        {isGettingLocation ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Getting Location...
                          </>
                        ) : (
                          <>
                            <Navigation className="h-4 w-4 mr-2" />
                            Use Current Location
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                          id="latitude"
                          name="latitude"
                          type="number"
                          step="any"
                          value={formData.latitude}
                          onChange={handleInputChange}
                          placeholder="Auto-filled from address or GPS"
                        />
                      </div>

                      <div>
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                          id="longitude"
                          name="longitude"
                          type="number"
                          step="any"
                          value={formData.longitude}
                          onChange={handleInputChange}
                          placeholder="Auto-filled from address or GPS"
                        />
                      </div>
                    </div>

                    {/* Coordinates Status */}
                    {formData.latitude && formData.longitude && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center text-green-800">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Coordinates Set</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          {formData.latitude}, {formData.longitude}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Photos */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Court Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="photos">Upload Photos</Label>
                      <Input
                        id="photos"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="cursor-pointer"
                      />
                    </div>

                    {photos.length > 0 && (
                      <div className="grid grid-cols-4 gap-4">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1"
                              onClick={() => removePhoto(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Time Slots */}
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Time Slots</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addTimeSlot}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Time Slot
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-1 grid grid-cols-3 gap-4">
                          <div>
                            <Label>Start Time</Label>
                            <Input
                              type="time"
                              value={slot.start_time}
                              onChange={(e) => updateTimeSlot(index, 'start_time', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>End Time</Label>
                            <Input
                              type="time"
                              value={slot.end_time}
                              onChange={(e) => updateTimeSlot(index, 'end_time', e.target.value)}
                            />
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`available-${index}`}
                              checked={slot.is_available}
                              onChange={(e) => updateTimeSlot(index, 'is_available', e.target.checked)}
                              className="mr-2"
                            />
                            <Label htmlFor={`available-${index}`}>Available</Label>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTimeSlot(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 