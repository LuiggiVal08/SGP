import axiosClient from '@/shared/api/axiosClient';
import type { LoopSnapshot, LoopReceipt, LoopState } from '../types/loop.types';

export const loopService = {
  async getSnapshot(signal?: AbortSignal): Promise<LoopSnapshot> {
    const { data } = await axiosClient.get<LoopSnapshot>('/loop/state', { signal });
    return data;
  },

  async getReceipts(signal?: AbortSignal): Promise<LoopReceipt[]> {
    const { data } = await axiosClient.get<LoopReceipt[]>('/loop/receipts', { signal });
    return data;
  },

  async getRunState(signal?: AbortSignal): Promise<LoopState | null> {
    const { data } = await axiosClient.get<LoopState | null>('/loop/run-state', { signal });
    return data;
  },
};
