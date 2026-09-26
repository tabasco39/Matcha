import api from '../service/axios';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const verifyEmail = (token_mail) => api.get(`/auth/verify-email?token=${token_mail}`);
export const verifyToken = (token) => api.post(`/auth/verify-token?token=${token}`);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = ({newpassword, confirmnewpassword, token}) => api.post(`/auth/reset-password?token=${token}`, { newpassword, confirmnewpassword});

export default api;