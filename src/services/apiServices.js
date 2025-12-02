// src/services/apiServices.js
import axios from 'axios';
import router from '@/router';
import { useAuthStore } from '@/stores/useAuthStore';

const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
const isDev = import.meta.env.DEV;

function resolveBaseURL() {
  if (isDev) {
    // Saat development pakai proxy Vite (/api -> target) agar lolos CORS.
    return '';
  }
  if (rawApiUrl) {
    return rawApiUrl;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '/';
}

const resolvedBaseURL = resolveBaseURL();


// === Konfigurasi dasar ===
const api = axios.create({
  baseURL: resolvedBaseURL || undefined,
  timeout: 10000, // optional (10 detik)
  withCredentials: true, // kirim cookie sesi httpOnly
});

// === Interceptor: request ===
// Jika backend tidak set cookie sesi, fallback pakai token in-memory dari store
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore?.authToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === Interceptor: response ===
// Tangani error global (misalnya token kadaluarsa)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const config = error.config || {};
    if (status === 401 && !config.skipAuthRedirect) {
      // Sesi invalid / expired -> arahkan ke login
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
