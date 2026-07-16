import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';

const PER_PAGE = 10;

export function useCommunityTutors(page = 1, search = '') {
  return useQuery({
    queryKey: ['community-tutors', 'paginated', page, search],
    queryFn: ({ signal }) => catalogService.getCommunityTutorsPaginated(page, PER_PAGE, search || undefined, signal),
    placeholderData: (prev) => prev,
  });
}

export function useCommunityTutorMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['community-tutors'] });

  const createMutation = useMutation({
    mutationFn: (payload: { locationId: string; fullName?: string; dni?: string; phone?: string; email?: string; position?: string }) =>
      catalogService.createCommunityTutor(payload),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Tutor comunitario creado exitosamente', description: 'El tutor ya está disponible.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al crear el tutor', description: 'Verifique los datos e intente nuevamente.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { locationId?: string; fullName?: string; dni?: string; phone?: string; email?: string; position?: string } }) =>
      catalogService.updateCommunityTutor(id, payload),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Tutor comunitario actualizado exitosamente', description: 'Los cambios han sido guardados.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al actualizar el tutor', description: 'Ocurrió un problema al guardar.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteCommunityTutor(id),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Tutor comunitario eliminado exitosamente', description: 'El tutor ha sido removido.' });
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al eliminar el tutor'), description: 'No se pudo eliminar el tutor.' });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
