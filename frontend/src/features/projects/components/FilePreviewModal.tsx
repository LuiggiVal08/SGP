import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Modal,
  Button,
  Spinner,
} from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { Eye, FileText, ExternalLink, AlertTriangle } from 'lucide-react';
import type { ProjectFile } from '../types/project.types';

interface Props {
  file: ProjectFile;
}

export function FilePreviewModal({ file }: Props) {
  const previewModal = useOverlayState();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoadingBlob, setIsLoadingBlob] = useState(false);
  const [blobError, setBlobError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);
  const blobUrlRef = useRef<string | null>(null);

  const isPdf = file.urlPath.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.urlPath);

  const revokeBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
      setBlobUrl(null);
    }
  }, []);

  const fetchBlob = useCallback(async () => {
    const fetchId = ++fetchIdRef.current;
    revokeBlob();
    setIsLoadingBlob(true);
    setBlobError(null);
    try {
      const response = await fetch(file.urlPath);
      if (!response.ok) throw new Error('Error al cargar el archivo');
      const blob = await response.blob();
      if (fetchId !== fetchIdRef.current) return;
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      setBlobUrl(url);
    } catch (err) {
      if (fetchId !== fetchIdRef.current) return;
      setBlobError(err instanceof Error ? err.message : 'Error al cargar el archivo');
    } finally {
      if (fetchId === fetchIdRef.current) {
        setIsLoadingBlob(false);
      }
    }
  }, [file.urlPath, revokeBlob]);

  const handleOpen = useCallback(() => {
    fetchBlob();
    previewModal.open();
  }, [fetchBlob, previewModal]);

  useEffect(() => {
    return () => {
      revokeBlob();
    };
  }, [previewModal.isOpen, revokeBlob]);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onPress={handleOpen}
        className="text-muted hover:text-foreground hover:bg-surface-secondary min-w-0 px-2"
        aria-label={`Vista previa de ${file.fileName}`}
      >
        <Eye size={16} />
      </Button>

      <Modal.Root state={previewModal}>
        <Modal.Backdrop>
          <Modal.Container size="full">
            <Modal.Dialog className="sm:max-w-[95vw] h-[92vh] overflow-hidden">
              <Modal.Header>
                <Modal.Icon className="bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </Modal.Icon>
                <Modal.Heading className="truncate max-w-md">
                  {file.fileName}
                </Modal.Heading>
                <div className="flex items-center gap-2 ml-auto">
                  <a
                    href={file.urlPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors"
                    aria-label="Abrir en nueva pestaña"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <Modal.CloseTrigger />
                </div>
              </Modal.Header>
              <Modal.Body className="p-0">
                {isPdf ? (
                  isLoadingBlob ? (
                    <div className="flex items-center justify-center h-full">
                      <Spinner size="lg" aria-label="Cargando archivo…" />
                    </div>
                  ) : blobError ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-muted">
                      <AlertTriangle size={48} className="text-danger" />
                      <p className="text-danger">{blobError}</p>
                      <a
                        href={file.urlPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        Abrir directamente
                      </a>
                    </div>
                  ) : blobUrl ? (
                    <iframe
                      src={blobUrl}
                      className="w-full h-full rounded-b-lg"
                      title={file.fileName}
                    />
                  ) : null
                ) : isImage ? (
                  <div className="flex items-center justify-center h-full p-4">
                    <img
                      src={file.urlPath}
                      alt={file.fileName}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-muted">
                    <FileText size={48} />
                    <p>Vista previa no disponible para este tipo de archivo</p>
                    <a
                      href={file.urlPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      Abrir en nueva pestaña
                    </a>
                  </div>
                )}
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>
    </>
  );
}
