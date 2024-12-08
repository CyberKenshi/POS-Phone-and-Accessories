import axios from 'axios';
import store from '../store'; // Import Redux store

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor để thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    // Ưu tiên lấy token từ localStorage
    const token = localStorage.getItem('token');
    console.log('Axios interceptor - Token from localStorage:', token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
