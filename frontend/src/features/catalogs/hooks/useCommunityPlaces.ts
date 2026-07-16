import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';

export function useCommunityPlaces() {
  return useQuery({
    queryKey: ['communityPlaces'],
    queryFn: ({ signal }) => catalogService.getCommunityPlacesPaginated(1, 100, undefined, signal),
    staleTime: 5 * 60 * 1000,
    select: (result) => result.data,
  });
}
