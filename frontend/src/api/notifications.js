// frontend/src/api/notifications.js
import api from './axios';

export const notificationsAPI = {
  // User endpoints
  getUnreadCount: () => api.get('/notifications/unread-count/'),
  getNotifications: (userId, params = {}) => 
    api.get(`/notifications/${userId}/`, { params }),
  markAsRead: (notificationId) => 
    api.post(`/notifications/${notificationId}/mark-read/`),
  markAllAsRead: () => 
    api.post('/notifications/mark-all-read/'),
  deleteNotification: (userId, notificationId) => 
    api.delete(`/notifications/${userId}/${notificationId}/`),
  deleteAllNotifications: (userId) => 
    api.delete(`/notifications/${userId}/all/delete/`),
  
  // Admin endpoints
  sendAdminNotification: (data) => 
    api.post('/notifications/admin/send/', data),
};