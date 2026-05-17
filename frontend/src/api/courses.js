// frontend/src/api/courses.js
import api from './axios';

export const coursesAPI = {
  // Course endpoints
  createCourse: (courseData) => api.post('/courses/create/', courseData),
  getCourse: (id) => api.get(`/courses/${id}/`),
  updateCourse: (id, courseData) => api.patch(`/courses/${id}/`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}/`),
  getCourses: (params = {}) => api.get('/courses/', { params }),
  
  // Content endpoints
  createContent: (courseId, contentData) => 
    api.post(`/courses/${courseId}/contents/create/`, contentData),
  getContent: (id) => api.get(`/courses/contents/${id}/`),
  updateContent: (id, contentData) => api.patch(`/courses/contents/${id}/`, contentData),
  deleteContent: (id) => api.delete(`/courses/contents/${id}/`),
  
  // Link/Unlink endpoints
  linkCourseToOffer: (courseId, offerId) => 
    api.post(`/courses/${courseId}/link/${offerId}/`),
  unlinkCourseFromOffer: (courseId, offerId) => 
    api.delete(`/courses/${courseId}/unlink/${offerId}/`),
};