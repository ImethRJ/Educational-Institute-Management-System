import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminUser } from '../types';
import { api } from '../lib/api';

interface AuthState {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  setAdmin: (admin: AdminUser | null) => void;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      setAdmin: (admin) => set({ admin, isAuthenticated: !!admin }),
      login: async (credentials) => {
        const response: any = await api.post('/auth/login', credentials);
        set({ admin: response.data.admin, isAuthenticated: true });
      },
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // ignore error
        }
        set({ admin: null, isAuthenticated: false });
      },
      checkAuth: async () => {
        try {
          const response: any = await api.get('/auth/me');
          set({ admin: response.data.admin, isAuthenticated: true });
        } catch {
          set({ admin: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'sector_auth_store',
    },
  ),
);
