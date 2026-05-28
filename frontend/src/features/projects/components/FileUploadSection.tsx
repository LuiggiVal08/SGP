import { useState, useCallback } from 'react';
import { Button } from '@heroui/react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/project.service';
import { FileUp, File } from 'lucide-react';
import type { FileType } from '../types/project.types';

const fileTypeOptions: { value: FileType; label: string }[] = [
  { value: 'THESIS_PDF', label: 'Tesis PDF' },
  { value: 'SOURCE_CODE', label: 'Código Fuente' },
  { value: 'BUSINESS_PLAN', label: 'Plan de Negocio' },
];

interface FileEntry {
  file: File;
  fileType: FileType;
}

interface Props {
  projectId: string;
}

export function FileUploadSection({ projectId }: Props) {
  const queryClient = useQueryClient();
  const [entries, setEntries] = useState<FileEntry[]>([]);

  const onDrop = useCallback((dropped: File[]) => {
    setEntries((prev) => [
      ...prev,
      ...dropped.map((f) => ({ file: f, fileType: 'THESIS_PDF' as FileType })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 50 * 1024 * 1024,
  });

  const mutation = useMutation({
    mutationFn: ({ file, fileType }: FileEntry) =>
      projectService.uploadFile(projectId, file, fileType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
    },
  });

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFileType = (index: number, fileType: FileType) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, fileType } : e)),
    );
  };

  const uploadAll = () => {
    entries.forEach((entry) => mutation.mutate(entry));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted'
        }`}
      >
        <input {...getInputProps()} />
        <FileUp size={36} className="mx-auto text-muted mb-2" />
        {isDragActive ? (
          <p className="text-sm text-primary">Suelta los archivos aquí…</p>
        ) : (
          <div>
            <p className="text-sm text-foreground font-medium">
              Arrastra y suelta tus archivos PDF aquí
            </p>
            <p className="text-xs text-muted mt-1">
              o haz clic para seleccionar (máx. 50 MB por archivo)
            </p>
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border"
            >
              <File size={18} className="text-muted shrink-0" />
              <span className="text-sm flex-1 truncate">{entry.file.name}</span>
              <select
                value={entry.fileType}
                onChange={(e) => updateFileType(i, e.target.value as FileType)}
                className="border border-border rounded-md px-2 py-1 text-xs bg-background text-foreground"
              >
                {fileTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeEntry(i)}
                className="text-xs text-danger hover:underline cursor-pointer shrink-0"
              >
                Quitar
              </button>
            </div>
          ))}

          <div className="flex justify-end">
            <Button
              variant="primary"
              onPress={uploadAll}
              isDisabled={mutation.isPending}
            >
              {mutation.isPending ? 'Subiendo…' : `Subir ${entries.length} archivo${entries.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      )}

      {mutation.isError && (
        <p className="text-danger text-sm text-center">
          Error al subir archivos. Intente nuevamente.
        </p>
      )}
    </div>
  );
}
