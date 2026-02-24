import api from './api';
import type { LoginRequest, LoginResponse } from '@/types';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', data);
    return response.data.data || response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data.data || response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data.data || response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },
};
