import api from '../service/axios';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const verifyEmail = (token_mail) => api.get(`/auth/verify-email?token=${token_mail}`);

export default api;
