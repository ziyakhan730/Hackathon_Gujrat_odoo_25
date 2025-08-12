import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  MapPin, 
  Calendar, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Search,
  Star,
  Clock,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { CompactUserAvatar } from '@/components/ui/user-avatar';
import { toast } from 'sonner';
import { playerAPI } from '@/services/api';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';

interface PlayerSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    name: 'Home',
    href: '/player',
    icon: Home,
    description: 'Dashboard overview'
  },
  {
    name: 'Explore Venues',
    href: '/player/venues',
    icon: MapPin,
    description: 'Find sports venues'
  },
  {
    name: 'My Bookings',
    href: '/player/bookings',
    icon: Calendar,
    description: 'View your bookings'
  },
  {
    name: 'Profile',
    href: '/player/profile',
    icon: User,
    description: 'Manage your profile'
  },
  {
    name: 'Settings',
    href: '/player/settings',
    icon: Settings,
    description: 'Account settings'
  }
];

export function PlayerSidebar({ isOpen, onToggle }: PlayerSidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [activeBookings, setActiveBookings] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [favoriteVenues, setFavoriteVenues] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await playerAPI.getDashboard();
        if (res && res.success) {
          setActiveBookings(res.data.stats.active_bookings || 0);
          setTotalBookings(res.data.stats.total_bookings || 0);
          // Placeholder until favorites feature exists in backend
          setFavoriteVenues(res.data.stats.venues_visited || 0);
        }
      } catch (e) {
        // Silent fail; leave defaults
      }
    };
    loadStats();
  }, []);

  useAutoRefresh(async () => {
    try {
      const res = await playerAPI.getDashboard();
      if (res && res.success) {
        setActiveBookings(res.data.stats.active_bookings || 0);
        setTotalBookings(res.data.stats.total_bookings || 0);
        setFavoriteVenues(res.data.stats.venues_visited || 0);
      }
    } catch {}
  }, 30000, true);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 20 }}
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-80 bg-gray-900 border-r border-gray-700 shadow-xl',
          'lg:relative lg:translate-x-0 lg:shadow-none lg:fixed lg:left-0',
          'flex flex-col'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <CompactUserAvatar user={user} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {user?.user_type}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  'hover:bg-gray-800 hover:text-white',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-300'
                )}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
              >
                <Icon className={cn(
                  'h-5 w-5',
                  isActive ? 'text-white' : 'text-gray-400'
                )} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="p-4 border-t border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Active Bookings</span>
              <span className="font-medium text-white">{activeBookings}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Total Bookings</span>
              <span className="font-medium text-white">{totalBookings}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Favorite Venues</span>
              <span className="font-medium text-white">{favoriteVenues}</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <Button
            variant="outline"
            className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </motion.aside>
    </>
  );
} 