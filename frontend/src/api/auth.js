// frontend/src/api/auth.js
import api from './axios';

export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
  
  refreshToken: (refreshToken) => api.post('/auth/refresh/', { refresh: refreshToken }),
  
  getActivity: () => api.get('/auth/activity/'),
  
  updateActivityVisibility: (isVisible) => 
    api.patch('/auth/activity/', { is_visible: isVisible }),
  
  googleAuth: (code, redirectUri) => 
    api.post('/auth/google/', { code, redirect_uri: redirectUri }),
  
  googleRegister: (data) => 
    api.post('/auth/google/register/', data),
};