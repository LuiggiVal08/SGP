import { useParams, Link } from 'react-router-dom';
import { Card, Chip } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '../services/project.service';
import { FileUploadSection } from '../components/FileUploadSection';
import { ArrowLeft } from 'lucide-react';
import type { ProjectStatus } from '../types/project.types';

const statusConfig: Record<ProjectStatus, { color: 'success' | 'warning' | 'danger'; label: string }> = {
  COMPLETED: { color: 'success', label: 'Completado' },
  PENDING_VALIDATION: { color: 'warning', label: 'Pendiente' },
  REJECTED: { color: 'danger', label: 'Rechazado' },
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAll,
  });

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Proyecto no encontrado</p>
        <Link to="/" className="text-primary text-sm hover:underline mt-2 inline-block">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Volver
      </Link>

      <Card.Root variant="secondary" className="border border-border">
        <Card.Content className="p-6 space-y-3">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold text-foreground">{project.title}</h2>
            <Chip color={statusConfig[project.status].color} variant="soft" size="sm">
              {statusConfig[project.status].label}
            </Chip>
          </div>
          <p className="text-sm text-muted">Año: {project.year}</p>
        </Card.Content>
      </Card.Root>

      <Card.Root variant="secondary" className="border border-border">
        <Card.Content className="p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Subir Tomos</h3>
          <FileUploadSection projectId={project.id} />
        </Card.Content>
      </Card.Root>
    </div>
  );
}
