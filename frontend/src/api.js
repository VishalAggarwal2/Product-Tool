import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001'
});

// Admin
export const createUser = (data) => API.post('/users', data);
export const updateUserRole = (id, data) => API.put(`/users/${id}`, data);

// Updater
export const getProducts = () => API.get('/products');
export const requestUpdate = (data) => API.post('/update-request', data);

// Approver
export const getPendingUpdates = () => API.get('/pending-updates');
export const approveUpdate = (id, action) => API.put(`/approve/${id}`, { action });
export const getUserByName = (name) =>axios.get(`/users/name/${encodeURIComponent(name)}`);


export default API;

