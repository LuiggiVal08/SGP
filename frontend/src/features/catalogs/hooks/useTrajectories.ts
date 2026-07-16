import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';

export function useTrajectories() {
  return useQuery({
    queryKey: ['trajectories'],
    queryFn: ({ signal }) => catalogService.getTrajectoriesPaginated(1, 100, undefined, signal),
    staleTime: 5 * 60 * 1000,
    select: (result) => result.data,
  });
}
