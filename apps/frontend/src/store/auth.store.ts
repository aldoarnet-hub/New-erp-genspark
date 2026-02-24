import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (data: { user: User; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: ({ user, accessToken, refreshToken }) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  loadFromStorage: () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');

    if (accessToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
