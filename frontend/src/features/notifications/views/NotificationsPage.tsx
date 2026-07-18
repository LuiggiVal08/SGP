import { useState, type ChangeEvent } from 'react';
import { Bell, CheckCheck, Search } from 'lucide-react';
import {
  Button,
  Input,
  Chip,
  Spinner,
} from '@heroui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { useMarkAllAsRead } from '../hooks/useNotifications';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';
import { EmptyState } from '@/shared/components/EmptyState';

const PER_PAGE = 10;

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | 'READ' | 'UNREAD'>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'page', { page, search, status }],
    queryFn: ({ signal }) =>
      notificationService.list(
        {
          page,
          limit: PER_PAGE,
          search: search || undefined,
          status: status === 'ALL' ? undefined : (status as 'READ' | 'UNREAD'),
        },
        signal,
      ),
    staleTime: 30 * 1000,
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: unknown) =>
      sileo.error({ title: extractApiError(err, 'No se pudo marcar como leída') }),
  });

  const markAllAsRead = useMarkAllAsRead();

  const items = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.max(1, data?.meta.totalPages ?? 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-2xl font-semibold pl-3">Notificaciones</h2>
        </div>
        <Button
          variant="primary"
          onPress={() =>
            markAllAsRead.mutate(undefined, {
              onSuccess: () => sileo.success({ title: 'Todas marcadas como leídas' }),
            })
          }
          isDisabled={markAllAsRead.isPending || total === 0}
        >
          <CheckCheck size={16} />
          Marcar todas como leídas
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 max-w-sm flex-1">
          <Search size={18} className="text-muted shrink-0" />
          <Input
            placeholder="Buscar notificaciones…"
            defaultValue=""
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as 'ALL' | 'READ' | 'UNREAD');
            setPage(1);
          }}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        >
          <option value="ALL">Todas</option>
          <option value="UNREAD">No leídas</option>
          <option value="READ">Leídas</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="md" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={<Bell className="size-7" />} message="No hay notificaciones." />
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const isUnread = n.readAt === null;
            return (
              <li
                key={n.id}
                className={`flex items-start justify-between gap-3 rounded-xl border border-border/60 px-4 py-3 ${
                  isUnread ? 'bg-primary/[0.05]' : ''
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${isUnread ? 'font-semibold' : ''}`}>{n.title}</p>
                    <Chip size="sm" color={isUnread ? 'accent' : 'default'}>
                      {isUnread ? 'Nueva' : 'Leída'}
                    </Chip>
                  </div>
                  <p className="text-sm text-muted">{n.message}</p>
                  <p className="mt-1 text-xs text-muted/70">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {isUnread && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => markAsRead.mutate(n.id)}
                    isDisabled={markAsRead.isPending}
                  >
                    Marcar leída
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            isDisabled={page <= 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="px-2 py-1 text-sm text-muted">
            Página {page} de {totalPages}
          </span>
          <Button
            size="sm"
            variant="ghost"
            isDisabled={page >= totalPages}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
