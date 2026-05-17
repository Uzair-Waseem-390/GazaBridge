// frontend/src/api/liveSections.js
import api from './axios';

export const liveSectionsAPI = {
  // Live Section endpoints
  createLiveSection: (data) => api.post('/live-sections/create/', data),
  getLiveSection: (id) => api.get(`/live-sections/${id}/`),
  updateLiveSection: (id, data) => api.patch(`/live-sections/${id}/`, data),
  deleteLiveSection: (id) => api.delete(`/live-sections/${id}/`),
  getLiveSections: (params = {}) => api.get('/live-sections/', { params }),
  
  // Content endpoints
  createContent: (lsId, data) => api.post(`/live-sections/${lsId}/contents/create/`, data),
  getContent: (id) => api.get(`/live-sections/contents/${id}/`),
  updateContent: (id, data) => api.patch(`/live-sections/contents/${id}/`, data),
  deleteContent: (id) => api.delete(`/live-sections/contents/${id}/`),
  
  // Link/Unlink endpoints
  linkToOffer: (lsId, offerId) => api.post(`/live-sections/${lsId}/link/${offerId}/`),
  unlinkFromOffer: (lsId, offerId) => api.delete(`/live-sections/${lsId}/unlink/${offerId}/`),
};