import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { facilitiesAPI } from '@/services/api';

interface FacilityEditModalProps {
  facility: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function FacilityEditModal({ facility, isOpen, onClose, onSaved }: FacilityEditModalProps) {
  const [form, setForm] = useState<any>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (facility) {
      setForm({
        name: facility.name || '',
        description: facility.description || '',
        address: facility.address || '',
        city: facility.city || '',
        state: facility.state || '',
        pincode: facility.pincode || '',
        phone: facility.phone || '',
        email: facility.email || '',
        website: facility.website || '',
        opening_time: facility.opening_time || '',
        closing_time: facility.closing_time || '',
      });
      setPhotos([]);
      setCoverIndex(0);
    }
  }, [facility]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as any;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    if (index === coverIndex) setCoverIndex(0);
    else if (index < coverIndex) setCoverIndex(Math.max(0, coverIndex - 1));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update basic fields
      await facilitiesAPI.update(facility.id, form);
      // Upload photos (cover first)
      if (photos.length > 0) {
        const arranged = [...photos];
        if (coverIndex >= 0 && coverIndex < arranged.length) {
          const [cover] = arranged.splice(coverIndex, 1);
          arranged.unshift(cover);
        }
        await facilitiesAPI.uploadPhotos(facility.id, arranged);
      }
      onSaved();
      onClose();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!facility) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Edit Facility</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={submit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input name="phone" value={form.phone} onChange={handleChange} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input name="email" value={form.email} onChange={handleChange} />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input name="website" value={form.website} onChange={handleChange} />
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <Input name="address" value={form.address} onChange={handleChange} />
                </div>
                <div>
                  <Label>City</Label>
                  <Input name="city" value={form.city} onChange={handleChange} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input name="state" value={form.state} onChange={handleChange} />
                </div>
                <div>
                  <Label>Pincode</Label>
                  <Input name="pincode" value={form.pincode} onChange={handleChange} />
                </div>
                <div>
                  <Label>Opening Time</Label>
                  <Input name="opening_time" type="time" value={form.opening_time} onChange={handleChange} />
                </div>
                <div>
                  <Label>Closing Time</Label>
                  <Input name="closing_time" type="time" value={form.closing_time} onChange={handleChange} />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Upload Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input type="file" multiple accept="image/*" onChange={handlePhotoUpload} />
                  {photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-3">
                      {photos.map((p, i) => (
                        <div key={i} className="relative">
                          <img src={URL.createObjectURL(p)} className="w-full h-24 object-cover rounded border" />
                          {coverIndex === i && (
                            <span className="absolute bottom-1 left-1 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded">Cover</span>
                          )}
                          <div className="absolute top-1 right-1 flex gap-1">
                            <Button type="button" variant="destructive" size="sm" className="h-6 px-2" onClick={() => removePhoto(i)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={coverIndex === i ? 'default' : 'outline'}
                              className="h-6 px-2"
                              onClick={() => setCoverIndex(i)}
                            >
                              {coverIndex === i ? 'Cover' : 'Make cover'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 