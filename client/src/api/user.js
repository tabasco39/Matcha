import api from '../service/axios';

export const updateProfile = (data) => api.put('/users/profile', data);

export const getMyImages = () => api.get('/images');

export const uploadImage = (file) => {
  const form = new FormData();
  form.append('image', file);
  return api.post('/images', form);
};

export const deleteImage = (id) => api.delete(`/images/${id}`);

export const getAllProfile = () => api.get('/users')
