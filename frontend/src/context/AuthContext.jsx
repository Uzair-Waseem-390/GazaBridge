// frontend/src/context/AuthContext.jsx - Updated initializeAuth
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const initializeAuth = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const storedUser = localStorage.getItem('user');

    if (accessToken && refreshToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Try to refresh the token to make sure it's still valid
        try {
          const response = await authAPI.refreshToken(refreshToken);
          const { access, refresh, user: userData } = response.data;
          
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
          
          // Update user data if returned
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
          }
        } catch (refreshError) {
          // Token refresh failed - but user still has tokens, they might be expired
          // Don't clear auth here, let the axios interceptor handle 401s
          console.log('Token refresh on init failed, will try on first API call');
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        clearAuth();
      }
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const clearAuth = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access, refresh, user: userData } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      window.location.href = '/';
    }
  };

  const googleLogin = async (code, redirectUri) => {
    try {
      const response = await authAPI.googleAuth(code, redirectUri);
      const data = response.data;

      if (data.is_new_user) {
        return {
          success: true,
          isNewUser: true,
          registrationToken: data.registration_token,
          user: data.user,
        };
      } else {
        const { access, refresh, user: userData } = data;

        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, isNewUser: false, user: userData };
      }
    } catch (error) {
      const message = error.response?.data?.detail || 'Google login failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const googleRegister = async (registrationData) => {
    try {
      const response = await authAPI.googleRegister(registrationData);
      const { access, refresh, user: userData } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    googleLogin,
    googleRegister,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}