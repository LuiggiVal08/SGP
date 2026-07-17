import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';

const PER_PAGE = 10;

export function useTags(page = 1, search = '') {
  return useQuery({
    queryKey: ['tags', 'paginated', page, search],
    queryFn: ({ signal }) => catalogService.getTagsPaginated(page, PER_PAGE, search || undefined, signal),
    placeholderData: (prev) => prev,
  });
}

export function useTagMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tags'] });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; category: 'TECNOLOGIA' | 'TEMA' | 'TUTOR' | 'METODOLOGIA' }) =>
      catalogService.createTag(payload),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Etiqueta creada exitosamente', description: 'La etiqueta ya está disponible.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al crear la etiqueta', description: 'Verifique los datos e intente nuevamente.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; category?: 'TECNOLOGIA' | 'TEMA' | 'TUTOR' | 'METODOLOGIA' } }) =>
      catalogService.updateTag(id, payload),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Etiqueta actualizada exitosamente', description: 'Los cambios han sido guardados.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al actualizar la etiqueta', description: 'Ocurrió un problema al guardar.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteTag(id),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Etiqueta eliminada exitosamente', description: 'La etiqueta ha sido removida.' });
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al eliminar la etiqueta'), description: 'No se pudo eliminar la etiqueta.' });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
