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
  const { user, isAuthenticated, isLoading, getRedirectPath } = useAuth();

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
    // Use getRedirectPath to determine the correct redirect path based on user type
    const redirectPath = getRedirectPath(user.user_type);
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
} 