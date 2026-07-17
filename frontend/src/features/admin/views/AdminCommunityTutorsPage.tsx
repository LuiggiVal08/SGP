import { useState } from 'react';
import { Button, Input, Table, Modal, Skeleton, Spinner, Tooltip, Select, ListBox } from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { catalogService } from '@/features/catalogs/services/catalog.service';
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { communityTutorSchema, type CommunityTutorFormData } from '../schemas/community-tutor.schema';
import type { CommunityTutor, CommunityPlace } from '@/shared/types/catalog.types';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useCommunityPlaces } from '@/features/catalogs/hooks/useCommunityPlaces';

const PER_PAGE = 10;

export default function AdminCommunityTutorsPage() {
  usePageTitle('Admin - Tutores Comunales');
  const queryClient = useQueryClient();
  const createModal = useOverlayState();
  const editModal = useOverlayState();
  const deleteModal = useOverlayState();
  const [editing, setEditing] = useState<CommunityTutor | null>(null);
  const [deleting, setDeleting] = useState<CommunityTutor | null>(null);

  const createForm = useForm<CommunityTutorFormData>({
    resolver: zodResolver(communityTutorSchema),
    mode: 'onChange',
    defaultValues: { locationId: '', fullName: '', dni: '', phone: '', email: '', position: '' },
  });

  const editForm = useForm<CommunityTutorFormData>({
    resolver: zodResolver(communityTutorSchema),
    mode: 'onChange',
  });

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['communityTutors', 'paginated', page, search],
    queryFn: ({ signal }) => catalogService.getCommunityTutorsPaginated(page, PER_PAGE, search || undefined, signal),
    placeholderData: (prev) => prev,
  });

  const { data: places = [] } = useCommunityPlaces();

  const tutors = result?.data ?? [];
  const totalPages = result?.meta?.totalPages ?? 1;

  const placeMap = Object.fromEntries(
    places.map((cp: CommunityPlace) => [cp.id, cp.name]),
  );

  const createMutation = useMutation({
    mutationFn: () => catalogService.createCommunityTutor(createForm.getValues()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityTutors'] });
      sileo.success({ title: 'Tutor comunal creado exitosamente', description: 'El tutor ya está disponible.' });
      createModal.close();
      createForm.reset();
    },
    onError: () => {
      sileo.error({ title: 'Error al crear el tutor comunal', description: 'Verifique los datos e intente nuevamente.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => catalogService.updateCommunityTutor(id, editForm.getValues()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityTutors'] });
      sileo.success({ title: 'Tutor comunal actualizado exitosamente', description: 'Los cambios han sido guardados.' });
      editModal.close();
      setEditing(null);
    },
    onError: () => {
      sileo.error({ title: 'Error al actualizar el tutor comunal', description: 'Ocurrió un problema al guardar.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteCommunityTutor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityTutors'] });
      sileo.success({ title: 'Tutor comunal eliminado exitosamente', description: 'El tutor ha sido removido.' });
      deleteModal.close();
      setDeleting(null);
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al eliminar el tutor comunal'), description: 'No se pudo eliminar el tutor comunal.' });
    },
  });

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const openEdit = (ct: CommunityTutor) => {
    setEditing(ct);
    editForm.reset({
      locationId: ct.locationId,
      fullName: ct.fullName ?? '',
      dni: ct.dni ?? '',
      phone: ct.phone ?? '',
      email: ct.email ?? '',
      position: ct.position ?? '',
    });
    editModal.open();
  };

  const openDelete = (ct: CommunityTutor) => {
    setDeleting(ct);
    deleteModal.open();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-2xl font-semibold pl-3">Tutores Comunales</h2>
        </div>
        <Button variant="primary" onPress={createModal.open}>
          <Plus size={16} />
          Nuevo Tutor
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm mb-4">
        <Search size={18} className="text-muted shrink-0" />
        <Input
          placeholder="Buscar por nombre…"
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
            <Table.Content aria-label="Tutores Comunales">
              <Table.Header>
                <Table.Column id="fullName" isRowHeader>Nombre</Table.Column>
                <Table.Column id="dni">DNI</Table.Column>
                <Table.Column id="position">Cargo</Table.Column>
                <Table.Column id="location">Espacio</Table.Column>
                <Table.Column id="actions" className="w-28">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                items={tutors}
                renderEmptyState={() => (
                  <EmptyState message={search ? 'No se encontraron tutores.' : 'No hay tutores comunales registrados.'} />
                )}
              >
                {(ct: CommunityTutor) => (
                  <Table.Row className="even:bg-surface-secondary/40 hover:bg-surface-secondary/80 hover:translate-x-0.5 transition-all duration-150">
                    <Table.Cell>{ct.fullName ?? '—'}</Table.Cell>
                    <Table.Cell className="text-muted text-sm">{ct.dni ?? '—'}</Table.Cell>
                    <Table.Cell className="text-muted text-sm">{ct.position ?? '—'}</Table.Cell>
                    <Table.Cell className="text-muted text-sm">{placeMap[ct.locationId] ?? '—'}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <Tooltip.Trigger>
                            <button
                              onClick={() => openEdit(ct)}
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
                              onClick={() => openDelete(ct)}
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
            <Modal.Dialog className="sm:max-w-[360px] max-h-[85vh] overflow-hidden">
              <Modal.Header>
                <Modal.Icon className="bg-default text-foreground">
                  <Users className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Nuevo Tutor Comunal</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="ct-location" className="text-sm">Espacio Comunal</label>
                  <Select
                    id="ct-location"
                    aria-label="Espacio Comunal"
                    placeholder="Seleccionar espacio"
                    selectedKey={createForm.watch('locationId') || null}
                    onSelectionChange={(key) => {
                      createForm.setValue('locationId', key as string, { shouldValidate: true });
                    }}
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {places.map((cp: CommunityPlace) => (
                          <ListBox.Item key={cp.id} id={cp.id} textValue={cp.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            <ListBox.ItemIndicator />
                            {cp.name}
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
                  <Input
                    id="ct-name"
                    {...createForm.register('fullName')}
                    placeholder="Ej: Juan Pérez"
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="ct-dni" className="text-sm">DNI</label>
                  <Input
                    id="ct-dni"
                    {...createForm.register('dni')}
                    placeholder="Ej: 1234567"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="ct-phone" className="text-sm">Teléfono</label>
                  <Input
                    id="ct-phone"
                    {...createForm.register('phone')}
                    placeholder="Ej: 021-123456"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="ct-email" className="text-sm">Email</label>
                  <Input
                    id="ct-email"
                    {...createForm.register('email')}
                    placeholder="Ej: juan@comunal.py"
                  />
                  {createForm.formState.errors.email && (
                    <p className="text-danger text-xs">{createForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="ct-position" className="text-sm">Cargo</label>
                  <Input
                    id="ct-position"
                    {...createForm.register('position')}
                    placeholder="Ej: Coordinador"
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button className="w-full" variant="secondary" onPress={() => { createModal.close(); createForm.reset(); }}>Cancelar</Button>
                <Button className="w-full" variant="primary" isDisabled={!createForm.formState.isValid || createMutation.isPending} onPress={() => createMutation.mutate()}>
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
            <Modal.Dialog className="sm:max-w-[360px] max-h-[85vh] overflow-hidden">
              <Modal.Header>
                <Modal.Icon className="bg-default text-foreground">
                  <Users className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Editar Tutor Comunal</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-ct-location" className="text-sm">Espacio Comunal</label>
                  <Select
                    id="edit-ct-location"
                    aria-label="Espacio Comunal"
                    placeholder="Seleccionar espacio"
                    selectedKey={editForm.watch('locationId') || null}
                    onSelectionChange={(key) => {
                      editForm.setValue('locationId', key as string, { shouldValidate: true });
                    }}
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {places.map((cp: CommunityPlace) => (
                          <ListBox.Item key={cp.id} id={cp.id} textValue={cp.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            <ListBox.ItemIndicator />
                            {cp.name}
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
                  <Input
                    id="edit-ct-name"
                    {...editForm.register('fullName')}
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-ct-dni" className="text-sm">DNI</label>
                  <Input
                    id="edit-ct-dni"
                    {...editForm.register('dni')}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-ct-phone" className="text-sm">Teléfono</label>
                  <Input
                    id="edit-ct-phone"
                    {...editForm.register('phone')}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-ct-email" className="text-sm">Email</label>
                  <Input
                    id="edit-ct-email"
                    {...editForm.register('email')}
                  />
                  {editForm.formState.errors.email && (
                    <p className="text-danger text-xs">{editForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-ct-position" className="text-sm">Cargo</label>
                  <Input
                    id="edit-ct-position"
                    {...editForm.register('position')}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button className="w-full" variant="secondary" onPress={() => { editModal.close(); setEditing(null); editForm.reset(); }}>Cancelar</Button>
                <Button className="w-full" variant="primary" isDisabled={!editForm.formState.isValid || updateMutation.isPending} onPress={() => editing && updateMutation.mutate({ id: editing.id })}>
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
                <Modal.Heading>Eliminar Tutor Comunal</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body>
                <p className="text-sm text-muted">
                  ¿Está seguro de eliminar al tutor <strong>{deleting?.fullName ?? '—'}</strong>? Esta acción no se puede deshacer.
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
