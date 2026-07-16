import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Skeleton } from '@heroui/react';
import { projectService } from '../services/project.service';
import { FileText, Trash2 } from 'lucide-react';
import { FilePreviewModal } from './FilePreviewModal';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';
import type { ProjectFile } from '../types/project.types';

interface Props {
  projectId: string;
}

const fileTypeLabels: Record<string, string> = {
  TOMO: 'Tomo',
  RESUMEN: 'Resumen',
};

function formatDate(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ProjectFilesSection({ projectId }: Props) {
  const queryClient = useQueryClient();
  const { data: files = [], isLoading } = useQuery({
    queryKey: ['project-files', projectId],
    queryFn: ({ signal }) => projectService.getFiles(projectId, signal),
  });

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => projectService.deleteFile(projectId, fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
      sileo.success({ title: 'Archivo eliminado exitosamente', description: 'El archivo ya no está disponible.' });
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al eliminar el archivo'), description: 'Ocurrió un problema al eliminar el archivo.' });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-3/4 rounded-lg" />
      </div>
    );
  }

  if (files.length === 0) {
    return <p className="text-sm text-muted">No hay archivos subidos.</p>;
  }

  return (
    <div className="space-y-2">
      {files.map((file: ProjectFile) => (
        <div
          key={file.id}
          className="flex items-center justify-between rounded-lg border border-border/50 bg-surface/30 p-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
              <FileText size={16} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{file.fileName}</p>
              <p className="text-xs text-muted">
                {fileTypeLabels[file.fileType] ?? file.fileType}
                {file.createdAt && (
                  <>
                    <span className="mx-1.5">·</span>
                    {formatDate(file.createdAt)}
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <FilePreviewModal file={file} />
            <Button
              variant="ghost"
              size="sm"
              isDisabled={deleteMutation.isPending}
              onPress={() => deleteMutation.mutate(file.id)}
              className="text-muted hover:text-danger hover:bg-danger/10 min-w-0 px-2"
              aria-label="Eliminar archivo"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
