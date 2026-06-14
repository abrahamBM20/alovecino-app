import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '../../config/environment';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

function shouldSkipAuthRefresh(config = {}) {
  if (config.skipAuthRefresh) return true;

  const url = config.url || '';
  return url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/logout');
}

httpClient.interceptors.request.use((config) => {
  const { useAuthStore } = require('../../store/authStore');
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }

    const originalConfig = error.config || {};
    if (
      error.response?.status === 401
      && !originalConfig._retry
      && !shouldSkipAuthRefresh(originalConfig)
    ) {
      originalConfig._retry = true;
      const { useAuthStore } = require('../../store/authStore');

      try {
        if (!refreshPromise) {
          refreshPromise = useAuthStore.getState().refreshSession()
            .finally(() => {
              refreshPromise = null;
            });
        }

        const accessToken = await refreshPromise;
        originalConfig.headers = originalConfig.headers || {};
        originalConfig.headers.Authorization = `Bearer ${accessToken}`;
        return httpClient(originalConfig);
      } catch (refreshError) {
        useAuthStore.getState().clearSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
