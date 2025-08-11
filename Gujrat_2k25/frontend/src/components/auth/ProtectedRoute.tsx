import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredUserType?: 'player' | 'owner';
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredUserType, 
  fallbackPath = '/' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    toast.error("Please log in to access this page");
    return <Navigate to="/login" replace />;
  }

  // Check user type if required
  if (requiredUserType && user.user_type !== requiredUserType) {
    toast.error(`Access denied. This page is for ${requiredUserType}s only.`);
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
} 