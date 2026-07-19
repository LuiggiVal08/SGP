import { useState } from 'react';
import { Button, Input, Table, Modal, Skeleton, Spinner, Tooltip, Select, ListBox } from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { catalogService } from '@/features/catalogs/services/catalog.service';
import { Plus, Search, Pencil, Trash2, MapPin } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { FieldLabel } from '@/shared/components/FieldLabel';
import { Pagination } from '@/shared/components/Pagination';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { communityPlaceSchema, type CommunityPlaceFormData, type CommunityPlaceFormInput } from '../schemas/community-place.schema';
import type { CommunityPlace, Institution } from '@/shared/types/catalog.types';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useInstitutions } from '@/features/catalogs/hooks/useInstitutions';

const PER_PAGE = 10;
const PLACE_TYPES = ['COMMUNITY', 'ORGANIZATION', 'INSTITUTION', 'COMPANY'] as const;

export default function AdminCommunityPlacesPage() {
  usePageTitle('Admin - Espacios Comunales');
  const queryClient = useQueryClient();
  const createModal = useOverlayState();
  const editModal = useOverlayState();
  const deleteModal = useOverlayState();
  const [editing, setEditing] = useState<CommunityPlace | null>(null);
  const [deleting, setDeleting] = useState<CommunityPlace | null>(null);

  const createForm = useForm<CommunityPlaceFormInput, unknown, CommunityPlaceFormData>({
    resolver: zodResolver(communityPlaceSchema),
    mode: 'onChange',
    defaultValues: { institutionId: '', name: '', type: 'COMMUNITY', description: '', address: '', contactPhone: '', contactEmail: '' },
  });

  const editForm = useForm<CommunityPlaceFormInput, unknown, CommunityPlaceFormData>({
    resolver: zodResolver(communityPlaceSchema),
    mode: 'onChange',
  });

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['communityPlaces', 'paginated', page, search],
    queryFn: ({ signal }) => catalogService.getCommunityPlacesPaginated(page, PER_PAGE, search || undefined, signal),
    placeholderData: (prev) => prev,
  });

  const { data: institutions = [] } = useInstitutions();

  const places = result?.data ?? [];
  const totalPages = result?.meta?.totalPages ?? 1;

  const institutionMap = Object.fromEntries(
    institutions.map((i: Institution) => [i.id, i.name]),
  );

  const createMutation = useMutation({
    mutationFn: () => catalogService.createCommunityPlace(createForm.getValues()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPlaces'] });
      sileo.success({ title: 'Espacio comunal creado exitosamente', description: 'El espacio ya está disponible.' });
      createModal.close();
      createForm.reset();
    },
    onError: () => {
      sileo.error({ title: 'Error al crear el espacio comunal', description: 'Verifique los datos e intente nuevamente.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => catalogService.updateCommunityPlace(id, editForm.getValues()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPlaces'] });
      sileo.success({ title: 'Espacio comunal actualizado exitosamente', description: 'Los cambios han sido guardados.' });
      editModal.close();
      setEditing(null);
    },
    onError: () => {
      sileo.error({ title: 'Error al actualizar el espacio comunal', description: 'Ocurrió un problema al guardar.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteCommunityPlace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPlaces'] });
      sileo.success({ title: 'Espacio comunal eliminado exitosamente', description: 'El espacio ha sido removido.' });
      deleteModal.close();
      setDeleting(null);
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al eliminar el espacio comunal'), description: 'No se pudo eliminar el espacio comunal.' });
    },
  });

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const openEdit = (cp: CommunityPlace) => {
    setEditing(cp);
    editForm.reset({
      institutionId: cp.institutionId,
      name: cp.name,
      type: cp.type as CommunityPlaceFormData['type'],
      description: cp.description ?? '',
      address: cp.address ?? '',
      contactPhone: cp.contactPhone ?? '',
      contactEmail: cp.contactEmail ?? '',
    });
    editModal.open();
  };

  const openDelete = (cp: CommunityPlace) => {
    setDeleting(cp);
    deleteModal.open();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-2xl font-semibold pl-3">Espacios Comunales</h2>
        </div>
        <Button variant="primary" onPress={createModal.open}>
          <Plus size={16} />
          Nuevo Espacio
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
          <div className="overflow-x-auto rounded-xl border border-border/60 max-h-[70vh]">
          <Table>
            <Table.Content aria-label="Espacios Comunales">
              <Table.Header className="sticky top-0 z-10 bg-surface-secondary/95 backdrop-blur-sm [&_th]:text-xs [&_th]:font-semibold [&_th]:text-muted [&_th]:uppercase [&_th]:tracking-wider">
                <Table.Column id="name" isRowHeader>Nombre</Table.Column>
                <Table.Column id="type">Tipo</Table.Column>
                <Table.Column id="institution">Institución</Table.Column>
                <Table.Column id="address">Dirección</Table.Column>
                <Table.Column id="actions" className="w-28">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                items={places}
                renderEmptyState={() => (
                  <EmptyState message={search ? 'No se encontraron espacios.' : 'No hay espacios comunales registrados.'} />
                )}
              >
                {(cp: CommunityPlace) => (
                  <Table.Row className="even:bg-surface-secondary/30 hover:bg-primary/[0.06] transition-colors">
                    <Table.Cell>{cp.name}</Table.Cell>
                    <Table.Cell className="text-muted text-sm">{cp.type}</Table.Cell>
                    <Table.Cell className="text-muted text-sm">{institutionMap[cp.institutionId] ?? '—'}</Table.Cell>
                    <Table.Cell className="text-muted text-sm">{cp.address ?? '—'}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <Tooltip.Trigger>
                            <button
                              onClick={() => openEdit(cp)}
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
                              onClick={() => openDelete(cp)}
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
          </div>
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </>
      )}

      <Modal.Root state={createModal}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog className="sm:max-w-[440px] max-h-[85vh] flex flex-col overflow-hidden">
              <Modal.Header className="shrink-0">
                <Modal.Icon className="bg-default text-foreground">
                  <MapPin className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Nuevo Espacio Comunal</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-5 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Nombre" help="Nombre del espacio o comunidad. Ej: Consejo Comunal Los Andes" htmlFor="cp-name" className="text-sm" />
                  <Input
                    id="cp-name"
                    {...createForm.register('name')}
                    placeholder="Ej: Consejo Comunal El Carmen"
                    autoFocus
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-danger text-xs">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Institución" help="Institución educativa a la que pertenece" htmlFor="cp-institution" className="text-sm" />
                  <Select
                    id="cp-institution"
                    aria-label="Institución"
                    placeholder="Seleccionar institución"
                    selectedKey={createForm.watch('institutionId') || null}
                    onSelectionChange={(key) => {
                      createForm.setValue('institutionId', key as string, { shouldValidate: true });
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
                  {createForm.formState.errors.institutionId && (
                    <p className="text-danger text-xs">{createForm.formState.errors.institutionId.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Tipo" help="Tipo de espacio: Comunidad, Organización, Institución o Empresa" htmlFor="cp-type" className="text-sm" />
                  <Select
                    id="cp-type"
                    aria-label="Tipo"
                    placeholder="Seleccionar tipo"
                    selectedKey={createForm.watch('type') || null}
                    onSelectionChange={(key) => {
                      createForm.setValue('type', key as CommunityPlaceFormData['type'], { shouldValidate: true });
                    }}
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {PLACE_TYPES.map((t) => (
                          <ListBox.Item key={t} id={t} textValue={t} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            <ListBox.ItemIndicator />
                            {t}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {createForm.formState.errors.type && (
                    <p className="text-danger text-xs">{createForm.formState.errors.type.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Descripción" help="Descripción breve del espacio comunitario" htmlFor="cp-description" className="text-sm" />
                  <Input
                    id="cp-description"
                    {...createForm.register('description')}
                    placeholder="Descripción opcional"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Dirección" help="Dirección física del espacio" htmlFor="cp-address" className="text-sm" />
                  <Input
                    id="cp-address"
                    {...createForm.register('address')}
                    placeholder="Dirección opcional"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Teléfono" help="Teléfono de contacto del espacio" htmlFor="cp-phone" className="text-sm" />
                  <Input
                    id="cp-phone"
                    {...createForm.register('contactPhone')}
                    placeholder="Ej: 021-123456"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Email" help="Correo de contacto del espacio" htmlFor="cp-email" className="text-sm" />
                  <Input
                    id="cp-email"
                    {...createForm.register('contactEmail')}
                    placeholder="Ej: contacto@comunal.py"
                  />
                  {createForm.formState.errors.contactEmail && (
                    <p className="text-danger text-xs">{createForm.formState.errors.contactEmail.message}</p>
                  )}
                </div>
              </Modal.Body>
              <Modal.Footer className="shrink-0">
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
            <Modal.Dialog className="sm:max-w-[440px] max-h-[85vh] flex flex-col overflow-hidden">
              <Modal.Header className="shrink-0">
                <Modal.Icon className="bg-default text-foreground">
                  <MapPin className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Editar Espacio Comunal</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-5 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Nombre" help="Nombre del espacio o comunidad. Ej: Consejo Comunal Los Andes" htmlFor="edit-cp-name" className="text-sm" />
                  <Input
                    id="edit-cp-name"
                    {...editForm.register('name')}
                    autoFocus
                  />
                  {editForm.formState.errors.name && (
                    <p className="text-danger text-xs">{editForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Institución" help="Institución educativa a la que pertenece" htmlFor="edit-cp-institution" className="text-sm" />
                  <Select
                    id="edit-cp-institution"
                    aria-label="Institución"
                    placeholder="Seleccionar institución"
                    selectedKey={editForm.watch('institutionId') || null}
                    onSelectionChange={(key) => {
                      editForm.setValue('institutionId', key as string, { shouldValidate: true });
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
                  {editForm.formState.errors.institutionId && (
                    <p className="text-danger text-xs">{editForm.formState.errors.institutionId.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Tipo" help="Tipo de espacio: Comunidad, Organización, Institución o Empresa" htmlFor="edit-cp-type" className="text-sm" />
                  <Select
                    id="edit-cp-type"
                    aria-label="Tipo"
                    placeholder="Seleccionar tipo"
                    selectedKey={editForm.watch('type') || null}
                    onSelectionChange={(key) => {
                      editForm.setValue('type', key as CommunityPlaceFormData['type'], { shouldValidate: true });
                    }}
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {PLACE_TYPES.map((t) => (
                          <ListBox.Item key={t} id={t} textValue={t} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            <ListBox.ItemIndicator />
                            {t}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {editForm.formState.errors.type && (
                    <p className="text-danger text-xs">{editForm.formState.errors.type.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Descripción" help="Descripción breve del espacio comunitario" htmlFor="edit-cp-description" className="text-sm" />
                  <Input
                    id="edit-cp-description"
                    {...editForm.register('description')}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Dirección" help="Dirección física del espacio" htmlFor="edit-cp-address" className="text-sm" />
                  <Input
                    id="edit-cp-address"
                    {...editForm.register('address')}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Teléfono" help="Teléfono de contacto del espacio" htmlFor="edit-cp-phone" className="text-sm" />
                  <Input
                    id="edit-cp-phone"
                    {...editForm.register('contactPhone')}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Email" help="Correo de contacto del espacio" htmlFor="edit-cp-email" className="text-sm" />
                  <Input
                    id="edit-cp-email"
                    {...editForm.register('contactEmail')}
                  />
                  {editForm.formState.errors.contactEmail && (
                    <p className="text-danger text-xs">{editForm.formState.errors.contactEmail.message}</p>
                  )}
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

      <Modal.Root state={deleteModal}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog className="sm:max-w-[440px] max-h-[85vh] flex flex-col overflow-hidden">
              <Modal.Header className="shrink-0">
                <Modal.Icon className="bg-danger/10 text-danger">
                  <Trash2 className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Eliminar Espacio Comunal</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="p-5 flex-1 overflow-y-auto">
                <p className="text-sm text-muted">
                  ¿Está seguro de eliminar <strong>{deleting?.name}</strong>? Esta acción no se puede deshacer.
                </p>
              </Modal.Body>
              <Modal.Footer className="shrink-0">
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
