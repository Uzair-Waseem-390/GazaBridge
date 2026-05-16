// frontend/src/api/resources.js
import api from './axios';

export const resourcesAPI = {
  // Resource CRUD
  createResource: (resourceData) => api.post('/resources/create/', resourceData),
  getResource: (id) => api.get(`/resources/${id}/`),
  updateResource: (id, resourceData) => api.patch(`/resources/${id}/`, resourceData),
  deleteResource: (id) => api.delete(`/resources/${id}/`),
  
  // Resource Listing
  getResources: (params = {}) => api.get('/resources/', { params }),
};