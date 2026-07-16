import axiosClient from '@/shared/api/axiosClient';
import type { LoginCredentials, LoginResponse } from '@/shared/types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials, signal?: AbortSignal) {
    const { data } = await axiosClient.post<LoginResponse>('/auth/login', credentials, { signal });
    return {
      token: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    };
  },

  async refresh(refreshToken: string) {
    const { data } = await axiosClient.post<LoginResponse>('/auth/refresh', {
      refreshToken,
    });
    return data;
  },

  async logout(refreshToken: string, signal?: AbortSignal): Promise<void> {
    await axiosClient.post('/auth/logout', { refreshToken }, { signal }).catch(() => {});
  },
};
