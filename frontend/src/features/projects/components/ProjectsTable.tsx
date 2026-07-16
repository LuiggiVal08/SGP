import { useState, useMemo } from 'react';
import {
  Table, Chip, Input, Skeleton, Select, ListBox, Button,
} from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { Link } from 'react-router-dom';
import { projectService } from '../services/project.service';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';
import { usePnf } from '@/features/catalogs/hooks/usePnf';
import { useUsers } from '@/features/catalogs/hooks/useUsers';
import type { Project, ProjectFilters } from '../types/project.types';
import { statusConfig } from '@/shared/constants/statusConfig';

const PER_PAGE = 10;

interface ProjectsTableProps {
  authorId?: string;
}

export function ProjectsTable({ authorId }: ProjectsTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [sortDescriptor, setSortDescriptor] = useState<{ column: string; direction: 'ascending' | 'descending' }>({
    column: 'title',
    direction: 'ascending',
  });

  const { data: pnfs } = usePnf();
  const { data: tutors } = useUsers('DOCENTE');

  const mergedFilters: ProjectFilters = authorId ? { ...filters, authorId } : filters;

  const queryKey = ['projects', 'paginated', page, search, mergedFilters];
  const { data: result, isLoading, isError } = useQuery({
    queryKey,
    queryFn: ({ signal }) => projectService.getAllPaginated(
      page, PER_PAGE, search || undefined, mergedFilters, signal,
    ),
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });

  const projects = useMemo(() => {
    if (!result?.data) return [];
    const dir = sortDescriptor.direction === 'ascending' ? 1 : -1;
    return [...result.data].sort((a, b) => {
      const col = sortDescriptor.column;
      if (col === 'title') return a.title.localeCompare(b.title) * dir;
      if (col === 'year') return (a.year - b.year) * dir;
      if (col === 'status') return a.status.localeCompare(b.status) * dir;
      return 0;
    });
  }, [result, sortDescriptor]);
  const totalPages = result?.meta?.totalPages ?? 1;

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const updateFilter = (key: keyof ProjectFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearch('');
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined) || search;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Search size={18} className="text-muted shrink-0" />
          <Input
            aria-label="Buscar proyectos por título"
            placeholder="Buscar por título…"
            defaultValue=""
            onChange={(e) => debouncedSetSearch(e.target.value)}
          />
        </div>
        <Button
          variant={hasActiveFilters ? 'primary' : 'ghost'}
          size="sm"
          onPress={() => setShowFilters(!showFilters)}
          className="gap-1.5"
        >
          <Filter size={15} />
          Filtros
          {hasActiveFilters && (
            <span className="bg-primary-foreground text-primary text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              !
            </span>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-surface/50 border border-border">
          <div className="flex flex-col gap-1 min-w-36">
            <label className="text-xs text-muted">PNF</label>
            <Select
              aria-label="Filtrar por PNF"
              selectedKey={filters.pnfId || null}
              onSelectionChange={(key) => updateFilter('pnfId', key as string)}
              placeholder="Todas"
            >
              <Select.Trigger className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                <ListBox>
                  {(pnfs ?? []).map((c) => (
                    <ListBox.Item key={c.id} id={c.id} textValue={c.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                      {c.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
          <div className="flex flex-col gap-1 min-w-36">
            <label className="text-xs text-muted">Tutor</label>
            <Select
              aria-label="Filtrar por tutor"
              selectedKey={filters.tutorId || null}
              onSelectionChange={(key) => updateFilter('tutorId', key as string)}
              placeholder="Todos"
            >
              <Select.Trigger className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                <ListBox>
                  {(tutors ?? []).map((t) => (
                    <ListBox.Item key={t.id} id={t.id} textValue={`${t.firstName} ${t.lastName}`} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                      {t.firstName} {t.lastName}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
          <div className="flex flex-col gap-1 min-w-32">
            <label className="text-xs text-muted">Estado</label>
            <Select
              aria-label="Filtrar por estado"
              selectedKey={filters.status || null}
              onSelectionChange={(key) => updateFilter('status', key as string)}
              placeholder="Todos"
            >
              <Select.Trigger className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                <ListBox>
                  {(['COMPLETED', 'PENDING_VALIDATION', 'REJECTED'] as const).map((s) => (
                    <ListBox.Item key={s} id={s} textValue={statusConfig[s].label} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                      {statusConfig[s].label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
          <div className="flex flex-col gap-1 min-w-28">
            <label className="text-xs text-muted">Año desde</label>
            <Input
              aria-label="Año desde"
              type="number"
              placeholder="Ej: 2020"
              value={filters.yearFrom?.toString() ?? ''}
              onChange={(e) => updateFilter('yearFrom', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div className="flex flex-col gap-1 min-w-28">
            <label className="text-xs text-muted">Año hasta</label>
            <Input
              aria-label="Año hasta"
              type="number"
              placeholder="Ej: 2025"
              value={filters.yearTo?.toString() ?? ''}
              onChange={(e) => updateFilter('yearTo', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onPress={clearFilters} className="gap-1 text-muted">
              <X size={14} />
              Limpiar
            </Button>
          )}
        </div>
      )}

      {isError ? (
        <div className="text-center py-12">
          <p className="text-danger mb-2">Error al cargar los datos</p>
          <p className="text-sm text-muted mb-4">Verifique su conexión e intente nuevamente.</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-3/4 rounded-lg" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <Table.Content
              aria-label="Proyectos registrados"
              sortDescriptor={sortDescriptor}
              onSortChange={(desc) => setSortDescriptor(desc as { column: string; direction: 'ascending' | 'descending' })}
            >
              <Table.Header>
                <Table.Column id="title" allowsSorting isRowHeader>
                  <div className="flex items-center gap-1">
                    TÍTULO
                    <ArrowUpDown size={12} className="text-muted" />
                  </div>
                </Table.Column>
                <Table.Column id="year" allowsSorting>
                  <div className="flex items-center gap-1">
                    AÑO
                    <ArrowUpDown size={12} className="text-muted" />
                  </div>
                </Table.Column>
                <Table.Column id="status" allowsSorting>
                  <div className="flex items-center gap-1">
                    ESTADO
                    <ArrowUpDown size={12} className="text-muted" />
                  </div>
                </Table.Column>
              </Table.Header>
              <Table.Body
                items={projects}
                renderEmptyState={() => (
                  <EmptyState message={search || hasActiveFilters ? 'No se encontraron proyectos.' : 'No hay proyectos registrados.'} />
                )}
              >
                {(p: Project) => (
                  <Table.Row className="even:bg-surface-secondary/40 hover:bg-surface-secondary/70 transition-colors">
                    <Table.Cell>
                      <Link
                        to={`/projects/${p.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {p.title}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>{p.year}</Table.Cell>
                    <Table.Cell>
                      <Chip color={statusConfig[p.status].color} variant="soft" size="sm">
                        {statusConfig[p.status].label}
                      </Chip>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table>
        </div>
      )}

      <Pagination current={page} total={totalPages} onChange={setPage} />
    </div>
  );
}
