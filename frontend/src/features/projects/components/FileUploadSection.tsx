import { useState, useCallback, useRef } from 'react';
import { Button, Select, ListBox } from '@heroui/react';
import { useDropzone } from 'react-dropzone';
import { useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/project.service';
import { sileo } from 'sileo';
import { FileUp, File, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { FileType } from '../types/project.types';

const fileTypeOptions: { value: FileType; label: string }[] = [
  { value: 'TOMO', label: 'Tomo' },
  { value: 'RESUMEN', label: 'Resumen' },
];

type EntryStatus = 'pending' | 'uploading' | 'success' | 'error';

interface FileEntry {
  file: File;
  fileType: FileType;
  uid: string;
  status: EntryStatus;
}

interface Props {
  projectId: string;
}

export function FileUploadSection({ projectId }: Props) {
  const queryClient = useQueryClient();
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const uidRef = useRef(0);

  const nextUid = useCallback(() => {
    uidRef.current += 1;
    return `file-${uidRef.current}-${Date.now()}`;
  }, []);

  const onDrop = useCallback((dropped: File[]) => {
    setEntries((prev) => [
      ...prev,
      ...dropped.map((f) => ({ file: f, fileType: 'TOMO' as FileType, uid: nextUid(), status: 'pending' as EntryStatus })),
    ]);
  }, [nextUid]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 50 * 1024 * 1024,
  });

  const removeEntry = (uid: string) => {
    setEntries((prev) => prev.filter((e) => e.uid !== uid));
  };

  const updateFileType = (uid: string, fileType: FileType) => {
    setEntries((prev) =>
      prev.map((e) => (e.uid === uid ? { ...e, fileType } : e)),
    );
  };

  const updateStatus = (uid: string, status: EntryStatus) => {
    setEntries((prev) =>
      prev.map((e) => (e.uid === uid ? { ...e, status } : e)),
    );
  };

  const uploadAll = async () => {
    setIsUploading(true);
    for (const entry of entries) {
      if (entry.status === 'success') continue;
      updateStatus(entry.uid, 'uploading');
      try {
        await projectService.uploadFile(projectId, entry.file, entry.fileType);
        updateStatus(entry.uid, 'success');
        sileo.success({ title: `${entry.file.name} subido exitosamente`, description: 'El archivo se ha agregado al proyecto.' });
      } catch {
        updateStatus(entry.uid, 'error');
        sileo.error({ title: `Error al subir ${entry.file.name}`, description: 'Verifique el archivo e intente nuevamente.' });
      }
    }
    queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
    setIsUploading(false);
  };

  const hasError = entries.some((e) => e.status === 'error');
  const allSuccess = entries.length > 0 && entries.every((e) => e.status === 'success');
  const canUpload = !isUploading && !allSuccess;

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
        <input {...getInputProps()} aria-label="Seleccionar archivos PDF" />
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
          {entries.map((entry) => (
            <div
              key={entry.uid}
              className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border"
            >
              {entry.status === 'uploading' ? (
                <Loader2 size={18} className="text-primary shrink-0 animate-spin" />
              ) : entry.status === 'success' ? (
                <CheckCircle2 size={18} className="text-success shrink-0" />
              ) : entry.status === 'error' ? (
                <XCircle size={18} className="text-danger shrink-0" />
              ) : (
                <File size={18} className="text-muted shrink-0" />
              )}
              <span className="text-sm flex-1 truncate">{entry.file.name}</span>
              <Select
                aria-label="Tipo de archivo"
                selectedKey={entry.fileType}
                onSelectionChange={(key) => updateFileType(entry.uid, key as FileType)}
                isDisabled={entry.status === 'uploading' || entry.status === 'success'}
                placeholder="Tipo"
                className="min-w-32"
              >
                <Select.Trigger className="border border-border rounded-md px-2 py-1 text-xs bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover className="bg-background border border-border rounded-lg shadow-lg min-w-40">
                  <ListBox>
                    {fileTypeOptions.map((opt) => (
                      <ListBox.Item key={opt.value} id={opt.value} textValue={opt.label} className="px-3 py-2 text-xs hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                        {opt.label}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
              <button
                onClick={() => removeEntry(entry.uid)}
                className="text-xs text-danger hover:underline cursor-pointer shrink-0"
                aria-label={`Quitar archivo ${entry.file.name}`}
                disabled={entry.status === 'uploading'}
              >
                Quitar
              </button>
            </div>
          ))}

          <div className="flex justify-end">
            <Button
              variant="primary"
              onPress={uploadAll}
              isDisabled={!canUpload}
            >
              {isUploading ? 'Subiendo…' : `Subir ${entries.length} archivo${entries.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      )}

      {hasError && (
        <p className="text-danger text-sm text-center">
          Algunos archivos no se pudieron subir. Intente nuevamente.
        </p>
      )}
    </div>
  );
}
