import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
    withCredentials: true, // envoie les cookies httpOnly automatiquement
});

export const likeUser = (userId) => api.post(`/likes/${userId}`);
export const unlikeUser = (userId) => api.delete(`/likes/${userId}`);

