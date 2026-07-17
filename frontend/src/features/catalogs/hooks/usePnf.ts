import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';

export function usePnf(institutionId?: string) {
  return useQuery({
    queryKey: institutionId ? ['pnf', institutionId] : ['pnf'],
    queryFn: ({ signal }) => catalogService.getPnfs(institutionId, signal),
    staleTime: 5 * 60 * 1000,
    enabled: institutionId ? !!institutionId : true,
  });
}
