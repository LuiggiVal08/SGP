import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Chip, Skeleton } from '@heroui/react';
import { Repeat, ReceiptText, ListChecks } from 'lucide-react';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { loopService } from '../services/loop.service';
import { StoryCard } from '../components/StoryCard';
import type { LoopReceipt, LoopStory } from '../types/loop.types';

type TabKey = 'backlog' | 'receipts';

export default function LoopDashboardPage() {
  usePageTitle('Admin - Loop Engineering');
  const [tab, setTab] = useState<TabKey>('backlog');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['loop-state'],
    queryFn: ({ signal }) => loopService.getSnapshot(signal),
    staleTime: 30 * 1000,
  });

  const done = data?.backlog.filter((s: LoopStory) => s.status === 'HECHO').length ?? 0;
  const total = data?.backlog.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Repeat size={22} className="text-primary" /> Loop Engineering
        </h1>
        <p className="text-sm text-muted mt-1">
          Estado del bucle de agentes que avanza el backlog de SGP (XP/TDD +
          verificación externa).
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-surface-secondary">
          <p className="text-[11px] uppercase tracking-wider text-muted">Stories</p>
          <p className="text-2xl font-bold text-foreground">{isLoading ? '—' : total}</p>
        </Card>
        <Card className="p-4 bg-surface-secondary">
          <p className="text-[11px] uppercase tracking-wider text-muted">Hechas</p>
          <p className="text-2xl font-bold text-success">{isLoading ? '—' : done}</p>
        </Card>
        <Card className="p-4 bg-surface-secondary">
          <p className="text-[11px] uppercase tracking-wider text-muted">Estado run</p>
          <p className="text-sm font-semibold text-foreground mt-1">
            {data?.state ? `${data.state.storyId} · ${data.state.status}` : 'sin ciclo'}
          </p>
        </Card>
        <Card className="p-4 bg-surface-secondary">
          <p className="text-[11px] uppercase tracking-wider text-muted">Halt</p>
          <p className="text-sm font-semibold text-foreground mt-1">
            {data?.state?.haltReason ?? '—'}
          </p>
        </Card>
      </div>

      {isError && (
        <Card className="p-4 bg-danger/10 text-danger">
          No se pudo leer el estado del loop (¿LOOP.md presente?).
        </Card>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setTab('backlog')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'backlog'
              ? 'bg-primary/10 text-primary'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <ListChecks size={16} /> Backlog
        </button>
        <button
          onClick={() => setTab('receipts')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'receipts'
              ? 'bg-primary/10 text-primary'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <ReceiptText size={16} /> Recibos
        </button>
      </div>

      {tab === 'backlog' ? (
        isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data?.backlog.map((s: LoopStory) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        )
      ) : (
        <div>
          {!data?.receipts.length ? (
            <Card className="p-6 text-center text-muted bg-surface-secondary">
              Sin ciclos ejecutados aún.
            </Card>
          ) : (
            <div className="mt-2 overflow-x-auto rounded-lg border border-border/60">
              <table
                aria-label="Recibos de ciclos"
                className="w-full text-sm border-collapse"
              >
                <thead>
                  <tr className="border-b border-border/60 bg-surface-secondary text-left text-[11px] uppercase tracking-wider text-muted">
                    <th className="px-3 py-2 font-medium">Story</th>
                    <th className="px-3 py-2 font-medium">Halt</th>
                    <th className="px-3 py-2 font-medium">Tests</th>
                    <th className="px-3 py-2 font-medium">Commit</th>
                    <th className="px-3 py-2 font-medium">Escalado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.receipts.map((r: LoopReceipt, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-border/40 last:border-0 hover:bg-surface-secondary/50"
                    >
                      <td className="px-3 py-2">
                        <Chip size="sm" variant="soft" color="accent">
                          {r.story}
                        </Chip>
                      </td>
                      <td className="px-3 py-2">{r.haltReason || '—'}</td>
                      <td className="px-3 py-2">
                        {r.testsBefore} → {r.testsAfter}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {r.commit || '—'}
                      </td>
                      <td className="px-3 py-2">{r.escalado || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted border-t border-border/60 pt-4">
        El loop corre fuera de la app (scripts/loop-run.sh). La UI es solo
        lectura + puerta humana: el merge lo decide un ADMIN. Nunca auto-merge.
      </p>
    </div>
  );
}
