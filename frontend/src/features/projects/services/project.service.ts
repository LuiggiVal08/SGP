import axiosClient from '@/shared/api/axiosClient';
import type { Project, CreateProjectPayload, ProjectFile, FileType } from '../types/project.types';

export const projectService = {
  async getAll(): Promise<Project[]> {
    const { data } = await axiosClient.get<Project[]>('/projects');
    return data;
  },

  async create(payload: CreateProjectPayload): Promise<Project> {
    const { data } = await axiosClient.post<Project>('/projects', payload);
    return data;
  },

  async uploadFile(
    projectId: string,
    file: File,
    fileType: FileType,
  ): Promise<ProjectFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    const { data } = await axiosClient.post<ProjectFile>(
      `/projects/${projectId}/files`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },
};
