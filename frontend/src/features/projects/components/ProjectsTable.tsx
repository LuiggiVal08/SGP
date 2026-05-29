import { useState } from 'react';
import { Table, Chip, Input } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { Link } from 'react-router-dom';
import { projectService } from '../services/project.service';
import { Search } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';
import type { Project, ProjectStatus } from '../types/project.types';

const PER_PAGE = 10;

const statusConfig: Record<ProjectStatus, { color: 'success' | 'warning' | 'danger'; label: string }> = {
  COMPLETED: { color: 'success', label: 'Completado' },
  PENDING_VALIDATION: { color: 'warning', label: 'Pendiente' },
  REJECTED: { color: 'danger', label: 'Rechazado' },
};

export function ProjectsTable() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAll,
  });

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const filtered = search
    ? projects.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : projects;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 max-w-sm px-4">
        <Search size={18} className="text-muted shrink-0" />
        <Input
          placeholder="Buscar por título…"
          defaultValue=""
          onChange={(e) => debouncedSetSearch(e.target.value)}
        />
      </div>

      <Table>
        <Table.Content aria-label="Proyectos registrados">
          <Table.Header>
            <Table.Column id="title" isRowHeader>TÍTULO</Table.Column>
            <Table.Column id="year">AÑO</Table.Column>
            <Table.Column id="status">ESTADO</Table.Column>
          </Table.Header>
          <Table.Body
            items={paginated}
            renderEmptyState={() => (
              <EmptyState message={search ? 'No se encontraron proyectos.' : 'No hay proyectos registrados.'} />
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

      <Pagination current={page} total={totalPages} onChange={setPage} />
    </div>
  );
}
