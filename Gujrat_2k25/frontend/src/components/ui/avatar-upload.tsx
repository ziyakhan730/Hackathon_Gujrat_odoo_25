import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { UserAvatar } from './user-avatar';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture?: string;
}

interface AvatarUploadProps {
  user: User | null;
  onAvatarUpdate: (imageUrl: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarUpload({ 
  user, 
  onAvatarUpdate, 
  size = 'md',
  className 
}: AvatarUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('profile_picture', selectedFile);

      // Upload to backend
      const response = await fetch('http://localhost:8000/api/auth/upload-avatar/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Update avatar
      onAvatarUpdate(data.profile_picture);
      toast.success('Avatar updated successfully!');
      setIsOpen(false);
      
      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/remove-avatar/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onAvatarUpdate('');
        toast.success('Avatar removed successfully!');
      } else {
        throw new Error('Failed to remove avatar');
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove avatar. Please try again.');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="relative group cursor-pointer">
            <UserAvatar user={user} size={size} />
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </div>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Current Avatar */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Current Avatar</p>
              <UserAvatar user={user} size="lg" />
            </div>

            {/* Upload Section */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="avatar-upload">Choose Image</Label>
                <Input
                  id="avatar-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="mt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={openFileDialog}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select Image
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF up to 5MB
                </p>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Preview</p>
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
                
                {user?.profile_picture && (
                  <Button
                    variant="outline"
                    onClick={handleRemoveAvatar}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 