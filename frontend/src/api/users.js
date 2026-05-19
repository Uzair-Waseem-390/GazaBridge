// frontend/src/api/users.js
import api from './axios';

export const usersAPI = {
  // Registration & Verification
  register: (userData) => api.post('/users/register/', userData),
  verifyEmail: (token) => api.get(`/users/verify-email/${token}/`),
  resendVerification: (email) => api.post('/users/resend-verification/', { email }),
  
  // Current User Profile
  getCurrentUser: () => api.get('/users/me/'),
  updateCurrentUser: (userData) => api.patch('/users/me/', userData),
  
  // User Profile Management
  getUserById: (userId) => api.get(`/users/${userId}/`),
  updateUser: (userId, userData) => api.patch(`/users/${userId}/`, userData),
  deleteUser: (userId) => api.delete(`/users/${userId}/`),
  
  // Password Management
  changePassword: (userId, passwordData) => 
    api.post(`/users/change-password/${userId}/`, passwordData),
  
  // Role Management (Admin only)
  promoteToManager: (userId) => api.post('/users/promote-to-manager/', { user_id: userId }),
  demoteFromManager: (userId) => api.post('/users/demote-from-manager/', { user_id: userId }),
  
  // User Listing
  getUsers: (params = {}) => api.get('/users/', { params }),
};