import axiosClient from '@/shared/api/axiosClient';
import type { AuthUser } from '@/shared/types/auth.types';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export const profileService = {
  async getMe(signal?: AbortSignal): Promise<AuthUser> {
    const { data } = await axiosClient.get<AuthUser>('/users/me', { signal });
    return data;
  },

  async updateMe(payload: UpdateProfilePayload, signal?: AbortSignal): Promise<void> {
    await axiosClient.patch('/users/me', payload, { signal });
  },
};
