import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

if (!document.getElementById('spinner-styles')) {
  const style = document.createElement('style');
  style.id = 'spinner-styles';
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user?: User;
  token?: string;
  message?: string;
  requires_verification?: boolean;
  email?: string;
}

interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Clear any authentication errors
  const clearError = useCallback(() => setError(null), []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          // Set the default Authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user data
          const { data } = await axios.get<{ user: User }>('/api/user');
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        // Clear invalid token and reset auth state
        localStorage.removeItem('auth_token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        console.error('Authentication check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle user login
  const login = useCallback(async ({ email, password }: LoginCredentials) => {
    try {
      setLoading(true);
      clearError();
      
      // Attempt login
      const { data } = await axios.post<AuthResponse>('/api/login', { 
        email, 
        password 
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (data.requires_verification) {
        throw new Error('Please verify your email first. Check your email for the OTP.');
      }
      
      if (data.user && data.token) {
        // Store the token in localStorage
        localStorage.setItem('auth_token', data.token);
        
        // Set the default Authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        setUser(data.user);
        return Promise.resolve();
      }
      
      throw new Error('Invalid response from server');
    } catch (err) {
      const error = err as AxiosError<AuthError>;
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return Promise.reject(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  // Handle user logout
  const logout = useCallback(async () => {
    try {
      // Remove the token from localStorage
      localStorage.removeItem('auth_token');
      
      // Remove the Authorization header
      delete axios.defaults.headers.common['Authorization'];
      
      // Call the logout API
      await axios.post('/api/logout', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      setUser(null);
      return Promise.resolve();
    } catch (err) {
      // Even if the API call fails, we still want to clear the local auth state
      localStorage.removeItem('auth_token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      
      const error = err as AxiosError<AuthError>;
      const errorMessage = error.response?.data?.message || 'Logged out successfully';
      
      // Don't reject on logout errors, just log them
      console.error('Logout error:', errorMessage);
      return Promise.resolve();
    } finally {
      setLoading(false);
    }
  }, []);

  // Only render children once initial auth check is complete
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(16, 101, 82, 0.1)',
          borderTop: '4px solid #106552',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        login, 
        logout, 
        loading, 
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Helper hook for protected routes
export const useProtectedRoute = (redirectPath = '/login') => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login with the current location to return after login
      navigate(redirectPath, { 
        state: { from: location },
        replace: true 
      });
    }
  }, [isAuthenticated, loading, navigate, location, redirectPath]);

  return { isAuthenticated, loading };
};
