import axiosClient from '@/shared/api/axiosClient';
import type { PaginatedResult } from '@/shared/types/pagination.types';

export type NotificationType =
  | 'PROJECT'
  | 'SYSTEM'
  | 'ACTIVITY'
  | 'GENERIC';

export type NotificationStatus = 'READ' | 'UNREAD';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  entityType: string | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: NotificationStatus;
}

export const notificationService = {
  async list(
    filters: NotificationFilters = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResult<Notification>> {
    const params: Record<string, string | number> = {};
    if (filters.page !== undefined) params.page = filters.page;
    if (filters.limit !== undefined) params.limit = filters.limit;
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    const { data } = await axiosClient.get<PaginatedResult<Notification>>(
      '/notifications/users/me/notifications',
      { params, signal },
    );
    return data;
  },

  async markAsRead(id: string, signal?: AbortSignal): Promise<{ success: boolean }> {
    const { data } = await axiosClient.patch<{ success: boolean }>(
      `/notifications/users/me/notifications/${id}/read`,
      {},
      { signal },
    );
    return data;
  },

  async markAllAsRead(signal?: AbortSignal): Promise<{ success: boolean }> {
    const { data } = await axiosClient.patch<{ success: boolean }>(
      '/notifications/users/me/notifications/read-all',
      {},
      { signal },
    );
    return data;
  },
};
