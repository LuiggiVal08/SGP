import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';

export function useCareers() {
  return useQuery({
    queryKey: ['careers'],
    queryFn: catalogService.getCareers,
    staleTime: 5 * 60 * 1000,
  });
}
