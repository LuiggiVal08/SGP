import axiosClient from '@/shared/api/axiosClient';
import type { PaginatedResult } from '@/shared/types/pagination.types';

export interface CompletionCertificate {
  id: string;
  authorId: string;
  pdfUrl: string;
  serialNumber: string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const certificateService = {
  async list(
    filters: CertificateFilters = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResult<CompletionCertificate>> {
    const params: Record<string, string | number> = {};
    if (filters.page !== undefined) params.page = filters.page;
    if (filters.limit !== undefined) params.limit = filters.limit;
    if (filters.search) params.search = filters.search;
    const { data } = await axiosClient.get<PaginatedResult<CompletionCertificate>>(
      '/completion-certificates',
      { params, signal },
    );
    return data;
  },

  async getById(id: string, signal?: AbortSignal): Promise<CompletionCertificate> {
    const { data } = await axiosClient.get<CompletionCertificate>(
      `/completion-certificates/${id}`,
      { signal },
    );
    return data;
  },
};
