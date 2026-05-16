// frontend/src/api/forgetPassword.js
import api from './axios';

export const forgetPasswordAPI = {
  requestReset: (email) => api.post('/forget-password/request/', { email }),
  confirmReset: (token, passwords) => 
    api.post(`/forget-password/confirm/${token}/`, passwords),
};