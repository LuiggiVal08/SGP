import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { defenseService } from '../services/defense.service';
import type { ScheduleDefenseInput, RescheduleDefenseInput } from '../types/defense.types';

export function useDefenses() {
  return useQuery({
    queryKey: ['defenses'],
    queryFn: ({ signal }) => defenseService.list(signal),
    staleTime: 2 * 60 * 1000,
  });
}

export function useDefense(id: string) {
  return useQuery({
    queryKey: ['defenses', id],
    queryFn: ({ signal }) => defenseService.getById(id, signal),
    enabled: Boolean(id),
  });
}

export function useScheduleDefense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ScheduleDefenseInput) => defenseService.schedule(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defenses'] });
    },
  });
}

export function useRescheduleDefense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RescheduleDefenseInput }) =>
      defenseService.reschedule(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defenses'] });
    },
  });
}

export function useRealizeDefense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => defenseService.realize(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defenses'] });
    },
  });
}

export function useCancelDefense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => defenseService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defenses'] });
    },
  });
}
