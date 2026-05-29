import { useState } from 'react';
import { Button, Input, Table, Chip, Modal } from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { catalogService } from '@/features/catalogs/services/catalog.service';
import { useCareers } from '@/features/catalogs/hooks/useCareers';
import { useInstitutions } from '@/features/catalogs/hooks/useInstitutions';
import { UserPlus, Search } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';
import { useToastStore } from '@/shared/store/toast.store';
import type { CatalogUser } from '@/shared/types/catalog.types';

const PER_PAGE = 10;

const roleColors: Record<string, 'success' | 'warning' | 'default'> = {
  ADMIN: 'success',
  TUTOR: 'warning',
  STUDENT: 'default',
};

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  TUTOR: 'Tutor',
  STUDENT: 'Estudiante',
};

const roles = [
  { value: 'STUDENT', label: 'Estudiante' },
  { value: 'TUTOR', label: 'Tutor' },
  { value: 'ADMIN', label: 'Administrador' },
];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const modal = useOverlayState();
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    dni: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleName: 'STUDENT',
    careerId: '',
    institutionId: '',
  });

  const { data: careers = [] } = useCareers();
  const { data: institutions = [] } = useInstitutions();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', roleFilter || undefined],
    queryFn: () => catalogService.getUsers(roleFilter || undefined),
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: () => catalogService.createUser(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      addToast('Usuario registrado exitosamente', 'success');
      modal.close();
      setForm({ dni: '', firstName: '', lastName: '', email: '', password: '', roleName: 'STUDENT', careerId: '', institutionId: '' });
    },
    onError: () => {
      addToast('Error al registrar el usuario', 'error');
    },
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

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const isValid =
    form.dni.trim() &&
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.password.trim();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Usuarios</h2>
        <Button variant="primary" onPress={modal.open}>
          <UserPlus size={16} />
          Nuevo Usuario
        </Button>
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
          <option value="TUTOR">Tutores</option>
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

      <Modal.Root state={modal}>
        <Modal.Backdrop>
          <Modal.Container size="md">
            <Modal.Dialog className="sm:max-w-[480px]">
              <Modal.Header>
                <Modal.Icon className="bg-default text-foreground">
                  <UserPlus className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Registrar Usuario</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm">Cédula</label>
                  <Input value={form.dni} onChange={(e) => set('dni', e.target.value)} placeholder="Ej: 1234567" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm">Nombre</label>
                    <Input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Ej: Juan" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm">Apellido</label>
                    <Input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Ej: Pérez" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm">Email</label>
                  <Input value={form.email} onChange={(e) => set('email', e.target.value)} type="email" placeholder="Ej: juan@example.com" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm">Contraseña</label>
                  <Input value={form.password} onChange={(e) => set('password', e.target.value)} type="password" placeholder="••••••••" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm">Rol</label>
                  <select
                    value={form.roleName}
                    onChange={(e) => set('roleName', e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                  >
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm">Carrera</label>
                  <select
                    value={form.careerId}
                    onChange={(e) => set('careerId', e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                  >
                    <option value="">Seleccionar carrera</option>
                    {careers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm">Institución</label>
                  <select
                    value={form.institutionId}
                    onChange={(e) => set('institutionId', e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                  >
                    <option value="">Seleccionar institución</option>
                    {institutions.map((i) => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button className="w-full" variant="secondary" onPress={() => { modal.close(); setForm({ dni: '', firstName: '', lastName: '', email: '', password: '', roleName: 'STUDENT', careerId: '', institutionId: '' }); }}>Cancelar</Button>
                <Button className="w-full" variant="primary" isDisabled={!isValid || createMutation.isPending} onPress={() => createMutation.mutate()}>
                  {createMutation.isPending ? 'Registrando…' : 'Registrar'}
                </Button>
              </Modal.Footer>
              {createMutation.isError && (
                <p className="text-danger text-xs text-center">Error al registrar. Verifique los datos.</p>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>
    </div>
  );
}
