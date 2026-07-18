import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { correctionService } from '../services/correction.service';
import type { CreateCorrectionInput } from '../types/correction.types';

export function useCorrections(projectId: string) {
  return useQuery({
    queryKey: ['corrections', projectId],
    queryFn: ({ signal }) => correctionService.listByProject(projectId, signal),
    enabled: Boolean(projectId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateCorrection(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCorrectionInput) => correctionService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrections', projectId] });
    },
  });
}

export function useResolveCorrection(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => correctionService.resolve(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrections', projectId] });
    },
  });
}

export function useDeleteCorrection(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => correctionService.remove(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrections', projectId] });
    },
  });
}
