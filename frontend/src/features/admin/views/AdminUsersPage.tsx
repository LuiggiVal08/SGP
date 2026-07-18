import { useState } from 'react';
import {
  Button,
  Input,
  Table,
  Chip,
  Modal,
  Select,
  ListBox,
  Spinner,
  Tooltip,
  useOverlayState,
} from '@heroui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { catalogService } from '@/features/catalogs/services/catalog.service';
import { Search, GraduationCap, BookOpen, Pencil, UserCog } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';
import { FieldLabel } from '@/shared/components/FieldLabel';
import { PhoneInputField } from '@/shared/components/PhoneInput';
import { usePnf } from '@/features/catalogs/hooks/usePnf';
import { useInstitutions } from '@/features/catalogs/hooks/useInstitutions';
import { updateUserSchema, type UpdateUserFormData } from '../schemas/update-user.schema';
import { extractApiError } from '@/shared/utils/extractApiError';
import { sileo } from 'sileo';
import type { CatalogUser, Pnf, Institution } from '@/shared/types/catalog.types';

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

const roleOptions: { id: UpdateUserFormData['roleName']; label: string }[] = [
  { id: 'STUDENT', label: 'Estudiante' },
  { id: 'DOCENTE', label: 'Docente' },
  { id: 'ADMIN', label: 'Administrador' },
  { id: 'IRCOP', label: 'Admin Suplente' },
];

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const editModal = useOverlayState();
  const [editing, setEditing] = useState<CatalogUser | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', roleFilter || undefined],
    queryFn: () => catalogService.getUsers(roleFilter || undefined),
    staleTime: 5 * 60 * 1000,
  });

  const { data: pnfs = [] } = usePnf();
  const { data: institutions = [] } = useInstitutions();

  const editForm = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    mode: 'onChange',
  });

  const updateMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => {
      const v = editForm.getValues();
      return catalogService.updateUser(id, {
        dni: v.dni,
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        roleName: v.roleName,
        pnfId: v.pnfId || undefined,
        institutionId: v.institutionId || undefined,
        phone: v.phone || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      sileo.success({ title: 'Usuario actualizado exitosamente', description: 'Los cambios han sido guardados.' });
      editModal.close();
      setEditing(null);
      editForm.reset();
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al actualizar el usuario'), description: 'Verifique los datos e intente nuevamente.' });
    },
  });

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const openEdit = (u: CatalogUser) => {
    setEditing(u);
    editForm.reset({
      dni: u.dni,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      roleName: (u.roleName as UpdateUserFormData['roleName']) ?? 'STUDENT',
      pnfId: u.pnfId ?? '',
      institutionId: u.institutionId ?? '',
      phone: u.phone ?? '',
    });
    editModal.open();
  };

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
          <div className="overflow-x-auto rounded-xl border border-border/60 max-h-[70vh]">
          <Table>
            <Table.Content aria-label="Usuarios">
              <Table.Header className="sticky top-0 z-10 bg-surface-secondary/95 backdrop-blur-sm [&_th]:text-xs [&_th]:font-semibold [&_th]:text-muted [&_th]:uppercase [&_th]:tracking-wider">
                <Table.Column id="dni" isRowHeader>DNI</Table.Column>
                <Table.Column id="name">Nombre</Table.Column>
                <Table.Column id="email">Email</Table.Column>
                <Table.Column id="role">Rol</Table.Column>
                <Table.Column id="actions" className="w-20">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                items={paginated}
                renderEmptyState={() => (
                  <EmptyState message={search ? 'No se encontraron usuarios.' : 'No hay usuarios registrados.'} />
                )}
              >
                {(u: CatalogUser) => (
                  <Table.Row className="even:bg-surface-secondary/30 hover:bg-primary/[0.06] transition-colors">
                    <Table.Cell>{u.dni}</Table.Cell>
                    <Table.Cell>{u.firstName} {u.lastName}</Table.Cell>
                    <Table.Cell>{u.email}</Table.Cell>
                    <Table.Cell>
                      <Chip color={roleColors[u.roleName] ?? 'default'} variant="soft" size="sm">
                        {roleLabels[u.roleName] ?? u.roleName}
                      </Chip>
                    </Table.Cell>
                    <Table.Cell>
                      <Tooltip>
                        <Tooltip.Trigger>
                          <button
                            onClick={() => openEdit(u)}
                            className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                            aria-label="Editar usuario"
                          >
                            <Pencil size={16} />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>Editar</Tooltip.Content>
                      </Tooltip>
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

      <Modal.Root state={editModal}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog className="sm:max-w-[560px] max-h-[85vh] flex flex-col overflow-hidden">
              <Modal.Header className="shrink-0">
                <Modal.Icon className="bg-default text-foreground">
                  <UserCog className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Editar Usuario</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="p-5 flex-1 overflow-y-auto">
                <div className="flex flex-wrap gap-3">
                  <div className="flex flex-col gap-1 flex-1 basis-40">
                    <FieldLabel label="Cédula" help="Cédula de identidad sin puntos ni guiones. Ej: 12345678" htmlFor="edit-user-dni" className="text-sm" />
                    <Input id="edit-user-dni" {...editForm.register('dni')} autoFocus />
                    {editForm.formState.errors.dni && (
                      <p className="text-danger text-xs">{editForm.formState.errors.dni.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-1 basis-40">
                    <FieldLabel label="Teléfono" help="Teléfono en formato internacional. Ej: +58 412 1234567" htmlFor="edit-user-phone" className="text-sm" />
                    <PhoneInputField
                      id="edit-user-phone"
                      value={editForm.watch('phone')}
                      onChange={(v) => editForm.setValue('phone', v ?? '', { shouldValidate: true })}
                      error={editForm.formState.errors.phone?.message}
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1 basis-40">
                    <FieldLabel label="Nombre" help="Nombre(s) del usuario" htmlFor="edit-user-first" className="text-sm" />
                    <Input id="edit-user-first" {...editForm.register('firstName')} />
                    {editForm.formState.errors.firstName && (
                      <p className="text-danger text-xs">{editForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-1 basis-40">
                    <FieldLabel label="Apellido" help="Apellido(s) del usuario" htmlFor="edit-user-last" className="text-sm" />
                    <Input id="edit-user-last" {...editForm.register('lastName')} />
                    {editForm.formState.errors.lastName && (
                      <p className="text-danger text-xs">{editForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 basis-full">
                    <FieldLabel label="Email" help="Correo electrónico válido. Será usado para iniciar sesión" htmlFor="edit-user-email" className="text-sm" />
                    <Input id="edit-user-email" type="email" {...editForm.register('email')} />
                    {editForm.formState.errors.email && (
                      <p className="text-danger text-xs">{editForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 basis-full">
                    <FieldLabel label="Rol" help="Rol del usuario en el sistema" htmlFor="edit-user-role" className="text-sm" />
                    <Select
                      id="edit-user-role"
                      aria-label="Rol"
                      placeholder="Seleccionar rol"
                      selectedKey={editForm.watch('roleName') || null}
                      onSelectionChange={(key) => {
                        editForm.setValue('roleName', key as UpdateUserFormData['roleName'], { shouldValidate: true });
                      }}
                    >
                      <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                        <ListBox>
                          {roleOptions.map((r) => (
                            <ListBox.Item key={r.id} id={r.id} textValue={r.label} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                              <ListBox.ItemIndicator />
                              {r.label}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                    {editForm.formState.errors.roleName && (
                      <p className="text-danger text-xs">{editForm.formState.errors.roleName.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-1 basis-40">
                    <FieldLabel label="PNF" help="Programa Nacional de Formación asignado" htmlFor="edit-user-pnf" className="text-sm" />
                    <Select
                      id="edit-user-pnf"
                      aria-label="PNF"
                      placeholder="Seleccionar PNF"
                      selectedKey={editForm.watch('pnfId') || null}
                      onSelectionChange={(key) => {
                        editForm.setValue('pnfId', (key as string) ?? '', { shouldValidate: true });
                      }}
                    >
                      <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                        <ListBox>
                          {pnfs.map((p: Pnf) => (
                            <ListBox.Item key={p.id} id={p.id} textValue={p.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                              <ListBox.ItemIndicator />
                              {p.name}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1 flex-1 basis-40">
                    <FieldLabel label="Institución" help="Institución a la que pertenece" htmlFor="edit-user-inst" className="text-sm" />
                    <Select
                      id="edit-user-inst"
                      aria-label="Institución"
                      placeholder="Seleccionar institución"
                      selectedKey={editForm.watch('institutionId') || null}
                      onSelectionChange={(key) => {
                        editForm.setValue('institutionId', (key as string) ?? '', { shouldValidate: true });
                      }}
                    >
                      <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                        <ListBox>
                          {institutions.map((inst: Institution) => (
                            <ListBox.Item key={inst.id} id={inst.id} textValue={inst.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                              <ListBox.ItemIndicator />
                              {inst.name}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer className="shrink-0">
                <Button className="w-full" variant="secondary" onPress={() => { editModal.close(); setEditing(null); editForm.reset(); }}>Cancelar</Button>
                <Button className="w-full" variant="primary" isDisabled={!editForm.formState.isValid || updateMutation.isPending} onPress={() => editing && updateMutation.mutate({ id: editing.id })}>
                  {updateMutation.isPending ? <Spinner size="sm" /> : 'Guardar'}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>
    </div>
  );
}
