import { Card, Chip } from '@heroui/react';
import type { LoopStory } from '../types/loop.types';

const statusColor: Record<string, 'success' | 'default' | 'warning'> = {
  HECHO: 'success',
  PENDIENTE: 'default',
  EN_PROGRESO: 'warning',
  EN_REVISION: 'warning',
};

export function StoryCard({ story }: { story: LoopStory }) {
  return (
    <Card className="p-4 flex flex-col gap-2 bg-surface-secondary">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
            {story.epic}
          </p>
          <p className="text-sm font-semibold text-foreground">{story.title}</p>
        </div>
        <Chip size="sm" variant="soft" color="accent">
          {story.id}
        </Chip>
      </div>
      <div className="flex items-center gap-2">
        <Chip size="sm" variant="soft" color={statusColor[story.status] ?? 'default'}>
          {story.status}
        </Chip>
        {story.hardRule && (
          <Chip size="sm" variant="soft" color="danger">
            Regla dura
          </Chip>
        )}
      </div>
    </Card>
  );
}
