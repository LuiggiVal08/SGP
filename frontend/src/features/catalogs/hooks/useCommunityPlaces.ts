import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';

const PER_PAGE = 10;

export function useCommunityPlaces(page = 1, search = '') {
  return useQuery({
    queryKey: ['community-places', 'paginated', page, search],
    queryFn: ({ signal }) => catalogService.getCommunityPlacesPaginated(page, PER_PAGE, search || undefined, signal),
    placeholderData: (prev) => prev,
  });
}

export function useCommunityPlaceMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['community-places'] });

  const createMutation = useMutation({
    mutationFn: (payload: { institutionId: string; name: string; type: 'COMMUNITY' | 'ORGANIZATION' | 'INSTITUTION' | 'COMPANY'; description?: string; address?: string; contactPhone?: string; contactEmail?: string }) =>
      catalogService.createCommunityPlace(payload),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Espacio comunitario creado exitosamente', description: 'El espacio ya está disponible.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al crear el espacio', description: 'Verifique los datos e intente nuevamente.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { institutionId?: string; name?: string; type?: 'COMMUNITY' | 'ORGANIZATION' | 'INSTITUTION' | 'COMPANY'; description?: string; address?: string; contactPhone?: string; contactEmail?: string } }) =>
      catalogService.updateCommunityPlace(id, payload),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Espacio comunitario actualizado exitosamente', description: 'Los cambios han sido guardados.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al actualizar el espacio', description: 'Ocurrió un problema al guardar.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteCommunityPlace(id),
    onSuccess: () => {
      invalidate();
      sileo.success({ title: 'Espacio comunitario eliminado exitosamente', description: 'El espacio ha sido removido.' });
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al eliminar el espacio'), description: 'No se pudo eliminar el espacio.' });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
