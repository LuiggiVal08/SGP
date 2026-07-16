import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: ({ signal }) => catalogService.getSubjectsPaginated(1, 100, undefined, signal),
    staleTime: 5 * 60 * 1000,
  });
}
