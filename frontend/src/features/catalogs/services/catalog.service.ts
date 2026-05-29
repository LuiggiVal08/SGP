import axiosClient from '@/shared/api/axiosClient';
import type { Career, Institution, CatalogUser } from '@/shared/types/catalog.types';

export const catalogService = {
  async getCareers(): Promise<Career[]> {
    const { data } = await axiosClient.get<Career[]>('/careers');
    return data;
  },

  async createCareer(name: string): Promise<Career> {
    const { data } = await axiosClient.post<Career>('/careers', { name });
    return data;
  },

  async updateCareer(id: string, name: string): Promise<Career> {
    const { data } = await axiosClient.patch<Career>(`/careers/${id}`, { name });
    return data;
  },

  async getInstitutions(): Promise<Institution[]> {
    const { data } = await axiosClient.get<Institution[]>('/institutions');
    return data;
  },

  async createInstitution(payload: { name: string; acronym?: string; email?: string; contactInfo?: string }): Promise<Institution> {
    const { data } = await axiosClient.post<Institution>('/institutions', payload);
    return data;
  },

  async updateInstitution(id: string, payload: { name: string; acronym?: string; email?: string; contactInfo?: string }): Promise<Institution> {
    const { data } = await axiosClient.patch<Institution>(`/institutions/${id}`, payload);
    return data;
  },

  async getUsers(role?: string): Promise<CatalogUser[]> {
    const params = role ? { role } : {};
    const { data } = await axiosClient.get<CatalogUser[]>('/users', { params });
    return data;
  },

  async createUser(payload: { dni: string; firstName: string; lastName: string; email: string; password: string; roleName: string; careerId?: string; institutionId?: string }): Promise<{ id: string; firstName: string; lastName: string; email: string; roleName: string }> {
    const { data } = await axiosClient.post('/users', payload);
    return data;
  },
};
