import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_type: 'player' | 'owner';
  phone_number?: string;
  country_code: string;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  profile_picture?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setUser: (user: User | null) => void;
  getRedirectPath: (userType: string) => string;
  sendOTP: (email?: string) => Promise<boolean>;
  verifyEmail: (otp: string, email?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate isAuthenticated based on user state
  const isAuthenticated = !!user;

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');

    console.log('Checking auth status...', { hasToken: !!token, hasUserData: !!userData });

    if (token && userData) {
      try {
        // Verify token with backend
        const response = await fetch('http://localhost:8000/api/auth/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Auth check response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Auth check successful:', data);
          setUser(data.data);
        } else {
          console.log('Token invalid, clearing storage');
          // Token is invalid, clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear storage on error
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } else {
      // Check for temporary tokens (for email verification flow)
      const tempToken = localStorage.getItem('temp_access_token');
      const tempUserData = localStorage.getItem('temp_user');
      
      if (tempToken && tempUserData) {
        console.log('Temporary tokens found - user in email verification flow');
        // User is in email verification flow, don't set as authenticated yet
        setUser(null);
      } else {
        console.log('No token or user data found');
        setUser(null);
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with:', { email, password });
      
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      
      const data = await response.json();
      console.log('Login response data:', data);

      if (response.ok && data.success) {
        localStorage.setItem('access_token', data.data.tokens.access);
        localStorage.setItem('refresh_token', data.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        console.log('Login successful, user set:', data.data.user);
        return true;
      } else {
        // Log the error details
        console.error('Login failed:', data);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      console.log('Registration data:', userData);
      
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (response.ok && data.success) {
        // Store tokens temporarily for email verification
        console.log('Storing temporary tokens...');
        console.log('Access token:', data.data.tokens.access);
        console.log('Refresh token:', data.data.tokens.refresh);
        console.log('User data:', data.data.user);
        
        localStorage.setItem('temp_access_token', data.data.tokens.access);
        localStorage.setItem('temp_refresh_token', data.data.tokens.refresh);
        localStorage.setItem('temp_user', JSON.stringify(data.data.user));
        
        // Don't set user as authenticated yet - they need to verify email first
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const accessToken = localStorage.getItem('access_token');
    
    if (refreshToken && accessToken) {
      try {
        console.log('Attempting logout...');
        console.log('Refresh token:', refreshToken);
        
        // Call logout endpoint to blacklist token
        const response = await fetch('http://localhost:8000/api/auth/logout/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        
        console.log('Logout response status:', response.status);
        
        if (response.ok) {
          console.log('Logout successful');
        } else {
          const errorData = await response.json();
          console.warn('Logout API call failed:', errorData);
          // Continue with logout even if API call fails
        }
      } catch (error) {
        console.error('Logout error:', error);
        // Continue with logout even if API call fails
      }
    } else {
      console.log('No tokens found, proceeding with local logout');
    }

    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    
    console.log('Local logout completed');
    
    // Force redirect to login page
    window.location.href = '/login';
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const getRedirectPath = (userType: string): string => {
    switch (userType) {
      case 'owner':
        return '/dashboard';
      case 'player':
        return '/player';
      default:
        return '/';
    }
  };

  const sendOTP = async (email?: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('temp_access_token') || localStorage.getItem('access_token');
      const tempUser = localStorage.getItem('temp_user');
      const fallbackEmail = email || (tempUser ? JSON.parse(tempUser)?.email : undefined);

      // Try authenticated endpoint first if token exists
      if (token) {
        const authRes = await fetch('http://localhost:8000/api/auth/send-otp/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (authRes.ok) return true;
        // If token failed (e.g., 401), fall back below
      }

      // Fallback unauthenticated endpoint with email
      if (!fallbackEmail) return false;
      const unauthRes = await fetch('http://localhost:8000/api/auth/send-otp-without-auth/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fallbackEmail }),
      });
      return unauthRes.ok;
    } catch (error) {
      console.error('Send OTP error:', error);
      return false;
    }
  };

  const verifyEmail = async (otp: string, email?: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('temp_access_token') || localStorage.getItem('access_token');
      const tempUser = localStorage.getItem('temp_user');
      const fallbackEmail = email || (tempUser ? JSON.parse(tempUser)?.email : undefined);

      const requestBody: any = { otp };
      if (fallbackEmail) requestBody.email = fallbackEmail;

      // Prefer authenticated endpoint
      if (token) {
        const response = await fetch('http://localhost:8000/api/auth/verify-email/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success) {
          // Promote temp session to real session if present
          const tempAccess = localStorage.getItem('temp_access_token');
          const tempRefresh = localStorage.getItem('temp_refresh_token');
          const tempUserStr = localStorage.getItem('temp_user');
          if (tempAccess && tempRefresh && tempUserStr) {
            localStorage.setItem('access_token', tempAccess);
            localStorage.setItem('refresh_token', tempRefresh);
            localStorage.setItem('user', tempUserStr);
            setUser(JSON.parse(tempUserStr));
            localStorage.removeItem('temp_access_token');
            localStorage.removeItem('temp_refresh_token');
            localStorage.removeItem('temp_user');
          } else if (user) {
            // Update current user flag if already logged in
            const updatedUser = { ...user, is_email_verified: true } as User;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          return true;
        }
        // If unauthorized or failed, fall back to unauth path if we have email
      }

      if (!fallbackEmail) return false;
      const unauthRes = await fetch('http://localhost:8000/api/auth/verify-email-without-auth/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, email: fallbackEmail }),
      });
      const unauthData = await unauthRes.json().catch(() => ({}));
      if (unauthRes.ok && (unauthData.success || unauthData.data)) {
        // Successful verify without auth: create a logged session if temp tokens exist
        const tempAccess = localStorage.getItem('temp_access_token');
        const tempRefresh = localStorage.getItem('temp_refresh_token');
        const tempUserStr = localStorage.getItem('temp_user');
        if (tempAccess && tempRefresh && tempUserStr) {
          localStorage.setItem('access_token', tempAccess);
          localStorage.setItem('refresh_token', tempRefresh);
          localStorage.setItem('user', tempUserStr);
          setUser(JSON.parse(tempUserStr));
          localStorage.removeItem('temp_access_token');
          localStorage.removeItem('temp_refresh_token');
          localStorage.removeItem('temp_user');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Verify email error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    setUser,
    getRedirectPath,
    sendOTP,
    verifyEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 