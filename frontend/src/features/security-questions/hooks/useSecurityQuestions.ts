import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { securityQuestionsService } from '../services/security-questions.service';
import type { SetSecurityQuestionsPayload } from '../types/security-questions.types';

export function useAvailableQuestions() {
  return useQuery({
    queryKey: ['security-questions', 'available'],
    queryFn: ({ signal }) => securityQuestionsService.getAvailableQuestions(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyQuestions() {
  return useQuery({
    queryKey: ['security-questions', 'mine'],
    queryFn: ({ signal }) => securityQuestionsService.getMyQuestions(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSetMyQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SetSecurityQuestionsPayload) =>
      securityQuestionsService.setMyQuestions(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-questions', 'mine'] });
    },
  });
}

export function useHasSecurityQuestions() {
  return useQuery({
    queryKey: ['security-questions', 'mine'],
    queryFn: ({ signal }) => securityQuestionsService.getMyQuestions(signal),
    select: (data) => data.length > 0,
  });
}
