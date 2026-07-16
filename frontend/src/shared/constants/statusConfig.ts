import type { ProjectStatus } from '@/features/projects/types/project.types';

export const statusConfig: Record<ProjectStatus, { color: 'success' | 'warning' | 'danger'; label: string }> = {
  COMPLETED: { color: 'success', label: 'Completado' },
  PENDING_VALIDATION: { color: 'warning', label: 'Pendiente' },
  REJECTED: { color: 'danger', label: 'Rechazado' },
};
