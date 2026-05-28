import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';

export function useInstitutions() {
  return useQuery({
    queryKey: ['institutions'],
    queryFn: catalogService.getInstitutions,
    staleTime: 5 * 60 * 1000,
  });
}
