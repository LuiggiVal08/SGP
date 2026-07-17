import { useState } from 'react';
import { Input, Table, Skeleton } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { Search, History } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { activityLogService } from '../services/activityLog.service';
import type { ActivityLogEntry } from '../types/activity-log.types';

const PER_PAGE = 15;

const actionLabels: Record<string, string> = {
  CREATE: 'Creación',
  UPDATE: 'Actualización',
  DELETE: 'Eliminación',
  UPLOAD: 'Subida',
  STATUS_CHANGE: 'Cambio de estado',
  TOGGLE_ACTIVE: 'Activación/Desactivación',
};

const entityLabels: Record<string, string> = {
  PROJECT: 'Proyecto',
  USER: 'Usuario',
  CAREER: 'PNF',
  INSTITUTION: 'Institución',
  FILE: 'Archivo',
};

export default function ActivityLogPage() {
  usePageTitle('Admin - Registro de Actividad');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: logsData, isLoading, isError } = useQuery({
    queryKey: ['activity-logs', page, search || undefined],
    queryFn: ({ signal }) =>
      activityLogService.getAll(
        page,
        PER_PAGE,
        search || undefined,
        signal,
      ),
    staleTime: 30 * 1000,
  });

  const logs = logsData?.data ?? [];
  const meta = logsData?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-2xl font-semibold pl-3">Registro de Actividad</h2>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 max-w-sm">
        <Search size={18} className="text-muted shrink-0" />
        <Input
          placeholder="Buscar por descripción…"
          defaultValue=""
          onChange={(e) => debouncedSetSearch(e.target.value)}
        />
      </div>

      {isError ? (
        <div className="text-center py-12">
          <p className="text-danger mb-2">Error al cargar los datos</p>
          <p className="text-sm text-muted mb-4">
            Verifique su conexión e intente nuevamente.
          </p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-3/4 rounded-lg" />
        </div>
      ) : (
        <>
          <Table>
            <Table.Content aria-label="Registro de actividad">
              <Table.Header>
                <Table.Column id="date">Fecha/Hora</Table.Column>
                <Table.Column id="user">Usuario</Table.Column>
                <Table.Column id="action">Acción</Table.Column>
                <Table.Column id="entity">Entidad</Table.Column>
                <Table.Column id="description">Detalle</Table.Column>
              </Table.Header>
              <Table.Body
                items={logs}
                renderEmptyState={() => (
                  <EmptyState
                    message={
                      search
                        ? 'No se encontraron registros.'
                        : 'No hay actividad registrada.'
                    }
                    icon={<History size={48} className="text-muted/40" />}
                  />
                )}
              >
                {(log: ActivityLogEntry) => (
                  <Table.Row className="even:bg-surface-secondary/40 hover:bg-surface-secondary/80 transition-all duration-150">
                    <Table.Cell className="text-sm whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </Table.Cell>
                    <Table.Cell className="text-sm">
                      {log.user
                        ? `${log.user.firstName} ${log.user.lastName}`
                        : log.userId}
                    </Table.Cell>
                    <Table.Cell className="text-sm">
                      {actionLabels[log.action] ?? log.action}
                    </Table.Cell>
                    <Table.Cell className="text-sm">
                      {entityLabels[log.entityType] ?? log.entityType}
                    </Table.Cell>
                    <Table.Cell className="text-sm text-muted max-w-xs truncate">
                      {log.description ?? '-'}
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table>
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
