import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface Location {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  formattedAddress: string;
}

interface LocationContextType {
  location: Location | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  updateLocation: (newLocation: Location) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reverse geocoding function to get city name from coordinates
  const reverseGeocode = async (latitude: number, longitude: number): Promise<Location> => {
    try {
      // Using Nominatim (OpenStreetMap) - free and reliable
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();
      
      if (data.address) {
        const address = data.address;
        
        return {
          latitude,
          longitude,
          city: address.city || address.town || address.village || address.county || 'Unknown City',
          state: address.state || address.province || 'Unknown State',
          country: address.country || 'Unknown Country',
          formattedAddress: data.display_name || `${address.city || 'Unknown City'}, ${address.state || 'Unknown State'}`
        };
      } else {
        // Fallback if reverse geocoding fails
        return {
          latitude,
          longitude,
          city: 'Unknown City',
          state: 'Unknown State',
          country: 'Unknown Country',
          formattedAddress: 'Location detected'
        };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback location data
      return {
        latitude,
        longitude,
        city: 'Location Detected',
        state: 'Unknown State',
        country: 'Unknown Country',
        formattedAddress: 'Location detected'
      };
    }
  };

  // Request user location
  const requestLocation = async (): Promise<void> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      toast.error('Location services are not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Get city name from coordinates using reverse geocoding
      const locationData = await reverseGeocode(latitude, longitude);

      setLocation(locationData);
      
      // Store in localStorage for persistence
      localStorage.setItem('userLocation', JSON.stringify(locationData));
      
      toast.success(`Location detected: ${locationData.city}`);
      
    } catch (error) {
      console.error('Geolocation error:', error);
      let errorMessage = 'Failed to get your location';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Update location manually
  const updateLocation = (newLocation: Location) => {
    setLocation(newLocation);
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
  };

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        setLocation(parsedLocation);
      } catch (error) {
        console.error('Error parsing saved location:', error);
        localStorage.removeItem('userLocation');
      }
    }
  }, []);

  const value: LocationContextType = {
    location,
    isLoading,
    error,
    requestLocation,
    updateLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}; 