import axiosClient from '@/shared/api/axiosClient';
import type {
  Pnf,
  Institution,
  CatalogUser,
  Period,
  Trajectory,
  Subject,
  CommunityPlace,
  CommunityPlaceType,
  CommunityTutor,
  Tag,
  TagCategory,
} from '@/shared/types/catalog.types';
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

  async getPeriodsPaginated(page = 1, limit = 10, search?: string, signal?: AbortSignal): Promise<PaginatedResult<Period>> {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    const { data } = await axiosClient.get<PaginatedResult<Period>>('/periods', { params, signal });
    return data;
  },

  async createPeriod(payload: { name: string; startDate: string; endDate: string; isActive?: boolean }, signal?: AbortSignal): Promise<Period> {
    const { data } = await axiosClient.post<Period>('/periods', payload, { signal });
    return data;
  },

  async updatePeriod(id: string, payload: { name?: string; startDate?: string; endDate?: string; isActive?: boolean }, signal?: AbortSignal): Promise<Period> {
    const { data } = await axiosClient.patch<Period>(`/periods/${id}`, payload, { signal });
    return data;
  },

  async deletePeriod(id: string, signal?: AbortSignal): Promise<void> {
    await axiosClient.delete(`/periods/${id}`, { signal });
  },

  async getTrajectoriesPaginated(page = 1, limit = 10, search?: string, signal?: AbortSignal): Promise<PaginatedResult<Trajectory>> {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    const { data } = await axiosClient.get<PaginatedResult<Trajectory>>('/trajectories', { params, signal });
    return data;
  },

  async createTrajectory(payload: { pnfId: string; name: string; orderNumber: number }, signal?: AbortSignal): Promise<Trajectory> {
    const { data } = await axiosClient.post<Trajectory>('/trajectories', payload, { signal });
    return data;
  },

  async updateTrajectory(id: string, payload: { pnfId?: string; name?: string; orderNumber?: number }, signal?: AbortSignal): Promise<Trajectory> {
    const { data } = await axiosClient.patch<Trajectory>(`/trajectories/${id}`, payload, { signal });
    return data;
  },

  async deleteTrajectory(id: string, signal?: AbortSignal): Promise<void> {
    await axiosClient.delete(`/trajectories/${id}`, { signal });
  },

  async getSubjectsPaginated(page = 1, limit = 10, search?: string, signal?: AbortSignal): Promise<PaginatedResult<Subject>> {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    const { data } = await axiosClient.get<PaginatedResult<Subject>>('/subjects', { params, signal });
    return data;
  },

  async createSubject(payload: { trajectoryId: string; name: string }, signal?: AbortSignal): Promise<Subject> {
    const { data } = await axiosClient.post<Subject>('/subjects', payload, { signal });
    return data;
  },

  async updateSubject(id: string, payload: { trajectoryId?: string; name?: string }, signal?: AbortSignal): Promise<Subject> {
    const { data } = await axiosClient.patch<Subject>(`/subjects/${id}`, payload, { signal });
    return data;
  },

  async deleteSubject(id: string, signal?: AbortSignal): Promise<void> {
    await axiosClient.delete(`/subjects/${id}`, { signal });
  },

  async getCommunityPlacesPaginated(page = 1, limit = 10, search?: string, signal?: AbortSignal): Promise<PaginatedResult<CommunityPlace>> {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    const { data } = await axiosClient.get<PaginatedResult<CommunityPlace>>('/community-places', { params, signal });
    return data;
  },

  async createCommunityPlace(payload: { institutionId: string; name: string; type: CommunityPlaceType; description?: string; address?: string; contactPhone?: string; contactEmail?: string }, signal?: AbortSignal): Promise<CommunityPlace> {
    const { data } = await axiosClient.post<CommunityPlace>('/community-places', payload, { signal });
    return data;
  },

  async updateCommunityPlace(id: string, payload: { institutionId?: string; name?: string; type?: CommunityPlaceType; description?: string; address?: string; contactPhone?: string; contactEmail?: string }, signal?: AbortSignal): Promise<CommunityPlace> {
    const { data } = await axiosClient.patch<CommunityPlace>(`/community-places/${id}`, payload, { signal });
    return data;
  },

  async deleteCommunityPlace(id: string, signal?: AbortSignal): Promise<void> {
    await axiosClient.delete(`/community-places/${id}`, { signal });
  },

  async getCommunityTutorsPaginated(page = 1, limit = 10, search?: string, signal?: AbortSignal): Promise<PaginatedResult<CommunityTutor>> {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    const { data } = await axiosClient.get<PaginatedResult<CommunityTutor>>('/community-tutors', { params, signal });
    return data;
  },

  async createCommunityTutor(payload: { locationId: string; fullName?: string; dni?: string; phone?: string; email?: string; position?: string }, signal?: AbortSignal): Promise<CommunityTutor> {
    const { data } = await axiosClient.post<CommunityTutor>('/community-tutors', payload, { signal });
    return data;
  },

  async updateCommunityTutor(id: string, payload: { locationId?: string; fullName?: string; dni?: string; phone?: string; email?: string; position?: string }, signal?: AbortSignal): Promise<CommunityTutor> {
    const { data } = await axiosClient.patch<CommunityTutor>(`/community-tutors/${id}`, payload, { signal });
    return data;
  },

  async deleteCommunityTutor(id: string, signal?: AbortSignal): Promise<void> {
    await axiosClient.delete(`/community-tutors/${id}`, { signal });
  },

  async getTagsPaginated(page = 1, limit = 10, search?: string, signal?: AbortSignal): Promise<PaginatedResult<Tag>> {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    const { data } = await axiosClient.get<PaginatedResult<Tag>>('/tags', { params, signal });
    return data;
  },

  async createTag(payload: { name: string; category: TagCategory }, signal?: AbortSignal): Promise<Tag> {
    const { data } = await axiosClient.post<Tag>('/tags', payload, { signal });
    return data;
  },

  async updateTag(id: string, payload: { name?: string; category?: TagCategory }, signal?: AbortSignal): Promise<Tag> {
    const { data } = await axiosClient.patch<Tag>(`/tags/${id}`, payload, { signal });
    return data;
  },

  async deleteTag(id: string, signal?: AbortSignal): Promise<void> {
    await axiosClient.delete(`/tags/${id}`, { signal });
  },
};
