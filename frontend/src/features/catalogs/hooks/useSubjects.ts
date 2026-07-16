import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';

const PER_PAGE = 10;

export function useSubjects(page = 1, search = '') {
  return useQuery({
    queryKey: ['subjects', 'paginated', page, search],
    queryFn: ({ signal }) => catalogService.getSubjectsPaginated(page, PER_PAGE, search || undefined, signal),
    placeholderData: (prev) => prev,
  });
}

export function useSubjectMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['subjects'] });

  const createMutation = useMutation({
    mutationFn: (payload: { trajectoryId: string; name: string }) =>
      catalogService.createSubject(payload),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Materia creada exitosamente', description: 'La materia ya está disponible.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al crear la materia', description: 'Verifique los datos e intente nuevamente.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { trajectoryId?: string; name?: string } }) =>
      catalogService.updateSubject(id, payload),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Materia actualizada exitosamente', description: 'Los cambios han sido guardados.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al actualizar la materia', description: 'Ocurrió un problema al guardar.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteSubject(id),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Materia eliminada exitosamente', description: 'La materia ha sido removida.' });
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al eliminar la materia'), description: 'No se pudo eliminar la materia.' });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
