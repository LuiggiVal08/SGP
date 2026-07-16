import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';

const PER_PAGE = 10;

export function usePeriods(page = 1, search = '') {
  return useQuery({
    queryKey: ['periods', 'paginated', page, search],
    queryFn: ({ signal }) => catalogService.getPeriodsPaginated(page, PER_PAGE, search || undefined, signal),
    placeholderData: (prev) => prev,
  });
}

export function usePeriodMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['periods'] });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; startDate: string; endDate: string; isActive?: boolean }) =>
      catalogService.createPeriod(payload),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Periodo creado exitosamente', description: 'El periodo ya está disponible.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al crear el periodo', description: 'Verifique los datos e intente nuevamente.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; startDate?: string; endDate?: string; isActive?: boolean } }) =>
      catalogService.updatePeriod(id, payload),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Periodo actualizado exitosamente', description: 'Los cambios han sido guardados.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al actualizar el periodo', description: 'Ocurrió un problema al guardar.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deletePeriod(id),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Periodo eliminado exitosamente', description: 'El periodo ha sido removido.' });
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al eliminar el periodo'), description: 'No se pudo eliminar el periodo.' });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
