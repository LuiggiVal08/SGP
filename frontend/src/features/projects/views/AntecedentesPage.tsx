import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Input, Select, ListBox, Spinner, Button, Card } from '@heroui/react';
import { Search, FileText, Download, BookOpen } from 'lucide-react';
import { projectService } from '@/features/projects/services/project.service';
import { usePageTitle } from '@/shared/hooks/usePageTitle';

const METHODOLOGIES = [
  'Cuantitativa',
  'Cualitativa',
  'Mixta',
  'Investigación-Acción',
  'Experimental',
  'No experimental',
  'Documental',
  'De campo',
  'Proyecto factible',
];

export default function AntecedentesPage() {
  usePageTitle('Antecedentes');
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [methodology, setMethodology] = useState<string | undefined>(undefined);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [page, setPage] = useState(1);

  const filters: Record<string, string | undefined> = {
    status: 'COMPLETED',
    search: search || undefined,
    methodology: methodology || undefined,
    yearFrom: yearFrom || undefined,
    yearTo: yearTo || undefined,
    limit: '20',
    page: String(page),
  };

  const queryString = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join('&');

  const { data, isLoading } = useQuery({
    queryKey: ['antecedentes', queryString],
    queryFn: ({ signal }) =>
      fetch(`/api/projects?${queryString}`, { signal }).then((r) => r.json()),
  });

  const projects = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen size={22} className="text-primary" />
        <h2 className="text-2xl font-semibold">Antecedentes</h2>
      </div>
      <p className="text-sm text-muted">
        Explora proyectos culminados para consultar sus resúmenes y metodologías.
      </p>

      <Card.Root variant="secondary" className="border border-border">
        <Card.Content className="p-4 space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                aria-label="Buscar por tecnología o palabra clave"
                placeholder="Buscar por tecnología o palabra clave..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                startContent={<Search size={16} className="text-muted" />}
              />
            </div>
            <div className="w-44">
              <Select
                aria-label="Metodología"
                placeholder="Metodología"
                selectedKey={methodology ?? null}
                onSelectionChange={(key) => {
                  setMethodology(key === '' ? undefined : (key as string));
                  setPage(1);
                }}
              >
                <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                  <ListBox>
                    <ListBox.Item id="" textValue="Todas">
                      Todas
                    </ListBox.Item>
                    {METHODOLOGIES.map((m) => (
                      <ListBox.Item key={m} id={m} textValue={m}>
                        {m}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
            <div className="w-28">
              <Input
                aria-label="Año desde"
                placeholder="Año desde"
                type="number"
                value={yearFrom}
                onChange={(e) => {
                  setYearFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-28">
              <Input
                aria-label="Año hasta"
                placeholder="Año hasta"
                type="number"
                value={yearTo}
                onChange={(e) => {
                  setYearTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <Card.Root variant="secondary" className="border border-border">
          <Card.Content className="p-8 text-center text-muted">
            <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No se encontraron proyectos culminados con esos filtros.</p>
          </Card.Content>
        </Card.Root>
      ) : (
        <div className="space-y-3">
          {projects.map((project: any) => {
            const resumenFile = project.files?.find(
              (f: any) => f.fileType === 'RESUMEN',
            );
            const authors = project.authors
              ?.map((a: any) => `${a.firstName} ${a.lastName}`)
              .join(', ');

            return (
              <Card.Root
                key={project.id}
                variant="secondary"
                className="border border-border/70 hover:border-primary/30 transition-colors cursor-pointer"
                onPress={() => navigate(`/projects/${project.id}`)}
              >
                <Card.Content className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {project.title}
                      </h4>
                      <p className="text-xs text-muted mt-1">
                        {project.pnf?.name} &middot; {project.year}
                      </p>
                      {authors && (
                        <p className="text-xs text-muted mt-0.5">
                          Autores: {authors}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        {project.methodology && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {project.methodology}
                          </span>
                        )}
                        {resumenFile && (
                          <a
                            href={resumenFile.urlPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors inline-flex items-center gap-1"
                          >
                            <Download size={10} />
                            Resumen
                          </a>
                        )}
                      </div>
                    </div>
                    <FileText size={18} className="text-muted shrink-0 mt-1" />
                  </div>
                </Card.Content>
              </Card.Root>
            );
          })}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            variant="secondary"
            size="sm"
            isDisabled={page <= 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted flex items-center px-3">
            Página {meta.page} de {meta.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            isDisabled={page >= meta.totalPages}
            onPress={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
