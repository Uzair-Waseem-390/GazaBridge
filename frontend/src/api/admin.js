// frontend/src/api/admin.js
import api from './axios';

export const adminAPI = {
  // User Stats
  getUserStats: () => api.get('/admin/users/stats/'),
  
  // User Lists
  getVolunteers: (params) => api.get('/admin/users/volunteers/', { params }),
  getSeekers: (params) => api.get('/admin/users/seekers/', { params }),
  getBoth: (params) => api.get('/admin/users/both/', { params }),
  getManagers: (params) => api.get('/admin/users/managers/', { params }),
  getAdmins: (params) => api.get('/admin/users/admins/', { params }),
  getInactiveUsers: (params) => api.get('/admin/users/inactive/', { params }),
};