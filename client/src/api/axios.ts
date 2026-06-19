import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const normalizeApiUrl = (url: string | undefined) => url?.trim().replace(/\/+$/, '') || '';

export const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);
export const API_CONFIG_ERROR = !API_BASE_URL
  ? 'Missing VITE_API_URL. Configure it to the Render backend API URL before using the application.'
  : API_BASE_URL.includes('healthcare-verification.vercel.app/api')
    ? 'Invalid VITE_API_URL. API requests must target the Render backend, not the Vercel frontend.'
    : null;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to append authorization token
api.interceptors.request.use(
  (config) => {
    if (API_CONFIG_ERROR) {
      return Promise.reject(new Error(API_CONFIG_ERROR));
    }

    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration & refresh rotation
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and request hasn't already been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        if (API_CONFIG_ERROR) {
          throw new Error(API_CONFIG_ERROR);
        }

        const { data } = await refreshApi.post('/auth/refresh', {
          refreshToken,
        });

        if (!data?.accessToken) {
          throw new Error('Invalid refresh response from authentication service.');
        }

        const newAccessToken = data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);
        
        processQueue(null, newAccessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
