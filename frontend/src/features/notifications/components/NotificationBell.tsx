import { Bell, CheckCheck } from 'lucide-react';
import { Dropdown, Tooltip, Spinner } from '@heroui/react';
import { Link } from 'react-router-dom';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';
import type { Notification } from '../services/notification.service';

function NotificationRow({ n, onRead }: { n: Notification; onRead: (id: string) => void }) {
  const isUnread = n.readAt === null;
  return (
    <li
      className={`flex flex-col gap-1 rounded-lg px-3 py-2.5 transition-colors ${
        isUnread ? 'bg-primary/[0.06]' : 'hover:bg-surface-secondary'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => isUnread && onRead(n.id)}
          className="flex-1 text-left"
          aria-label={isUnread ? `Marcar "${n.title}" como leída` : n.title}
        >
          <p className={`text-sm ${isUnread ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
            {n.title}
          </p>
          <p className="text-xs text-muted line-clamp-2">{n.message}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-muted/70">
            {new Date(n.createdAt).toLocaleString()}
          </p>
        </button>
        {isUnread && (
          <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" aria-label="No leída" />
        )}
      </div>
    </li>
  );
}

export function NotificationBell() {
  const { data, isLoading } = useNotifications({ limit: 8 });
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleRead = (id: string) => {
    markAsRead.mutate(id, {
      onError: (err: unknown) =>
        sileo.error({ title: extractApiError(err, 'No se pudo marcar como leída') }),
    });
  };

  const handleReadAll = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => sileo.success({ title: 'Todas las notificaciones marcadas como leídas' }),
      onError: (err: unknown) =>
        sileo.error({ title: extractApiError(err, 'No se pudieron marcar como leídas') }),
    });
  };

  const items = data?.data ?? [];

  return (
    <Dropdown.Root>
      <Tooltip>
        <Tooltip.Trigger>
          <Dropdown.Trigger>
            <span
              className="relative inline-flex p-2 rounded-xl text-muted hover:text-primary hover:bg-primary/10 transition-colors"
              aria-label="Notificaciones"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-4 justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-4 text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </span>
          </Dropdown.Trigger>
        </Tooltip.Trigger>
        <Tooltip.Content>Notificaciones</Tooltip.Content>
      </Tooltip>
      <Dropdown.Popover className="rounded-xl" placement="bottom right">
        <div className="w-80 max-w-[90vw]">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <span className="text-sm font-semibold">Notificaciones</span>
            <button
              type="button"
              onClick={handleReadAll}
              disabled={markAllAsRead.isPending || unreadCount === 0}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
            >
              <CheckCheck size={14} />
              Marcar todas
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner size="sm" />
              </div>
            ) : items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted">
                No tienes notificaciones.
              </p>
            ) : (
              <ul className="divide-y divide-border/40">
                {items.map((n) => (
                  <NotificationRow key={n.id} n={n} onRead={handleRead} />
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-border/60 p-2">
            <Link
              to="/notificaciones"
              className="block rounded-lg px-3 py-2 text-center text-xs text-primary hover:bg-primary/10 transition-colors"
            >
              Ver todas
            </Link>
          </div>
        </div>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}
