import axiosClient from '@/shared/api/axiosClient';
import type { LoginCredentials } from '@/shared/types/auth.types';

interface RawLoginResponse {
  accessToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const { data } = await axiosClient.post<RawLoginResponse>('/auth/login', credentials);
    return {
      token: data.accessToken,
      user: data.user,
    };
  },
};
