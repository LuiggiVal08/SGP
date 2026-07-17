import axiosClient from '@/shared/api/axiosClient';
import type { Project, CreateProjectPayload, ProjectFile, FileType, ProjectStatus, ProjectFilters, CommunityTutorData, CartaCulminacion, ProjectTag } from '../types/project.types';
import type { PaginatedResult } from '@/shared/types/pagination.types';

export interface DashboardStats {
  total: number;
  completed: number;
  pendingValidation: number;
  rejected: number;
  byYear: { year: number; count: number }[];
  thisYear: number;
  tutorCount: number;
  studentCount: number;
  topTutors: {
    tutorId: string;
    firstName: string;
    lastName: string;
    projectCount: number;
  }[];
  recentActivity: {
    id: string;
    title: string;
    status: string;
    updatedAt: Date;
  }[];
}

export const projectService = {
  async getAll(signal?: AbortSignal): Promise<Project[]> {
    const { data } = await axiosClient.get<Project[]>('/projects', { signal });
    return data;
  },

  async getAllPaginated(
    page = 1,
    limit = 10,
    search?: string,
    filters?: ProjectFilters,
    signal?: AbortSignal,
  ): Promise<PaginatedResult<Project>> {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    if (filters?.pnfId) params.pnfId = filters.pnfId;
    if (filters?.tutorId) params.tutorId = filters.tutorId;
    if (filters?.status) params.status = filters.status;
    if (filters?.yearFrom !== undefined) params.yearFrom = filters.yearFrom;
    if (filters?.yearTo !== undefined) params.yearTo = filters.yearTo;
    if (filters?.authorId) params.authorId = filters.authorId;
    if (filters?.methodology) params.methodology = filters.methodology;
    const { data } = await axiosClient.get<PaginatedResult<Project>>('/projects', { params, signal });
    return data;
  },

  async getById(id: string, signal?: AbortSignal): Promise<Project> {
    const { data } = await axiosClient.get<Project>(`/projects/${id}`, { signal });
    return data;
  },

  async create(payload: CreateProjectPayload, signal?: AbortSignal): Promise<Project> {
    const { data } = await axiosClient.post<Project>('/projects', payload, { signal });
    return data;
  },

  async getStats(signal?: AbortSignal): Promise<DashboardStats> {
    const { data } = await axiosClient.get<DashboardStats>('/projects/stats', { signal });
    return data;
  },

  async delete(id: string, signal?: AbortSignal): Promise<void> {
    await axiosClient.delete(`/projects/${id}`, { signal });
  },

  async uploadFile(
    projectId: string,
    file: File,
    fileType: FileType,
    signal?: AbortSignal,
  ): Promise<ProjectFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    const { data } = await axiosClient.post<ProjectFile>(
      `/projects/${projectId}/files`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' }, signal },
    );
    return data;
  },

  async update(id: string, payload: Partial<CreateProjectPayload>, signal?: AbortSignal): Promise<Project> {
    const { data } = await axiosClient.patch<Project>(`/projects/${id}`, payload, { signal });
    return data;
  },

  async getFiles(projectId: string, signal?: AbortSignal): Promise<ProjectFile[]> {
    const { data } = await axiosClient.get<ProjectFile[]>(`/projects/${projectId}/files`, { signal });
    return data;
  },

  async deleteFile(projectId: string, fileId: string, signal?: AbortSignal): Promise<void> {
    await axiosClient.delete(`/projects/${projectId}/files/${fileId}`, { signal });
  },

  async updateStatus(id: string, status: ProjectStatus, signal?: AbortSignal): Promise<Project> {
    const { data } = await axiosClient.patch<Project>(`/projects/${id}/status`, { status }, { signal });
    return data;
  },

  async updateCommunityTutor(id: string, communityTutor: CommunityTutorData, signal?: AbortSignal): Promise<Project> {
    const { data } = await axiosClient.patch<Project>(`/projects/${id}/community-tutor`, { communityTutor }, { signal });
    return data;
  },

  async getCartas(projectId: string, signal?: AbortSignal): Promise<CartaCulminacion[]> {
    const { data } = await axiosClient.get<CartaCulminacion[]>(`/projects/${projectId}/cartas-culminacion`, { signal });
    return data;
  },

  async generateCartas(projectId: string, signal?: AbortSignal): Promise<CartaCulminacion[]> {
    const { data } = await axiosClient.post<CartaCulminacion[]>(`/projects/${projectId}/cartas-culminacion`, {}, { signal });
    return data;
  },

  async getProjectTags(projectId: string, signal?: AbortSignal): Promise<ProjectTag[]> {
    const { data } = await axiosClient.get<ProjectTag[]>(`/projects/${projectId}/tags`, { signal });
    return data;
  },

  async assignTag(projectId: string, tagId: string, signal?: AbortSignal): Promise<ProjectTag[]> {
    const { data } = await axiosClient.post<ProjectTag[]>(`/projects/${projectId}/tags`, { tagId }, { signal });
    return data;
  },

  async removeTag(projectId: string, tagId: string, signal?: AbortSignal): Promise<void> {
    await axiosClient.delete(`/projects/${projectId}/tags/${tagId}`, { signal });
  },
};
