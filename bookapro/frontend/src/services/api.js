import axios from 'axios';

// Axios API instance configured for backend communication
// Base URL points to the backend server running on port 5000
const api = axios.create({
  baseURL: 'http://localhost:5000/api',  // Backend API endpoint
  headers: { 'Content-Type': 'application/json' }  // Default content type
});

// Request interceptor - automatically adds auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');  // Get JWT token from storage
  if (token) {
    config.headers['x-auth-token'] = token;     // Add token to request headers
  }
  return config;
});

export default api;