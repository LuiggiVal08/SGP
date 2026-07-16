import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';

const PER_PAGE = 10;

export function useTrajectories(page = 1, search = '') {
  return useQuery({
    queryKey: ['trajectories', 'paginated', page, search],
    queryFn: ({ signal }) => catalogService.getTrajectoriesPaginated(page, PER_PAGE, search || undefined, signal),
    placeholderData: (prev) => prev,
  });
}

export function useTrajectoryMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['trajectories'] });

  const createMutation = useMutation({
    mutationFn: (payload: { pnfId: string; name: string; orderNumber: number }) =>
      catalogService.createTrajectory(payload),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Trayecto creado exitosamente', description: 'El trayecto ya está disponible.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al crear el trayecto', description: 'Verifique los datos e intente nuevamente.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { pnfId?: string; name?: string; orderNumber?: number } }) =>
      catalogService.updateTrajectory(id, payload),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Trayecto actualizado exitosamente', description: 'Los cambios han sido guardados.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al actualizar el trayecto', description: 'Ocurrió un problema al guardar.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteTrajectory(id),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Trayecto eliminado exitosamente', description: 'El trayecto ha sido removido.' });
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al eliminar el trayecto'), description: 'No se pudo eliminar el trayecto.' });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
