import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Mail, Globe, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Facility {
  id: number;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  opening_time?: string;
  closing_time?: string;
  photos?: Array<{ id: number; image: string; is_primary: boolean; caption?: string }>;
}

interface FacilityDetailModalProps {
  facility: Facility | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FacilityDetailModal({ facility, isOpen, onClose }: FacilityDetailModalProps) {
  if (!facility) return null;

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
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">{facility.name}</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
              {facility.photos && facility.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {facility.photos.map((photo) => (
                    <div key={photo.id} className="relative">
                      <img src={photo.image} alt={facility.name} className="w-full h-40 object-cover rounded-md border" />
                      {photo.is_primary && (
                        <span className="absolute bottom-1 left-1 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded">Cover</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {facility.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{facility.description}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {facility.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">{facility.address}{facility.city ? `, ${facility.city}` : ''}{facility.state ? `, ${facility.state}` : ''}{facility.pincode ? ` ${facility.pincode}` : ''}</p>
                      </div>
                    </div>
                  )}
                  {facility.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <p className="text-sm text-muted-foreground">{facility.phone}</p>
                    </div>
                  )}
                  {facility.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <p className="text-sm text-muted-foreground">{facility.email}</p>
                    </div>
                  )}
                  {facility.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a href={facility.website} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                        {facility.website}
                      </a>
                    </div>
                  )}
                  {(facility.opening_time || facility.closing_time) && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <p className="text-sm text-muted-foreground">
                        {facility.opening_time || '--'} - {facility.closing_time || '--'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 