import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDefenses, useScheduleDefense } from '@/features/defenses/hooks/useDefenses';
import * as defenseServiceModule from '@/features/defenses/services/defense.service';

vi.mock('@/features/defenses/services/defense.service', () => ({
  defenseService: {
    list: vi.fn(),
    schedule: vi.fn(),
  },
}));

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe('useDefenses hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useDefenses fetches the list', async () => {
    vi.mocked(defenseServiceModule.defenseService.list).mockResolvedValue([{ id: 'd1' } as never]);
    const { result } = renderHook(() => useDefenses(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 'd1' }]);
    expect(defenseServiceModule.defenseService.list).toHaveBeenCalled();
  });

  it('useScheduleDefense calls schedule and invalidates queries', async () => {
    const invalidate = vi.fn();
    vi.mocked(defenseServiceModule.defenseService.schedule).mockResolvedValue({ id: 'd2' } as never);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const orig = client.invalidateQueries.bind(client);
    client.invalidateQueries = ((...args: never[]) => {
      invalidate(...args);
      return orig(...args);
    }) as typeof orig;
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useScheduleDefense(), { wrapper: Wrapper });
    await result.current.mutateAsync({ projectId: 'p1', scheduledDate: '2026-08-01T10:00:00.000Z', judges: [] });
    expect(defenseServiceModule.defenseService.schedule).toHaveBeenCalled();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['defenses'] });
  });
});
