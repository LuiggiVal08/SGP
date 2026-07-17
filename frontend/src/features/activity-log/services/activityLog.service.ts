import axiosClient from '@/shared/api/axiosClient';
import type { PaginatedResult } from '@/shared/types/pagination.types';
import type { ActivityLogEntry } from '../types/activity-log.types';

export const activityLogService = {
  async getAll(
    page = 1,
    limit = 10,
    search?: string,
    signal?: AbortSignal,
  ): Promise<PaginatedResult<ActivityLogEntry>> {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    const { data } = await axiosClient.get<PaginatedResult<ActivityLogEntry>>(
      '/activity-logs',
      { params, signal },
    );
    return data;
  },
};
