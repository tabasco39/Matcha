import api from '../service/axios';

export const likeUser = (userId) => api.post(`/likes/${userId}`);
export const unlikeUser = (userId) => api.delete(`/likes/${userId}`);

