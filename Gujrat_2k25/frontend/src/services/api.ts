const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to refresh token
const refreshToken = async () => {
  const refreshTokenValue = localStorage.getItem('refresh_token');
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshTokenValue }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    } else {
      throw new Error('Token refresh failed');
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses (for non-apiRequest calls)
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const makeRequest = async (retryCount = 0): Promise<any> => {
    const config: RequestInit = {
      headers: getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401 && retryCount === 0) {
        try {
          console.log('Token expired, attempting to refresh...');
          await refreshToken();
          // Retry the original request with new token
          return makeRequest(retryCount + 1);
        } catch (refreshError) {
          console.warn('Token refresh failed, clearing auth data');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          // Redirect to login page
          window.location.href = '/login';
        }
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  };

  return makeRequest();
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard KPIs
  getKPIs: () => apiRequest('/courts/dashboard/'),
  
  // Get booking trends
  getBookingTrends: (period: string = 'week') => 
    apiRequest(`/courts/dashboard/booking_trends/?period=${period}`),
  
  // Get peak hours
  getPeakHours: () => apiRequest('/courts/dashboard/peak_hours/'),
  
  // Get recent bookings
  getRecentBookings: () => apiRequest('/courts/dashboard/recent_bookings/'),
  
  // Get court statistics
  getCourtStats: () => apiRequest('/courts/dashboard/court_stats/'),
};

// Facilities API
export const facilitiesAPI = {
  // Get all facilities for the owner
  getAll: () => apiRequest('/courts/facilities/'),
  
  // Get single facility
  getById: (id: number) => apiRequest(`/courts/facilities/${id}/`),
  
  // Create new facility
  create: (data: FormData) => {
    const url = `${API_BASE_URL}/courts/facilities/`;
    const token = localStorage.getItem('access_token');
    
    console.log('Creating facility at:', url);
    console.log('Auth token:', token ? 'Present' : 'Missing');
    
    return fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    }).then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Facility creation error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return response.json();
    });
  },
  
  // Update facility
  update: (id: number, data: any) => 
    apiRequest(`/courts/facilities/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Delete facility
  delete: (id: number) => 
    apiRequest(`/courts/facilities/${id}/`, { method: 'DELETE' }),
  
  // Upload photos
  uploadPhotos: (id: number, photos: File[]) => {
    const url = `${API_BASE_URL}/courts/facilities/${id}/upload_photos/`;
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    
    photos.forEach(photo => {
      formData.append('photos', photo);
    });
    
    return fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then(handleResponse);
  },
};

// Courts API
export const courtsAPI = {
  // Get all courts for the owner
  getAll: () => apiRequest('/courts/courts/'),
  
  // Get single court
  getById: (id: number) => apiRequest(`/courts/courts/${id}/`),
  
  // Create new court
  create: (data: any) => 
    apiRequest('/courts/courts/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Update court
  update: (id: number, data: any) => 
    apiRequest(`/courts/courts/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Delete court
  delete: (id: number) => 
    apiRequest(`/courts/courts/${id}/`, { method: 'DELETE' }),
  
  // Update court status
  updateStatus: (id: number, status: string) => 
    apiRequest(`/courts/courts/${id}/update_status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
};

// Bookings API
export const bookingsAPI = {
  // Get all bookings
  getAll: () => apiRequest('/courts/bookings/'),
  
  // Get single booking
  getById: (id: number) => apiRequest(`/courts/bookings/${id}/`),
  
  // Create new booking
  create: (data: any) => 
    apiRequest('/courts/bookings/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Update booking
  update: (id: number, data: any) => 
    apiRequest(`/courts/bookings/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Delete booking
  delete: (id: number) => 
    apiRequest(`/courts/bookings/${id}/`, { method: 'DELETE' }),
  
  // Update booking status
  updateStatus: (id: number, status: string) => 
    apiRequest(`/courts/bookings/${id}/update_status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  
  // Update payment status
  updatePaymentStatus: (id: number, paymentStatus: string) => 
    apiRequest(`/courts/bookings/${id}/update_payment_status/`, {
      method: 'POST',
      body: JSON.stringify({ payment_status: paymentStatus }),
    }),
};

// Sports API
export const sportsAPI = {
  // Get all sports
  getAll: () => apiRequest('/courts/sports/'),
  
  // Get single sport
  getById: (id: number) => apiRequest(`/courts/sports/${id}/`),
};

// Amenities API
export const amenitiesAPI = {
  // Get all amenities
  getAll: () => apiRequest('/courts/amenities/'),
  
  // Get single amenity
  getById: (id: number) => apiRequest(`/courts/amenities/${id}/`),
};

// Time Slots API
export const timeSlotsAPI = {
  // Get all time slots
  getAll: () => apiRequest('/courts/timeslots/'),
  
  // Get single time slot
  getById: (id: number) => apiRequest(`/courts/timeslots/${id}/`),
  
  // Create new time slot
  create: (data: any) => 
    apiRequest('/courts/timeslots/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Update time slot
  update: (id: number, data: any) => 
    apiRequest(`/courts/timeslots/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Delete time slot
  delete: (id: number) => 
    apiRequest(`/courts/timeslots/${id}/`, { method: 'DELETE' }),
};

// Ratings API
export const ratingsAPI = {
  // Get all ratings
  getAll: () => apiRequest('/courts/ratings/'),
  
  // Get single rating
  getById: (id: number) => apiRequest(`/courts/ratings/${id}/`),
  
  // Create new rating
  create: (data: any) => 
    apiRequest('/courts/ratings/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Update rating
  update: (id: number, data: any) => 
    apiRequest(`/courts/ratings/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Delete rating
  delete: (id: number) => 
    apiRequest(`/courts/ratings/${id}/`, { method: 'DELETE' }),
};

// Notifications API
export const notificationsAPI = {
  // Get all notifications
  getAll: () => apiRequest('/courts/notifications/'),
  
  // Get single notification
  getById: (id: number) => apiRequest(`/courts/notifications/${id}/`),
  
  // Mark notification as read
  markAsRead: (id: number) => 
    apiRequest(`/courts/notifications/${id}/mark_as_read/`, {
      method: 'POST',
    }),
  
  // Mark all notifications as read
  markAllAsRead: () => 
    apiRequest('/courts/notifications/mark_all_as_read/', {
      method: 'POST',
    }),
};

// Authentication API
export const authAPI = {
  // Login
  login: (data: any) => 
    apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Register
  register: (data: any) => 
    apiRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Get user profile
  getProfile: () => apiRequest('/auth/profile/'),
  
  // Update profile
  updateProfile: (data: any) => 
    apiRequest('/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Change password
  changePassword: (data: any) => 
    apiRequest('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Logout
  logout: () => 
    apiRequest('/auth/logout/', {
      method: 'POST',
    }),
  
  // Get country codes
  getCountryCodes: () => apiRequest('/auth/country-codes/'),
}; 