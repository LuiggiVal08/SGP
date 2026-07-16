import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';

export function useUsers(role?: string) {
  return useQuery({
    queryKey: ['users', role],
    queryFn: ({ signal }) => catalogService.getUsers(role, signal),
    staleTime: 5 * 60 * 1000,
  });
}
