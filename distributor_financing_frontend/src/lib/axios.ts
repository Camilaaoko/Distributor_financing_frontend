import axios, { AxiosRequestConfig } from 'axios';
import { API_URL, NOTIFICATIONS_API_URL, USE_MOCKS } from '@/lib/config';
import { notifySessionExpired } from '@/lib/session';

// Endpoints that should NOT have the Authorization header attached
const UNAUTHENTICATED_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/loans/profiles/offer/respond',
];

function isUnauthenticatedEndpoint(url?: string): boolean {
  if (!url) return false;
  return UNAUTHENTICATED_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

function createApiClient(baseURL: string, unauthenticatedEndpoints: string[] = []) {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    if (typeof window !== 'undefined' && !isUnauthenticatedEndpoint(config.url)) {
      const token = localStorage.getItem('dfp_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const url = error.config?.url;
      if (error.response?.status === 401 && !isUnauthenticatedEndpoint(url)) {
        notifySessionExpired();
      }
      return Promise.reject(error);
    },
  );

  return client;
}

/** Axios client for API Gateway (main API) */
export const apiClient = createApiClient(API_URL, UNAUTHENTICATED_ENDPOINTS);

/** Axios client for Notifications Service */
const NOTIFICATIONS_UNAUTHENTICATED: string[] = [];
export const notificationsApiClient = createApiClient(NOTIFICATIONS_API_URL, NOTIFICATIONS_UNAUTHENTICATED);

// Export USE_MOCKS for services that need it
export { USE_MOCKS };
