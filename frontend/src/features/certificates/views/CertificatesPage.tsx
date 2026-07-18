import { useState } from 'react';
import { Award, ExternalLink, FileText, Search } from 'lucide-react';
import {
  Input,
  Table,
  Chip,
  Spinner,
  Tooltip,
} from '@heroui/react';
import { useDebouncedCallback } from 'use-debounce';
import { useCertificates } from '../hooks/useCertificates';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';

const PER_PAGE = 10;

export default function CertificatesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCertificates({
    page,
    limit: PER_PAGE,
    search: search || undefined,
  });

  const items = data?.data ?? [];
  const totalPages = Math.max(1, data?.meta.totalPages ?? 1);

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-2xl font-semibold pl-3">Certificados de Culminación</h2>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 max-w-sm flex-1">
          <Search size={18} className="text-muted shrink-0" />
          <Input
            placeholder="Buscar por serial…"
            defaultValue=""
            onChange={(e) => debouncedSetSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="md" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Award className="size-7" />}
          message="No hay certificados de culminación."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border/60 max-h-[70vh]">
            <Table>
              <Table.Content aria-label="Certificados de culminación">
                <Table.Header className="sticky top-0 z-10 bg-surface-secondary/95 backdrop-blur-sm [&_th]:text-xs [&_th]:font-semibold [&_th]:text-muted [&_th]:uppercase [&_th]:tracking-wider">
                  <Table.Column id="serial" isRowHeader>Serial</Table.Column>
                  <Table.Column id="author">Autor (ID)</Table.Column>
                  <Table.Column id="issued">Emitido</Table.Column>
                  <Table.Column id="actions" className="w-24">Acciones</Table.Column>
                </Table.Header>
                <Table.Body
                  items={items}
                  renderEmptyState={() => (
                    <EmptyState message="No se encontraron certificados." />
                  )}
                >
                  {(c) => (
                    <Table.Row className="even:bg-surface-secondary/30 hover:bg-primary/[0.06] transition-colors">
                      <Table.Cell>
                        <Chip size="sm" color="accent">
                          {c.serialNumber}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="font-mono text-xs text-muted">{c.authorId}</span>
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(c.issuedAt).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <Tooltip.Trigger>
                              <a
                                href={c.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                                aria-label="Ver certificado"
                              >
                                <ExternalLink size={16} />
                              </a>
                            </Tooltip.Trigger>
                            <Tooltip.Content>Ver / descargar</Tooltip.Content>
                          </Tooltip>
                          <Tooltip>
                            <Tooltip.Trigger>
                              <a
                                href={c.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                                aria-label="Descargar certificado"
                              >
                                <FileText size={16} />
                              </a>
                            </Tooltip.Trigger>
                            <Tooltip.Content>Descargar PDF</Tooltip.Content>
                          </Tooltip>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Content>
            </Table>
          </div>
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
