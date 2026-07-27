import axios from 'axios';
import { toast } from 'sonner';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const details = error.response?.data?.error?.details;
    const message =
      (Array.isArray(details) && details.length > 0 ? details.join(' | ') : null) ||
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      'An unexpected error occurred. Please check your network connection.';

    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      toast.error('Session expired. Please log in again.');
      window.location.href = '/login';
    } else if (error.response?.status !== 404) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);
