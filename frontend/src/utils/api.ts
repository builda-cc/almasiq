// Centralized Axios API client. Reads the backend base URL from the Vite env.
// In dev this defaults to "/api" which is proxied to the FastAPI backend
// (see vite.config.ts). In production set VITE_API_BASE_URL to the deployed
// backend URL.
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

const TOKEN_KEY = 'qg_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the JWT to every request when present.
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear the stored token so the app can redirect to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      setStoredToken(null);
    }
    return Promise.reject(error);
  },
);

export { API_BASE_URL, TOKEN_KEY };
