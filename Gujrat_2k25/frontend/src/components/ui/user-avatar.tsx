import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture?: string;
}

interface UserAvatarProps {
  user: User | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
  showEmail?: boolean;
  showType?: boolean;
  userType?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

export function UserAvatar({ 
  user, 
  size = 'md', 
  className,
  showName = false,
  showEmail = false,
  showType = false,
  userType
}: UserAvatarProps) {
  if (!user) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-full bg-gray-200',
        sizeClasses[size],
        className
      )}>
        <span className={cn('text-gray-500 font-medium', textSizes[size])}>
          ?
        </span>
      </div>
    );
  }

  const getInitials = () => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const email = user.email || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    } else if (user.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <Avatar className={cn('bg-gradient-to-br from-blue-500 to-purple-600', sizeClasses[size])}>
        <AvatarImage 
          src={user.profile_picture} 
          alt={getDisplayName()}
        />
        <AvatarFallback className={cn(
          'bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold',
          textSizes[size]
        )}>
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      {(showName || showEmail || showType) && (
        <div className="flex flex-col">
          {showName && (
            <span className="text-sm font-medium text-gray-900">
              {getDisplayName()}
            </span>
          )}
          {showEmail && (
            <span className="text-xs text-gray-500">
              {user.email}
            </span>
          )}
          {showType && userType && (
            <span className="text-xs text-gray-500 capitalize">
              {userType}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for headers and small spaces
export function CompactUserAvatar({ 
  user, 
  size = 'sm', 
  className 
}: Omit<UserAvatarProps, 'showName' | 'showEmail' | 'showType'>) {
  return (
    <UserAvatar 
      user={user} 
      size={size} 
      className={className}
    />
  );
}

// Full version with all details
export function FullUserAvatar({ 
  user, 
  size = 'md', 
  className,
  userType 
}: Omit<UserAvatarProps, 'showName' | 'showEmail' | 'showType'> & { userType?: string }) {
  return (
    <UserAvatar 
      user={user} 
      size={size} 
      className={className}
      showName={true}
      showEmail={true}
      showType={true}
      userType={userType}
    />
  );
} 