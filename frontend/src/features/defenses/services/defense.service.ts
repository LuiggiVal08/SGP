import axiosClient from '@/shared/api/axiosClient';
import type {
  Defense,
  ScheduleDefenseInput,
  RescheduleDefenseInput,
} from '../types/defense.types';

export const defenseService = {
  async list(signal?: AbortSignal): Promise<Defense[]> {
    const { data } = await axiosClient.get<Defense[]>('/defenses', { signal });
    return data;
  },

  async getById(id: string, signal?: AbortSignal): Promise<Defense> {
    const { data } = await axiosClient.get<Defense>(`/defenses/${id}`, { signal });
    return data;
  },

  async getByProject(projectId: string, signal?: AbortSignal): Promise<Defense[]> {
    const { data } = await axiosClient.get<Defense[]>(`/defenses/project/${projectId}`, { signal });
    return data;
  },

  async schedule(input: ScheduleDefenseInput, signal?: AbortSignal): Promise<Defense> {
    const { data } = await axiosClient.post<Defense>('/defenses', input, { signal });
    return data;
  },

  async reschedule(
    id: string,
    input: RescheduleDefenseInput,
    signal?: AbortSignal,
  ): Promise<Defense> {
    const { data } = await axiosClient.patch<Defense>(`/defenses/${id}`, input, { signal });
    return data;
  },

  async realize(id: string, signal?: AbortSignal): Promise<Defense> {
    const { data } = await axiosClient.patch<Defense>(`/defenses/${id}/realize`, {}, { signal });
    return data;
  },

  async cancel(id: string, signal?: AbortSignal): Promise<Defense> {
    const { data } = await axiosClient.patch<Defense>(`/defenses/${id}/cancel`, {}, { signal });
    return data;
  },
};
