import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ 
  children, 
  redirectTo = '/dashboard' 
}: PublicRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard or specified path
  if (isAuthenticated && user) {
    // Determine redirect path based on user type
    let redirectPath = redirectTo;
    if (user.user_type === 'owner') {
      redirectPath = '/dashboard';
    } else if (user.user_type === 'player') {
      redirectPath = '/explore';
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
} 