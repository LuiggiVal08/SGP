import { useState } from 'react';
import {
  Button,
  TextArea,
  Chip,
  Spinner,
  Tooltip,
} from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileCheck2, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { projectService } from '@/features/projects/services/project.service';
import {
  useCorrections,
  useCreateCorrection,
  useResolveCorrection,
  useDeleteCorrection,
} from '../hooks/useCorrections';
import { correctionStatusConfig, type ProjectCorrection } from '../types/correction.types';
import { extractApiError } from '@/shared/utils/extractApiError';
import { sileo } from 'sileo';
import type { ProjectFile } from '@/features/projects/types/project.types';

const createCorrectionSchema = z.object({
  fileId: z.string().uuid('Seleccione el archivo TOMO'),
  comment: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
});

type CreateCorrectionFormData = z.infer<typeof createCorrectionSchema>;

export default function ProjectCorrectionsPage({ projectId }: { projectId: string }) {
  const [formOpen, setFormOpen] = useState(false);

  const { data: corrections = [], isLoading } = useCorrections(projectId);
  const { data: files = [] } = useQuery({
    queryKey: ['project-files', projectId],
    queryFn: ({ signal }) => projectService.getFiles(projectId, signal),
    enabled: Boolean(projectId),
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useCreateCorrection(projectId);
  const resolveMutation = useResolveCorrection(projectId);
  const deleteMutation = useDeleteCorrection(projectId);

  const form = useForm<CreateCorrectionFormData>({
    resolver: zodResolver(createCorrectionSchema),
    defaultValues: { fileId: '', comment: '' },
  });

  const tomoFiles: ProjectFile[] = files.filter((f: ProjectFile) => f.fileType === 'TOMO');

  const submit = form.handleSubmit((values) => {
    createMutation.mutate(
      { projectId, fileId: values.fileId, comment: values.comment || undefined },
      {
        onSuccess: () => {
          sileo.success({ title: 'Corrección registrada', description: 'La corrección sobre el TOMO fue creada.' });
          form.reset({ fileId: '', comment: '' });
          setFormOpen(false);
        },
        onError: (err: unknown) => {
          sileo.error({ title: extractApiError(err, 'Error al crear la corrección') });
        },
      },
    );
  });

  const pendingCount = corrections.filter((c: ProjectCorrection) => c.status === 'PENDIENTE').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-2xl font-semibold pl-3">Correcciones del TOMO</h2>
          <p className="text-sm text-muted pl-3 mt-1">{pendingCount} pendiente(s)</p>
        </div>
        <Button variant="primary" onPress={() => setFormOpen((v) => !v)}>
          <Plus size={16} />
          Nueva corrección
        </Button>
      </div>

      {formOpen && (
        <form onSubmit={submit} className="rounded-xl border border-border p-4 mb-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="corr-file">Archivo TOMO</label>
            <select
              id="corr-file"
              value={form.watch('fileId')}
              onChange={(e) => form.setValue('fileId', e.target.value, { shouldValidate: true })}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            >
              <option value="">Seleccionar TOMO</option>
              {tomoFiles.map((f: ProjectFile) => (
                <option key={f.id} value={f.id}>{f.fileName}</option>
              ))}
            </select>
            {form.formState.errors.fileId && (
              <p className="text-danger text-xs">{form.formState.errors.fileId.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="corr-comment">Comentario</label>
            <TextArea id="corr-comment" {...form.register('comment')} placeholder="Describe la corrección a aplicar…" />
            {form.formState.errors.comment && (
              <p className="text-danger text-xs">{form.formState.errors.comment.message}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" isDisabled={createMutation.isPending || !form.formState.isValid} className="flex-1">
              {createMutation.isPending ? <Spinner size="sm" /> : 'Registrar'}
            </Button>
            <Button type="button" variant="secondary" onPress={() => setFormOpen(false)} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-muted text-center py-8">Cargando…</p>
      ) : corrections.length === 0 ? (
        <div className="py-10 text-center text-muted">
          <FileCheck2 size={32} className="mx-auto mb-2 opacity-40" />
          No hay correcciones registradas para este proyecto.
        </div>
      ) : (
        <ul className="space-y-3">
          {corrections.map((c: ProjectCorrection) => (
            <li key={c.id} className="rounded-xl border border-border p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Chip color={correctionStatusConfig[c.status].color} variant="soft" size="sm">
                    {correctionStatusConfig[c.status].label}
                  </Chip>
                  {c.file?.fileName && <span className="text-xs text-muted truncate">{c.file.fileName}</span>}
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">{c.comment ?? '—'}</p>
                <p className="text-xs text-muted mt-1">
                  {new Date(c.createdAt).toLocaleString()}
                  {c.resolvedAt && ` · Resuelta ${new Date(c.resolvedAt).toLocaleString()}`}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {c.status === 'PENDIENTE' && (
                  <Tooltip>
                    <Tooltip.Trigger>
                      <button
                        onClick={() => resolveMutation.mutate(c.id)}
                        disabled={resolveMutation.isPending}
                        className="p-1.5 rounded-lg text-muted hover:text-success hover:bg-success/10 transition-colors"
                        aria-label="Marcar resuelta"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>Marcar resuelta</Tooltip.Content>
                  </Tooltip>
                )}
                <Tooltip>
                  <Tooltip.Trigger>
                    <button
                      onClick={() => deleteMutation.mutate(c.id)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>Eliminar</Tooltip.Content>
                </Tooltip>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
