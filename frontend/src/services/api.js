import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Attach JWT token automatically if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vibevault_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear stale credentials
      if (localStorage.getItem('vibevault_token')) {
        localStorage.removeItem('vibevault_token');
        localStorage.removeItem('vibevault_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
