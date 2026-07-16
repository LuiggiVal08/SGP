import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/store/auth.store';
import { profileService, type UpdateProfilePayload } from '../services/profile.service';

export function useProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  const userFromStore = useAuthStore((s) => s.user);

  const query = useQuery({
    queryKey: ['profile'],
    queryFn: ({ signal }) => profileService.getMe(signal),
  });

  useEffect(() => {
    if (query.data && query.data.id && query.data.id !== userFromStore?.id) {
      setUser(query.data);
    }
  }, [query.data, userFromStore, setUser]);

  return query;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateMe(payload),
    onSuccess: async () => {
      const updated = await queryClient.fetchQuery({
        queryKey: ['profile'],
        queryFn: ({ signal }) => profileService.getMe(signal),
      });
      setUser(updated);
    },
  });
}
