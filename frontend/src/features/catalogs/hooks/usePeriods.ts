import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';

export function usePeriods() {
  return useQuery({
    queryKey: ['periods'],
    queryFn: ({ signal }) => catalogService.getPeriodsPaginated(1, 100, undefined, signal),
    staleTime: 5 * 60 * 1000,
  });
}
