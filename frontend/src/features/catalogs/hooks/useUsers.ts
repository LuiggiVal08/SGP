import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';

export function useUsers(role?: string) {
  return useQuery({
    queryKey: ['users', role],
    queryFn: () => catalogService.getUsers(role),
    staleTime: 5 * 60 * 1000,
  });
}
