// frontend/src/context/UserContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../api/users';
import { useAuth } from './AuthContext';

const UserContext = createContext(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export function UserProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await usersAPI.getCurrentUser();
      setProfile(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await usersAPI.updateCurrentUser(userData);
      setProfile(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update profile';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    if (!profile) return { success: false, error: 'No user profile loaded' };

    try {
      await usersAPI.changePassword(profile.id, passwordData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to change password';
      return { success: false, error: message };
    }
  };

  const value = {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    changePassword,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}