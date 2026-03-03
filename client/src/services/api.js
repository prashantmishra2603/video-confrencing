import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  signup: (username, email, password, displayName) =>
    api.post('/auth/signup', { username, email, password, displayName }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  getCurrentUser: () => api.get('/auth/me'),
};

// User Service
export const userService = {
  getOnlineUsers: () => api.get('/users/online'),
  
  getUserById: (userId) => api.get(`/users/${userId}`),
  
  updateProfile: (userId, data) =>
    api.put(`/users/${userId}`, data),
};

// Meeting Service
export const meetingService = {
  createMeeting: (title, description) =>
    api.post('/meetings/create', { title, description }),
  
  getMeetingByRoomId: (roomId) =>
    api.get(`/meetings/room/${roomId}`),
  
  getUserMeetings: () => api.get('/meetings/user/history'),
};

export default api;
