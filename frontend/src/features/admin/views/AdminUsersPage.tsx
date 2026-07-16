import { useState } from 'react';
import { Button, Input, Table, Chip } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { useNavigate } from 'react-router-dom';
import { catalogService } from '@/features/catalogs/services/catalog.service';
import { Search, GraduationCap, BookOpen } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';
import type { CatalogUser } from '@/shared/types/catalog.types';

const PER_PAGE = 10;

const roleColors: Record<string, 'success' | 'warning' | 'default'> = {
  ADMIN: 'success',
  IRCOP: 'success',
  DOCENTE: 'warning',
  STUDENT: 'default',
};

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  IRCOP: 'Admin Suplente',
  DOCENTE: 'Docente',
  STUDENT: 'Estudiante',
};

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', roleFilter || undefined],
    queryFn: () => catalogService.getUsers(roleFilter || undefined),
    staleTime: 5 * 60 * 1000,
  });

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const filtered = search
    ? users.filter(
        (u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      )
    : users;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-2xl font-semibold pl-3">Usuarios</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" onPress={() => navigate('/admin/students/register')}>
            <GraduationCap size={16} />
            Registrar Estudiante
          </Button>
          <Button variant="primary" onPress={() => navigate('/admin/professors/register')}>
            <BookOpen size={16} />
            Registrar Docente
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 max-w-sm flex-1">
          <Search size={18} className="text-muted shrink-0" />
          <Input
            placeholder="Buscar por nombre o email…"
            defaultValue=""
            onChange={(e) => debouncedSetSearch(e.target.value)}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        >
          <option value="">Todos los roles</option>
          <option value="ADMIN">Administradores</option>
          <option value="DOCENTE">Docentes</option>
          <option value="STUDENT">Estudiantes</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-muted text-center py-8">Cargando…</p>
      ) : (
        <>
          <Table>
            <Table.Content aria-label="Usuarios">
              <Table.Header>
                <Table.Column id="dni" isRowHeader>DNI</Table.Column>
                <Table.Column id="name">Nombre</Table.Column>
                <Table.Column id="email">Email</Table.Column>
                <Table.Column id="role">Rol</Table.Column>
              </Table.Header>
              <Table.Body
                items={paginated}
                renderEmptyState={() => (
                  <EmptyState message={search ? 'No se encontraron usuarios.' : 'No hay usuarios registrados.'} />
                )}
              >
                {(u: CatalogUser) => (
                  <Table.Row className="even:bg-surface-secondary/40 hover:bg-surface-secondary/70 transition-colors">
                    <Table.Cell>{u.dni}</Table.Cell>
                    <Table.Cell>{u.firstName} {u.lastName}</Table.Cell>
                    <Table.Cell>{u.email}</Table.Cell>
                    <Table.Cell>
                      <Chip color={roleColors[u.roleName] ?? 'default'} variant="soft" size="sm">
                        {roleLabels[u.roleName] ?? u.roleName}
                      </Chip>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table>
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
