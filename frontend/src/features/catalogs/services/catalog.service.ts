import axiosClient from '@/shared/api/axiosClient';
import type { Pnf, Institution, CatalogUser } from '@/shared/types/catalog.types';
import type { PaginatedResult } from '@/shared/types/pagination.types';

export const catalogService = {
  async getPnfs(institutionId?: string, signal?: AbortSignal): Promise<Pnf[]> {
    const params: Record<string, string> = {};
    if (institutionId) params.institutionId = institutionId;
    const { data } = await axiosClient.get<Pnf[]>('/pnf', { params, signal });
    return data;
  },

  async getPnfsPaginated(page = 1, limit = 10, search?: string, institutionId?: string, signal?: AbortSignal): Promise<PaginatedResult<Pnf>> {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    if (institutionId) params.institutionId = institutionId;
    const { data } = await axiosClient.get<PaginatedResult<Pnf>>('/pnf', { params, signal });
    return data;
  },

  async createPnf(name: string, institutionId: string, signal?: AbortSignal): Promise<Pnf> {
    const { data } = await axiosClient.post<Pnf>('/pnf', { name, institutionId }, { signal });
    return data;
  },

  async updatePnf(id: string, name: string, institutionId?: string, signal?: AbortSignal): Promise<Pnf> {
    const { data } = await axiosClient.patch<Pnf>(`/pnf/${id}`, { name, ...(institutionId && { institutionId }) }, { signal });
    return data;
  },

  async getInstitutions(signal?: AbortSignal): Promise<Institution[]> {
    const { data } = await axiosClient.get<Institution[]>('/institutions', { signal });
    return data;
  },

  async getInstitutionsPaginated(page = 1, limit = 10, search?: string, signal?: AbortSignal): Promise<PaginatedResult<Institution>> {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    const { data } = await axiosClient.get<PaginatedResult<Institution>>('/institutions', { params, signal });
    return data;
  },

  async createInstitution(payload: { name: string; acronym?: string; email?: string; contactInfo?: string }, signal?: AbortSignal): Promise<Institution> {
    const { data } = await axiosClient.post<Institution>('/institutions', payload, { signal });
    return data;
  },

  async updateInstitution(id: string, payload: { name: string; acronym?: string; email?: string; contactInfo?: string }, signal?: AbortSignal): Promise<Institution> {
    const { data } = await axiosClient.patch<Institution>(`/institutions/${id}`, payload, { signal });
    return data;
  },

  async getUsers(role?: string, signal?: AbortSignal): Promise<CatalogUser[]> {
    const params = role ? { role } : {};
    const { data } = await axiosClient.get<CatalogUser[]>('/users', { params, signal });
    return data;
  },

  async getUsersPaginated(page = 1, limit = 10, search?: string, role?: string, signal?: AbortSignal): Promise<PaginatedResult<CatalogUser>> {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    if (role) params.role = role;
    const { data } = await axiosClient.get<PaginatedResult<CatalogUser>>('/users', { params, signal });
    return data;
  },

  async deletePnf(id: string, signal?: AbortSignal): Promise<void> {
    await axiosClient.delete(`/pnf/${id}`, { signal });
  },

  async deleteInstitution(id: string, signal?: AbortSignal): Promise<void> {
    await axiosClient.delete(`/institutions/${id}`, { signal });
  },

  async createUser(payload: { dni: string; firstName: string; lastName: string; email: string; password: string; roleName: string; pnfId?: string; institutionId?: string; phone?: string }, signal?: AbortSignal): Promise<{ id: string; firstName: string; lastName: string; email: string; roleName: string }> {
    const { data } = await axiosClient.post('/users', payload, { signal });
    return data;
  },

  async updateUser(id: string, payload: { dni?: string; firstName?: string; lastName?: string; email?: string; roleName?: string; pnfId?: string; institutionId?: string; phone?: string; isActive?: boolean }, signal?: AbortSignal): Promise<void> {
    await axiosClient.patch(`/users/${id}`, payload, { signal });
  },

  async toggleUserActive(id: string, signal?: AbortSignal): Promise<{ isActive: boolean }> {
    const { data } = await axiosClient.patch(`/users/${id}/toggle-active`, undefined, { signal });
    return data;
  },

  async deleteUser(id: string, signal?: AbortSignal): Promise<void> {
    await axiosClient.delete(`/users/${id}`, { signal });
  },

  registerStudent(payload: {
    dni: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    pnfId?: string;
    institutionId?: string;
    enrollmentNumber: string;
    cohort: number;
    currentTrayecto?: number;
  }, signal?: AbortSignal): Promise<{ id: string; firstName: string; lastName: string; email: string; roleName: string }> {
    return axiosClient.post('/auth/register/student', payload, { signal }).then((r) => r.data);
  },

  registerProfessor(payload: {
    dni: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    pnfId?: string;
    institutionId?: string;
    specialization?: string;
  }, signal?: AbortSignal): Promise<{ id: string; firstName: string; lastName: string; email: string; roleName: string }> {
    return axiosClient.post('/auth/register/professor', payload, { signal }).then((r) => r.data);
  },
};
