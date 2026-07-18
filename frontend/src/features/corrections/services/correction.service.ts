import axiosClient from '@/shared/api/axiosClient';
import type { ProjectCorrection, CreateCorrectionInput } from '../types/correction.types';

export const correctionService = {
  async listByProject(projectId: string, signal?: AbortSignal): Promise<ProjectCorrection[]> {
    const { data } = await axiosClient.get<ProjectCorrection[]>(
      `/projects/${projectId}/corrections`,
      { signal },
    );
    return data;
  },

  async create(input: CreateCorrectionInput, signal?: AbortSignal): Promise<ProjectCorrection> {
    const { data } = await axiosClient.post<ProjectCorrection>(
      `/projects/${input.projectId}/corrections`,
      { fileId: input.fileId, comment: input.comment },
      { signal },
    );
    return data;
  },

  async resolve(projectId: string, id: string, signal?: AbortSignal): Promise<ProjectCorrection> {
    const { data } = await axiosClient.patch<ProjectCorrection>(
      `/projects/${projectId}/corrections/${id}/resolve`,
      {},
      { signal },
    );
    return data;
  },

  async remove(projectId: string, id: string, signal?: AbortSignal): Promise<void> {
    await axiosClient.delete(`/projects/${projectId}/corrections/${id}`, { signal });
  },
};
