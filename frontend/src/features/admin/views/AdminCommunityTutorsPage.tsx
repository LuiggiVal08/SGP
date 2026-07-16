import { useState } from 'react';
import { Button, Input, Table, Modal, Skeleton, Spinner, Tooltip, Select, ListBox } from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { useDebouncedCallback } from 'use-debounce';
import { Plus, Search, Pencil, Trash2, UserRound } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { communityTutorSchema, type CommunityTutorFormData } from '../schemas/communityTutor.schema';
import { useCommunityTutors, useCommunityTutorMutations } from '@/features/catalogs/hooks/useCommunityTutors';
import { useCommunityPlaces } from '@/features/catalogs/hooks/useCommunityPlaces';
import type { CommunityPlace, CommunityTutor } from '@/shared/types/catalog.types';

const PER_PAGE = 10;

export default function AdminCommunityTutorsPage() {
  usePageTitle('Admin - Tutores Comunitarios');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<CommunityTutor | null>(null);
  const [deleting, setDeleting] = useState<CommunityTutor | null>(null);

  const createModal = useOverlayState();
  const editModal = useOverlayState();
  const deleteModal = useOverlayState();

  const createForm = useForm<CommunityTutorFormData>({
    resolver: zodResolver(communityTutorSchema) as never,
    mode: 'onChange',
    defaultValues: { locationId: '', fullName: '', dni: '', phone: '', email: '', position: '' },
  });

  const editForm = useForm<CommunityTutorFormData>({
    resolver: zodResolver(communityTutorSchema) as never,
    mode: 'onChange',
  });

  const { data: result, isLoading, isError } = useCommunityTutors(page, search);
  const { data: places = [] } = useCommunityPlaces(1, '');
  const { createMutation, updateMutation, deleteMutation } = useCommunityTutorMutations();

  const tutors = result?.data ?? [];
  const totalPages = result?.meta?.totalPages ?? 1;

  const placeMap = Object.fromEntries(places.map((p: CommunityPlace) => [p.id, p.name]));

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const openEdit = (t: CommunityTutor) => {
    setEditing(t);
    editForm.reset({
      locationId: t.locationId,
      fullName: t.fullName ?? '',
      dni: t.dni ?? '',
      phone: t.phone ?? '',
      email: t.email ?? '',
      position: t.position ?? '',
    });
    editModal.open();
  };

  const openDelete = (t: CommunityTutor) => {
    setDeleting(t);
    deleteModal.open();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-2xl font-semibold pl-3">Tutores Comunitarios</h2>
        </div>
        <Button variant="primary" onPress={createModal.open}>
          <Plus size={16} />
          Nuevo Tutor
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm mb-4">
        <Search size={18} className="text-muted shrink-0" />
        <Input
          placeholder="Buscar por nombre, cédula o correo…"
          defaultValue=""
          onChange={(e) => debouncedSetSearch(e.target.value)}
        />
      </div>

      {isError ? (
        <div className="text-center py-12">
          <p className="text-danger mb-2">Error al cargar los datos</p>
          <p className="text-sm text-muted mb-4">Verifique su conexión e intente nuevamente.</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-3/4 rounded-lg" />
        </div>
      ) : (
        <>
          <Table>
            <Table.Content aria-label="Tutores Comunitarios">
              <Table.Header>
                <Table.Column id="fullName" isRowHeader>Nombre</Table.Column>
                <Table.Column id="location">Espacio</Table.Column>
                <Table.Column id="position">Cargo</Table.Column>
                <Table.Column id="actions" className="w-28">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                items={tutors}
                renderEmptyState={() => (
                  <EmptyState message={search ? 'No se encontraron tutores.' : 'No hay tutores registrados.'} />
                )}
              >
                {(t: CommunityTutor) => (
                  <Table.Row className="even:bg-surface-secondary/40 hover:bg-surface-secondary/80 hover:translate-x-0.5 transition-all duration-150">
                    <Table.Cell>{t.fullName ?? '—'}</Table.Cell>
                    <Table.Cell className="text-muted text-sm">{placeMap[t.locationId] ?? '—'}</Table.Cell>
                    <Table.Cell className="text-muted text-sm">{t.position ?? '—'}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <Tooltip.Trigger>
                            <button
                              onClick={() => openEdit(t)}
                              className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                              aria-label="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Content>Editar</Tooltip.Content>
                        </Tooltip>
                        <Tooltip>
                          <Tooltip.Trigger>
                            <button
                              onClick={() => openDelete(t)}
                              className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                              aria-label="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Content>Eliminar</Tooltip.Content>
                        </Tooltip>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table>
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </>
      )}

      <Modal.Root state={createModal}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog className="sm:max-w-[420px] max-h-[85vh] overflow-hidden">
              <Modal.Header>
                <Modal.Icon className="bg-default text-foreground">
                  <UserRound className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Nuevo Tutor Comunitario</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-3 overflow-y-auto">
                <div className="flex flex-col gap-1">
                  <label htmlFor="ct-location" className="text-sm">Espacio comunitario</label>
                  <Select
                    id="ct-location"
                    aria-label="Espacio comunitario"
                    placeholder="Seleccionar espacio"
                    selectedKey={createForm.watch('locationId') || null}
                    onSelectionChange={(key) => createForm.setValue('locationId', key as string, { shouldValidate: true })}
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {places.map((p: CommunityPlace) => (
                          <ListBox.Item key={p.id} id={p.id} textValue={p.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            {p.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {createForm.formState.errors.locationId && (
                    <p className="text-danger text-xs">{createForm.formState.errors.locationId.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="ct-name" className="text-sm">Nombre completo</label>
                  <Input id="ct-name" {...createForm.register('fullName')} autoFocus />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="ct-dni" className="text-sm">Cédula</label>
                    <Input id="ct-dni" {...createForm.register('dni')} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="ct-phone" className="text-sm">Teléfono</label>
                    <Input id="ct-phone" {...createForm.register('phone')} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="ct-email" className="text-sm">Email</label>
                  <Input id="ct-email" {...createForm.register('email')} />
                  {createForm.formState.errors.email && (
                    <p className="text-danger text-xs">{createForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="ct-position" className="text-sm">Cargo</label>
                  <Input id="ct-position" {...createForm.register('position')} />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button className="w-full" variant="secondary" onPress={() => { createModal.close(); createForm.reset(); }}>Cancelar</Button>
                <Button className="w-full" variant="primary" isDisabled={!createForm.formState.isValid || createMutation.isPending} onPress={() => createMutation.mutate(createForm.getValues())}>
                  {createMutation.isPending ? <Spinner size="sm" /> : 'Crear'}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>

      <Modal.Root state={editModal}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog className="sm:max-w-[420px] max-h-[85vh] overflow-hidden">
              <Modal.Header>
                <Modal.Icon className="bg-default text-foreground">
                  <UserRound className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Editar Tutor Comunitario</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-3 overflow-y-auto">
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-ct-location" className="text-sm">Espacio comunitario</label>
                  <Select
                    id="edit-ct-location"
                    aria-label="Espacio comunitario"
                    placeholder="Seleccionar espacio"
                    selectedKey={editForm.watch('locationId') || null}
                    onSelectionChange={(key) => editForm.setValue('locationId', key as string, { shouldValidate: true })}
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {places.map((p: CommunityPlace) => (
                          <ListBox.Item key={p.id} id={p.id} textValue={p.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            {p.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {editForm.formState.errors.locationId && (
                    <p className="text-danger text-xs">{editForm.formState.errors.locationId.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-ct-name" className="text-sm">Nombre completo</label>
                  <Input id="edit-ct-name" {...editForm.register('fullName')} autoFocus />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="edit-ct-dni" className="text-sm">Cédula</label>
                    <Input id="edit-ct-dni" {...editForm.register('dni')} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="edit-ct-phone" className="text-sm">Teléfono</label>
                    <Input id="edit-ct-phone" {...editForm.register('phone')} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-ct-email" className="text-sm">Email</label>
                  <Input id="edit-ct-email" {...editForm.register('email')} />
                  {editForm.formState.errors.email && (
                    <p className="text-danger text-xs">{editForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-ct-position" className="text-sm">Cargo</label>
                  <Input id="edit-ct-position" {...editForm.register('position')} />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button className="w-full" variant="secondary" onPress={() => { editModal.close(); setEditing(null); editForm.reset(); }}>Cancelar</Button>
                <Button className="w-full" variant="primary" isDisabled={!editForm.formState.isValid || updateMutation.isPending} onPress={() => editing && updateMutation.mutate({ id: editing.id, payload: editForm.getValues() })}>
                  {updateMutation.isPending ? <Spinner size="sm" /> : 'Guardar'}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>

      <Modal.Root state={deleteModal}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog className="sm:max-w-[360px] max-h-[85vh] overflow-hidden">
              <Modal.Header>
                <Modal.Icon className="bg-danger/10 text-danger">
                  <Trash2 className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Eliminar Tutor</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body>
                <p className="text-sm text-muted">
                  ¿Está seguro de eliminar <strong>{deleting?.fullName}</strong>? Esta acción no se puede deshacer.
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button className="w-full" variant="secondary" onPress={() => { deleteModal.close(); setDeleting(null); }} autoFocus>Cancelar</Button>
                <Button className="w-full" variant="danger" isDisabled={deleteMutation.isPending} onPress={() => deleting && deleteMutation.mutate(deleting.id)}>
                  {deleteMutation.isPending ? <Spinner size="sm" /> : 'Eliminar'}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>
    </div>
  );
}
