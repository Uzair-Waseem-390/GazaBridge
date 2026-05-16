// frontend/src/api/posts.js
import api from './axios';

export const postsAPI = {
  // Offer endpoints
  createOffer: (offerData) => api.post('/posts/offers/create/', offerData),
  getOffer: (id) => api.get(`/posts/offers/${id}/`),
  updateOffer: (id, offerData) => api.patch(`/posts/offers/${id}/`, offerData),
  deleteOffer: (id) => api.delete(`/posts/offers/${id}/`),
  getOffers: (params = {}) => api.get('/posts/offers/', { params }),
  
  // Request endpoints
  createRequest: (requestData) => api.post('/posts/requests/create/', requestData),
  getRequest: (id) => api.get(`/posts/requests/${id}/`),
  updateRequest: (id, requestData) => api.patch(`/posts/requests/${id}/`, requestData),
  deleteRequest: (id) => api.delete(`/posts/requests/${id}/`),
  getRequests: (params = {}) => api.get('/posts/requests/', { params }),
  
  // Linked resources
  getOfferLinkedCourses: (offerId) => api.get(`/posts/offers/${offerId}/linked-courses/`),
  getOfferLinkedLiveSections: (offerId) => api.get(`/posts/offers/${offerId}/linked-live-sections/`),
};